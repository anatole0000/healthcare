// utils/mailer.js
require('dotenv').config();
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail', // hoặc dùng SMTP riêng
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});



exports.sendMail = async ({ to, subject, text }) => {
  const mailOptions = {
    from: `"User Service 👨‍⚕️" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  };

  await transporter.sendMail(mailOptions);
};
