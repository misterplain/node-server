const router = require("express").Router();
const nodemailer = require("nodemailer");

function nodeMailerConfirmationEmail(source, messageData) {
  let date = new Date();

  // Validate environment variables
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.error(
      "❌ Nodemailer Error: Missing GMAIL_USER or GMAIL_PASS environment variables"
    );
    return Promise.reject(
      new Error(
        "Email configuration missing. Please set GMAIL_USER and GMAIL_PASS environment variables."
      )
    );
  }

  let smtpTransporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  let mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject: `${messageData?.result} @ ${messageData.source} - triggered at ${date}`,
    html: `
      ${
        messageData
          ? `<p>Response data: ${JSON.stringify(messageData)}</p>`
          : ""
      }
  
     `,
  };

  return new Promise((resolve, reject) => {
    smtpTransporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
}

router.post("/", async (req, res) => {
  const { result, name, email, message, phoneNum } = req.body;
  const { source } = req.query;

  console.log("📧 Nodemailer POST received from source:", source);
  console.log("📧 Request body:", req.body);

  nodeMailerConfirmationEmail(source, req.body)
    .then(() => {
      console.log("✅ Email sent successfully");
      return res.status(200).json({ message: "Message sent successfully" });
    })
    .catch(async (err) => {
      console.error("❌ Nodemailer error:", err.message);
      console.error("Full error:", err);
      // Don't try to send another email on failure to avoid infinite loops
      return res.status(500).json({
        message: "Error sending message",
        error:
          process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.message,
      });
    });
});
module.exports = router;
