require("dotenv").config({ path: "../../.env" });
const cron = require("node-cron");
const sendEmail = require("../utils/emailservice");
const ConnectionRequest = require("../models/connectionRequest");
const { subDay, startOfDay, endOfDay } = require("date-fns");
cron.schedule("* * * * *", async () => {
  console.log("cron triggered");
  const yesterDay = new Date();
  const yesterDayStart = startOfDay(yesterDay);
  const yesterDayEnd = endOfDay(yesterDay);
  const pendingRequests = await ConnectionRequest.find({
    status: "interested",
    createdAt: {
      $gte: yesterDayStart,
      $lt: yesterDayEnd,
    },
  }).populate("fromUserId toUserId");
  console.log("pending requests:" + pendingRequests);
  const listOfEmail = [
    ...new Set(pendingRequests.map((req) => req.toUserId.emailId)),
  ];
  console.log("list of Emails:" + listOfEmail);
  if (listOfEmail.length === 0) {
    console.log("no request found");
    return;
  }
  for (let email of listOfEmail) {
    try {
      const html = `
    <div>
      <p>Hey, you have pending connection requests from:</p>
      <ol>
        ${listOfEmail.map((e) => `<li>${e}</li>`).join("")}
      </ol>
    </div>
  `;

      const res = await sendEmail(
        email,
        "TinderForDevs: Pending Connection Request",
        html
      );
      console.log("cron job ran successfully");
      console.log(res);
      console.log("Email sent to:", email);
    } catch (error) {
      console.error(error);
    }
  }

  //     console.log("Is sendEmail a promise?", sendEmail() instanceof Promise);

  //     try {
  //       const res = await sendEmail(
  //         "ybh5179@gmail.com",
  //         "Email test",
  //         "<p>Hey Yash</p>"
  //       );
  //       console.log("✅ Email Sent Successfully:", res);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   },
  //   {
  //     timezone: "Asia/Kolkata", // Set to IST
});
