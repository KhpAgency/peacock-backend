const nodemailer = require("nodemailer");

const sendEmail =async (options) => {
  // creating the transporter ( service that will send email like gmail)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // if secure true => port = 465 || if secure false => port = 587
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });


  // define email options ( from , to , subject , email content )
  const emailOptions = {
    from:"Peacock <bohy.ahmed@gmail.com>",
    to: options.email,
    subject: options.subject,
    html: options.message
  }

  await transporter.sendMail(emailOptions)
};

module.exports = sendEmail;
