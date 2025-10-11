require('dotenv/config');

module.exports = {
    MAILER: process.env.MAIL_MAILER || 'smtp',
    HOST: process.env.MAIL_HOST,
    PORT: Number(process.env.MAIL_PORT) || 587,
    USER: process.env.MAIL_USER,
    PASS: process.env.MAIL_PASS,
    FROM_ADDRESS: process.env.MAIL_FROM_ADDRESS,
    FROM_NAME: process.env.MAIL_FROM_NAME
};