// testEmail.js
require("dotenv").config({ path: "../../.env" });
const sendEmail = require("./emailservice");

async function testEmail() {
  try {
    console.log("🚀 Starting email test...");
    const res = await sendEmail(
      "ybh5179@gmail.com",
      "Test Email",
      `<p>Testing Resend API with cron...</p>`
    );
    console.log("✅ Email sent successfully:", res);
  } catch (error) {
    console.error("❌ Error in email:", error.message);
  }
}

testEmail();
