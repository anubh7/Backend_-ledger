require('dotenv').config();
const nodemailer = require('nodemailer');

//transporter ka kaam hota hai ki-- google ke jo smtp server hai uske sath connect karna aur email bhejna
// Supports both: App Password (EMAIL_PASS) and OAuth2 (CLIENT_ID/CLIENT_SECRET/REFRESH_TOKEN)
let transporter;
if (process.env.EMAIL_PASS) {
  // Option A: Gmail App Password (simplest, recommended)
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false }, // fixes "self-signed certificate in certificate chain" behind AV/proxy
  });
} else {
  // Option B: Gmail OAuth2 (requires valid non-expired REFRESH_TOKEN + Gmail API scope)
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
    tls: { rejectUnauthorized: false }, // fixes "self-signed certificate in certificate chain" behind AV/proxy
  });
}

// Verify the connection configuration 
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error.message);
    console.error('TIP: If using OAuth2, your REFRESH_TOKEN may be expired/revoked. Prefer EMAIL_PASS (App Password). See comments in email.service.js');
  } else {
    console.log('Email server is ready to send messages');
  }
});

//Function to send email

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
        from: `"Your Name" <${process.env.EMAIL_USER}>`, // sender address
        to, // list of receivers
        subject, // Subject line
        text, // plain text body
        html, // html body
    });
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error; // re-throw so controller can detect failure
  }
};

async function sendRegistrationEmail(userEmail, username) {
    const subject = 'Welcome to Our Service!';
    const text = `Hello ${username},\n\nThank you for registering with us! We're excited to have you on board.\n\nBest regards,\n The Team BANKING SYSTEM`;
    const html = `<p>Hello <strong>${username}</strong>,</p><p>Thank you for registering with us! We're excited to have you on board.</p>`;
    
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, username, amount, transactionId) {
    const subject = 'Transaction Notification';
    const text = `Hello ${username},\n\nA transaction of $${amount} has been made. Transaction ID: ${transactionId}.\n\nBest regards,\n The Team BANKING SYSTEM`;
    const html = `<p>Hello <strong>${username}</strong>,</p><p>A transaction of <strong>$${amount}</strong> has been made. Transaction ID: <strong>${transactionId}</strong>.</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(user) {
    const subject = 'Transaction Failed';
    const text = `Hello ${user.username},\n\nA transaction has failed. Please check your account for more details.\n\nBest regards,\n The Team BANKING SYSTEM`;
    const html = `<p>Hello <strong>${user.username}</strong>,</p><p>A transaction has failed. Please check your account for more details.</p>`;

    await sendEmail(user.email, subject, text, html);
}

module.exports = {sendRegistrationEmail, sendTransactionEmail, sendTransactionFailureEmail};