const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // creating the transporter ( service that will send email like gmail)
  const transporter = nodemailer.createTransport({
    name: process.env.EMAIL_HOST,
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
    from: "Peacock <info@peacockchocolateksa.com>",
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  await transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      console.log("Error occurred:", error.message);
    } else {
      console.log("ُEmail sent successfully!");
      console.log("Server responded with:", info.response);
    }
  });
};

module.exports = sendEmail;
