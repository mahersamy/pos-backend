export const lowStockEmailTemplate = (items: any[]) => {
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 12px; color: #6c757d;">${item.id}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name || "Product"}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; color: #dc3545; font-weight: bold;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.price?.toFixed(2) || "0.00"}</td>
    </tr>
  `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Low Stock Alert</title>
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
        <h1>⚠️ Low Stock Alert</h1>
        <p>Hi Admin/Manager,</p>
        <p>The following items in your inventory are running low on stock and need to be replenished:</p>

        <table>
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Product Name</th>
              <th style="text-align: center;">Remaining Quantity</th>
              <th style="text-align: center;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <p>Please check the inventory dashboard to update the stock levels.</p>

        <div class="footer">
          Automated Notification System<br>
          POS System
        </div>
      </div>
    </body>
    </html>
  `;
};
