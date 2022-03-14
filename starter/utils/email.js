const nodemailer = require('nodemailer');
//for send email we need transporter , define email options , send email
//transporter is the service that will send the email (not node js ) exp : gmail
//can send with multiple services like gmail , yahoo , hotmail
//not good for production up use mailgun,SendGrid

//*)use mailtrap :as dev service for fake send  emails to real adress (they are trapt in a dev inbox)
//we use a special develpoment service which fake to send email to real address
//but these email are trapped in a development inbox for take a look how they will look later
//in production

const sendEmail = async (options) => {
  //create a transporter
  const transporter = nodemailer.createTransport({
    //specify creadential
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  /*  how to use for gmail  const transporter = nodemailer.createTransport({
    service:'Gmail',
    //the account you will send with
    auth:{
        user : process.env.EMAIL_USERNAME,
        pass : process.env.EMAIL_PASSWORD
    },
//activate in gmail "less secure app"option
}) */

  /*2) define email options :comment({
define from where the email is comming from
and other option that pass into the function (receiver of the mail,subject, text ,html)
a
}) */
  const mailOptions = {
    from: 'Mohamed amine yaich <yaichamine05@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html :
  };

  /*//3 send email: Comment({
-applie the methode send mail on the service that fake the sending of mails
-pass into method the options
-retrun a promise  (use async await)

}) */

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
