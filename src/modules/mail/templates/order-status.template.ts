export const orderStatusTemplate = (
  firstName: string,
  order: any,
) => {
  const statusConfig: Record<string, {
    color: string;
    emoji: string;
    message: string;
  }> = {
    confirmed: {
      color:   '#2563eb',
      emoji:   '✅',
      message: 'Your order has been confirmed and is being prepared.',
    },
    processing: {
      color:   '#7c3aed',
      emoji:   '📦',
      message: 'Your order is being packed and prepared for shipment.',
    },
    shipped: {
      color:   '#0891b2',
      emoji:   '🚚',
      message: 'Your order is on the way!',
    },
    delivered: {
      color:   '#16a34a',
      emoji:   '🎉',
      message: 'Your order has been delivered successfully!',
    },
    cancelled: {
      color:   '#dc2626',
      emoji:   '❌',
      message: 'Your order has been cancelled.',
    },
  };

  const config = statusConfig[order.status] || {
    color:   '#6b7280',
    emoji:   '📋',
    message: 'Your order status has been updated.',
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f4f4f4;
      margin: 0; padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: ${config.color};
      padding: 30px;
      text-align: center;
    }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .body { padding: 30px; }
    .status-badge {
      display: inline-block;
      background: ${config.color};
      color: #fff;
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
      text-transform: uppercase;
      margin: 10px 0;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      color: #9ca3af;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${config.emoji} Order Update</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${firstName}</strong>,</p>
      <p>${config.message}</p>

      <p>
        Order Number:
        <strong>${order.orderNumber}</strong>
      </p>

      <p>
        Status:
        <span class="status-badge">
          ${order.status}
        </span>
      </p>

      ${order.trackingNumber ? `
        <p>
          🔍 Tracking Number:
          <strong>${order.trackingNumber}</strong>
        </p>
      ` : ''}
    </div>
    <div class="footer">
      <p>Thank you for shopping with ShopNest! 🛒</p>
    </div>
  </div>
</body>
</html>
`;
};