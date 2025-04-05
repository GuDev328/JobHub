import nodemailer from 'nodemailer';
import fs from 'fs';
import { env } from '~/constants/config';
import { SendEmail } from '~/constants/enum';
import path from 'path';

export const sendVerifyEmail = async (toAddress: string, token: string, type: SendEmail) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: env.emailApp,
      pass: env.emailAppPassword
    }
    // logger: true, // Bật log để debug
    // debug: true
  });

  const template = fs.readFileSync(path.resolve('src/templates/templateVerifyEmail.html'), 'utf8');
  let body = '';
  let subject = '';

  if (type === SendEmail.VerifyEmail) {
    subject = env.subjectEmailVerifyEmail as string;
    body = template
      .replace('{{title}}', env.titleEmailVerifyEmail as string)
      .replace('{{content}}', env.contentEmailVerifyEmail as string)
      .replace('{{verifyLink}}', `${env.clientUrl}/verify-email?token=${token}`);
  } else if (type === SendEmail.ForgotPassword) {
    subject = env.subjectEmailForgotPassword as string;
    body = template
      .replace('{{title}}', env.titleEmailForgotPassword as string)
      .replace('{{content}}', env.contentEmailForgotPassword as string)
      .replace('{{verifyLink}}', `${env.clientUrl}/reset-password?token=${token}`);
  }

  try {
    const info = await transporter.sendMail({
      from: '"JobHub" <vocuong.jobhub@gmail.com>', // Sửa lại from cho hợp lệ
      to: toAddress,
      subject: subject,
      html: body
    });
    console.log('Email sent: ' + info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
};
