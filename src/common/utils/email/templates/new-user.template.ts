export const newUserEmailTemplate = (
  email: string,
  password?: string,
  title = 'Welcome to POS System',
) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          padding: 20px;
          margin: 0;
        }
        .container {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          max-width: 500px;
          margin: auto;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        h1 {
          color: #333;
          font-size: 28px;
        }
        p {
          color: #555;
          font-size: 16px;
        }
        .credentials {
          background: #f9f9f9;
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
          text-align: left;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome!</h1>
        <p>An account has been created for you.</p>
        <div class="credentials">
          <p><strong>Email:</strong> ${email}</p>
          ${password ? `<p><strong>Password:</strong> ${password}</p>` : ''}
        </div>
        ${password ? '<p style="color: #d9534f; font-weight: bold;">For security reasons, please change your password after logging in for the first time.</p>' : ''}
        <div class="footer">
          If you didn’t request this account, please contact your administrator.
        </div>
      </div>
    </body>
    </html>
  `;
};
