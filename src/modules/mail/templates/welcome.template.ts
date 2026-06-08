export const welcomeTemplate = (
  firstName: string,
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
      background: #2563eb;
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
    .body h2 {
      color: #1f2937;
      font-size: 22px;
    }
    .body p {
      color: #6b7280;
      font-size: 16px;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      background: #2563eb;
      color: #ffffff;
      padding: 14px 30px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 16px;
      font-weight: bold;
      margin: 20px 0;
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
      <h1>🛒 ShopNest</h1>
    </div>
    <div class="body">
      <h2>Welcome, ${firstName}! 🎉</h2>
      <p>
        Thank you for joining ShopNest!
        Your account has been created successfully.
      </p>
      <p>
        Start exploring thousands of products
        at amazing prices.
      </p>
      <a href="http://localhost:4000/shop"
         class="button">
        Start Shopping →
      </a>
      <p style="font-size: 14px; color: #9ca3af;">
        If you did not create this account,
        please ignore this email.
      </p>
    </div>
    <div class="footer">
      <p>© 2026 ShopNest. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;