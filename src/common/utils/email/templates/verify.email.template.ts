export const verifyEmailTemplate = (otp:string,title="Email Confirmation")=>{
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
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Your OTP Code</h1>
        <p style="font-size: 24px; font-weight: bold; color: #007BFF;">${otp}</p>
        <p>Please use the OTP above to verify your email address. This code will expire in a few minutes.</p>
        <div class="footer">
          If you didn’t request this code, you can safely ignore this email.
        </div>
      </div>
    </body>
    </html>
  `;
}