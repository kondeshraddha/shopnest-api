export const passwordResetTemplate = (
  firstName: string,
  resetUrl: string,
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: #dc2626;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
    }
    .body {
      padding: 40px 30px;
    }
    .body h2 { color: #1f2937; }
    .body p {
      color: #6b7280;
      font-size: 16px;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      background: #dc2626;
      color: #ffffff;
      padding: 14px 30px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 16px;
      font-weight: bold;
      margin: 20px 0;
    }
    .warning {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
      color: #92400e;
    }
    .footer {
      background: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      color: #9ca3af;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 ShopNest</h1>
    </div>
    <div class="body">
      <h2>Password Reset Request</h2>
      <p>Hi ${firstName},</p>
      <p>
        We received a request to reset your password.
        Click the button below to set a new password.
      </p>
      <a href="${resetUrl}" class="button">
        Reset Password →
      </a>
      <div class="warning">
        ⚠️ This link expires in <strong>1 hour</strong>.
        If you did not request a password reset,
        please ignore this email.
      </div>
    </div>
    <div class="footer">
      <p>© 2026 ShopNest. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;