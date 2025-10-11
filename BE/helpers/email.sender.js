const nodemailer = require('nodemailer');

// Tạo transporter với cấu hình từ .env
const createTransporter = () => {
  return nodemailer.createTransport({ // Sửa từ createTransporter thành createTransport
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT),
    secure: process.env.MAIL_ENCRYPTION === 'ssl', // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false // Cho phép self-signed certificates
    }
  });
};

// Hàm gửi email
const emailSender = async ({ email, subject, html }) => {
  try {
    // Kiểm tra có đủ thông tin email không
    if (!process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
      console.log('Email credentials not configured, skipping email send');
      return { success: false, message: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `LaboratoryManagement <${process.env.MAIL_FROM_ADDRESS}>`,
      to: email,
      subject: subject,
      html: html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error.message);
    // Không throw error để không làm crash app
    return { success: false, error: error.message };
  }
};

module.exports = emailSender;