const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const authMiddleware = require("../middlewares/auth");
const Payment = require("../models/payment");
const { membershipAmount } = require("../utils/constants");
const razorpayInstance = require("../utils/razorpay");
const express = require("express");
const User = require("../models/user");
const paymentRouter = express.Router();

paymentRouter.post("/payment/create", authMiddleware, async (req, res) => {
  const user = req.user;
  const { membershipType } = req.body;

  try {
    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100 || 30000,
      currency: "INR",
      receipt: user._id.toString(),
      notes: {
        firstName: user.firstName,
        lastName: user.lastName,
        membershipType,
      },
    });
    console.log(order, "order created successfully");
    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      amount: order.amount || 300,
      currency: order.currency || "INR",
      status: order.status || "created",
      receipt: order.receipt || user._id.toString(),
      notes: order.notes,
    });
    const savedPayment = await payment.save();
    console.log(savedPayment, "payment saved successfully");
    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
});

paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    console.log("webhook called");
    const webhookSignature = req.get("X-Razorpay-Signature");
    console.log("webhookSignature", webhookSignature);
    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );
    if (!isWebhookValid) {
      console.log("webhook signature is invalid");
      return res.status(401).json({ message: "Invalid webhook signature" });
    }
    console.log("webhook signature is valid");
    // Udpate my payment Status in DB
    const paymentDetails = req.body.payload.payment.entity;
    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
    payment.status = paymentDetails.status;
    await payment.save();
    console.log("payment status updated successfully", payment);

    const user = await User.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.membershipType = paymentDetails.notes.membershipType;
    await user.save();
    console.log("user membership updated successfully", user);
    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
});

module.exports = paymentRouter;
