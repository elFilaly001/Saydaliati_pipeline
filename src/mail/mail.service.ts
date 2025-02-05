import { MakeResetEmail } from '@/shared/helpers/MakeResetEmail.helper';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendVerificationEmail(
    email: string,
    verificationLink: string,
    username: string,
  ): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: email,
      subject: 'Email Verification',
      html: this.getVerificationEmailTemplate(verificationLink, username),
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
    name: string,
  ): Promise<void> {
    const emailData = {
      to: email,
      subject: 'Reset Your Password',
      html: MakeResetEmail(resetLink, name),
    };

    try {
      await this.transporter.sendMail(emailData);
    } catch (error) {
      throw new Error('Failed to send password reset email');
    }
  }

  private getVerificationEmailTemplate(
    verificationLink: string,
    username: string,
  ): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .email-container {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .button {
              background-color: #4CAF50;
              border: none;
              color: white;
              padding: 15px 32px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              margin: 4px 2px;
              cursor: pointer;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <h2>Welcome to Our Platform!</h2>
            <p>Hello ${username},</p>
            <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
            <p>
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p>${verificationLink}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <br>
            <p>Best regards,</p>
            <p>Your App Team</p>
          </div>
        </body>
        </html>
      `;
  }
  


}
