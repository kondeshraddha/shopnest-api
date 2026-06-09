export const orderConfirmedTemplate = (
  firstName: string,
  order: any,
) => {
  const itemsHtml = order.items
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${item.productName}
          ${item.variantInfo
            ? `<br><small style="color:#6b7280">${item.variantInfo}</small>`
            : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          ₹${Number(item.unitPrice).toFixed(2)}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          ₹${Number(item.totalPrice).toFixed(2)}
        </td>
      </tr>
    `,
    )
    .join('');

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
      background: #16a34a;
      padding: 30px;
      text-align: center;
    }
    .header h1 { color: #fff; margin: 0; }
    .body { padding: 30px; }
    .order-number {
      background: #f0fdf4;
      border: 2px solid #16a34a;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      margin: 20px 0;
    }
    .order-number h3 {
      color: #16a34a;
      margin: 0;
      font-size: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: #f9fafb;
      padding: 12px;
      text-align: left;
      font-size: 14px;
      color: #374151;
    }
    .total-row td {
      padding: 12px;
      font-weight: bold;
      font-size: 16px;
      color: #2563eb;
      border-top: 2px solid #e5e7eb;
    }
    .address-box {
      background: #f9fafb;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
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
      <h1>✅ Order Confirmed!</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${firstName}</strong>,</p>
      <p>
        Your order has been placed successfully!
        We will notify you when it ships.
      </p>

      <div class="order-number">
        <p style="margin:0;color:#6b7280;font-size:14px">
          Order Number
        </p>
        <h3>${order.orderNumber}</h3>
      </div>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align:center">Qty</th>
            <th style="text-align:right">Price</th>
            <th style="text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3"
                style="padding:8px;text-align:right;color:#6b7280">
              Subtotal
            </td>
            <td style="padding:8px;text-align:right">
              ₹${Number(order.subtotal).toFixed(2)}
            </td>
          </tr>
          <tr>
            <td colspan="3"
                style="padding:8px;text-align:right;color:#6b7280">
              Tax (18% GST)
            </td>
            <td style="padding:8px;text-align:right">
              ₹${Number(order.tax).toFixed(2)}
            </td>
          </tr>
          <tr>
            <td colspan="3"
                style="padding:8px;text-align:right;color:#6b7280">
              Shipping
            </td>
            <td style="padding:8px;text-align:right">
              ${Number(order.shippingCost) === 0
                ? '<span style="color:#16a34a">FREE</span>'
                : `₹${Number(order.shippingCost).toFixed(2)}`
              }
            </td>
          </tr>
          <tr class="total-row">
            <td colspan="3"
                style="text-align:right">
              Grand Total
            </td>
            <td style="text-align:right">
              ₹${Number(order.totalAmount).toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div class="address-box">
        <strong>📍 Delivery Address:</strong><br>
        ${order.shippingAddress.fullName}<br>
        ${order.shippingAddress.addressLine1}
        ${order.shippingAddress.addressLine2
          ? `, ${order.shippingAddress.addressLine2}`
          : ''}<br>
        ${order.shippingAddress.city},
        ${order.shippingAddress.state}
        ${order.shippingAddress.postalCode}<br>
        ${order.shippingAddress.country}
      </div>

      <p style="color:#6b7280;font-size:14px">
        Payment Method:
        <strong>${order.paymentMethod.toUpperCase()}</strong>
      </p>
    </div>
    <div class="footer">
      <p>Thank you for shopping with ShopNest! 🛒</p>
      <p>© 2026 ShopNest. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};