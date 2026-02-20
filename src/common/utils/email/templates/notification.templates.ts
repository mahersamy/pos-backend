// Email template for order placed notification
export const orderPlacedTemplate = (data: {
  customerName: string;
  orderId: string;
  totalAmount: number;
  items: any[];
}) => {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.title || 'Product'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price?.toFixed(2) || '0.00'}</td>
    </tr>
  `,
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Order Confirmation</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8f9fa;
          padding: 20px;
          margin: 0;
        }
        .container {
          background-color: #ffffff;
          padding: 40px;
          border-radius: 12px;
          max-width: 600px;
          margin: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #28a745;
          font-size: 32px;
          margin-bottom: 10px;
        }
        .order-id {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background-color: #f8f9fa;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #495057;
        }
        .total {
          font-size: 20px;
          font-weight: bold;
          color: #28a745;
          text-align: right;
          padding: 20px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          font-size: 13px;
          color: #6c757d;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✅ Order Confirmed!</h1>
        <p class="order-id">Order ID: <strong>#${data.orderId}</strong></p>
        <p>Hi ${data.customerName},</p>
        <p>Thank you for your order! We've received your order and will process it shortly.</p>
        
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align: center;">Quantity</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div class="total">
          Total: $${data.totalAmount.toFixed(2)}
        </div>
        
        <p>We'll send you another email when your order ships.</p>
        
        <div class="footer">
          Thank you for shopping with us!<br>
          If you have any questions, please contact our support team.
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for order shipped notification
export const orderShippedTemplate = (data: {
  customerName: string;
  orderId: string;
}) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Order Shipped</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8f9fa;
          padding: 20px;
          margin: 0;
        }
        .container {
          background-color: #ffffff;
          padding: 40px;
          border-radius: 12px;
          max-width: 600px;
          margin: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #007bff;
          font-size: 32px;
          margin-bottom: 10px;
        }
        .order-id {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 30px;
        }
        .status-badge {
          display: inline-block;
          background-color: #007bff;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          font-size: 13px;
          color: #6c757d;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📦 Your Order Has Shipped!</h1>
        <p class="order-id">Order ID: <strong>#${data.orderId}</strong></p>
        <p>Hi ${data.customerName},</p>
        <p>Great news! Your order is on its way to you.</p>
        
        <div class="status-badge">🚚 In Transit</div>
        
        <p>Your package is being delivered and should arrive soon. We'll notify you once it's delivered.</p>
        
        <div class="footer">
          Thank you for shopping with us!<br>
          Track your order status in your account dashboard.
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for order delivered notification
export const orderDeliveredTemplate = (data: {
  customerName: string;
  orderId: string;
}) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Order Delivered</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8f9fa;
          padding: 20px;
          margin: 0;
        }
        .container {
          background-color: #ffffff;
          padding: 40px;
          border-radius: 12px;
          max-width: 600px;
          margin: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #28a745;
          font-size: 32px;
          margin-bottom: 10px;
        }
        .order-id {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 30px;
        }
        .status-badge {
          display: inline-block;
          background-color: #28a745;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          font-size: 13px;
          color: #6c757d;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎉 Order Delivered!</h1>
        <p class="order-id">Order ID: <strong>#${data.orderId}</strong></p>
        <p>Hi ${data.customerName},</p>
        <p>Your order has been successfully delivered!</p>
        
        <div class="status-badge">✅ Delivered</div>
        
        <p>We hope you love your purchase. If you have any questions or concerns, please don't hesitate to contact us.</p>
        
        <div class="footer">
          Thank you for shopping with us!<br>
          We'd love to hear your feedback about your purchase.
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for order cancelled notification
export const orderCancelledTemplate = (data: {
  customerName: string;
  orderId: string;
}) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Order Cancelled</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8f9fa;
          padding: 20px;
          margin: 0;
        }
        .container {
          background-color: #ffffff;
          padding: 40px;
          border-radius: 12px;
          max-width: 600px;
          margin: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #dc3545;
          font-size: 32px;
          margin-bottom: 10px;
        }
        .order-id {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 30px;
        }
        .status-badge {
          display: inline-block;
          background-color: #dc3545;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          font-size: 13px;
          color: #6c757d;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Order Cancelled</h1>
        <p class="order-id">Order ID: <strong>#${data.orderId}</strong></p>
        <p>Hi ${data.customerName},</p>
        <p>Your order has been cancelled as requested.</p>
        
        <div class="status-badge">❌ Cancelled</div>
        
        <p>If you used a coupon, it has been restored to your account. Product stock has also been updated.</p>
        <p>If you have any questions about this cancellation, please contact our support team.</p>
        
        <div class="footer">
          We hope to see you again soon!<br>
          Thank you for considering us.
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for welcome notification
export const welcomeEmailTemplate = (data: { customerName: string }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Welcome</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          margin: 0;
        }
        .container {
          background-color: #ffffff;
          padding: 40px;
          border-radius: 12px;
          max-width: 600px;
          margin: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        h1 {
          color: #667eea;
          font-size: 36px;
          margin-bottom: 10px;
        }
        .welcome-badge {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 25px;
          font-weight: 600;
          margin: 20px 0;
          font-size: 16px;
        }
        .features {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .features ul {
          list-style: none;
          padding: 0;
        }
        .features li {
          padding: 8px 0;
          color: #495057;
        }
        .features li:before {
          content: "✓ ";
          color: #28a745;
          font-weight: bold;
          margin-right: 8px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          font-size: 13px;
          color: #6c757d;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎉 Welcome!</h1>
        <p>Hi ${data.customerName},</p>
        <p>Welcome to our e-commerce platform! We're thrilled to have you join our community.</p>
        
        <div class="welcome-badge">🚀 Your Account is Ready!</div>
        
        <div class="features">
          <h3 style="color: #495057; margin-top: 0;">What you can do now:</h3>
          <ul>
            <li>Browse thousands of products</li>
            <li>Add items to your wishlist</li>
            <li>Get exclusive deals and coupons</li>
            <li>Track your orders in real-time</li>
            <li>Enjoy fast and secure checkout</li>
          </ul>
        </div>
        
        <p>Start exploring and find amazing products today!</p>
        
        <div class="footer">
          Thank you for joining us!<br>
          If you have any questions, our support team is here to help.
        </div>
      </div>
    </body>
    </html>
  `;
};
