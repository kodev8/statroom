import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const mailConfig = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_SERVER_ADDRESS,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
};
const transporter = nodemailer.createTransport(mailConfig);

export default transporter;
