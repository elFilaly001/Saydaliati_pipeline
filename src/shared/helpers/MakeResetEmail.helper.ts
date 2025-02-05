export const MakeResetEmail = (
    resetLink: string,
    name: string,
  ): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        a{
            text-decoration: none;
            color: #ffffff;}
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #f4f4f4;
        }
        .logo {
            font-size: 24px;
            color: #333;
            font-weight: bold;
        }
        .content {
            padding: 20px 0;
            color: #555;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #00D082;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 2px solid #f4f4f4;
            color: #888;
            font-size: 12px;
        }
        .note {
            font-size: 13px;
            color: #666;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://saydaliyati-bucket.s3.eu-north-1.amazonaws.com/saydaliyati-logo.png" alt="Saydaliati Logo" width="250" >
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
            <p>To reset your password, click the button below:</p>
            <center>
                <a href="${resetLink}" class="button">Reset Password</a>
            </center>
            <p class="note">This link will expire in 24 hours for security reasons.</p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>${resetLink}</p>
            <p>Best regards,<br>Saydaliati Team Support</p>
        </div>
        <div class="footer">
            <p>This email was sent by Saydaliati<br>
            Anywhere in your pocket</p>
            <p>If you didn't request a password reset, please contact our support team.</p>
        </div>
    </div>
</body>
</html>`
  };