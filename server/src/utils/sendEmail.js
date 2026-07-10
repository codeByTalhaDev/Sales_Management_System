import nodemailer from "nodemailer";
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS length:", process.env.EMAIL_PASS?.length);
const sendEmail = async (email, subject, html) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Talha Solutions" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;