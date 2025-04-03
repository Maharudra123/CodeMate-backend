// utils/emailService.js
const { Resend } = require("resend");

console.log("✅ Email Service Loaded!"); // Check if service is imported

// Check if API key is loaded
const apikey = process.env.RESEND_API_KEY;
console.log("🔐 Resend API Key:", apikey ? "Loaded" : "❌ NOT LOADED");

// Initialize Resend instance with API key
const resend = new Resend(apikey);

const sendEmail = async (to, subject, html) => {
  console.log("📧 Preparing to Send Email...");
  console.log("➡️ To:", to);
  console.log("➡️ Subject:", subject);
  console.log("➡️ HTML Content:", html);

  try {
    console.log("📧 Calling sendEmail()..."); // Add this log

    const response = await resend.emails.send({
      from: "onboarding@resend.dev", // Use your verified domain if configured
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
