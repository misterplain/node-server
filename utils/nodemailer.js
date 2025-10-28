const router = require("express").Router();
const nodemailer = require("nodemailer");

function nodeMailerConfirmationEmail(source, messageData) {
  let date = new Date();

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

  smtpTransporter.sendMail(mailOptions, (error) => {
    try {
      if (error)
        return res.status(400).json({ msg: "Please Fill All The Fields!" });
      res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      if (error)
        return res.status(500).json({ message: "Error sending message" });
    }
  });
}

router.post("/", async (req, res) => {
  const { result, name, email, message, phoneNum } = req.body;
  const { source } = req.query;

  try {
    const emailSent = await nodeMailerConfirmationEmail(source, req.body);
    return res
      .status(200)
      .json({ message: "Message sent successfully" + emailSent });
  } catch (error) {
    nodeMailerConfirmationEmail(source, { message: "Failure to send message" });
    return res.status(500).json({ message: "Error sending message" });
  }
});
module.exports = router;


