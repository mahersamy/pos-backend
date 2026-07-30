export const newUserEmailTemplate = (
  email: string,
  password?: string,
  title = 'Welcome to POS System',
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>

<style>
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

body{
  background:#f4f7fb;
  font-family:Segoe UI,Arial,sans-serif;
  padding:40px 20px;
  color:#374151;
}

.container{
  max-width:600px;
  margin:auto;
  background:#ffffff;
  border-radius:16px;
  overflow:hidden;
  box-shadow:0 10px 35px rgba(0,0,0,.08);
}

.header{
  background:linear-gradient(135deg,#2563eb,#1d4ed8);
  padding:40px 30px;
  text-align:center;
}

.header h1{
  color:#fff;
  font-size:30px;
  margin-bottom:10px;
}

.header p{
  color:#dbeafe;
  font-size:16px;
}

.content{
  padding:40px 30px;
}

.content p{
  font-size:16px;
  line-height:1.7;
  margin-bottom:18px;
}

.credentials{
  background:#f8fafc;
  border:1px solid #e5e7eb;
  border-radius:12px;
  padding:24px;
  margin:30px 0;
}

.credentials h3{
  margin-bottom:18px;
  color:#111827;
  font-size:18px;
}

.item{
  margin-bottom:14px;
}

.label{
  display:block;
  color:#6b7280;
  font-size:13px;
  margin-bottom:4px;
}

.value{
  font-size:16px;
  font-weight:600;
  color:#111827;
  word-break:break-word;
}

.warning{
  background:#fff7ed;
  border-left:5px solid #f97316;
  padding:18px;
  border-radius:8px;
  color:#9a3412;
  margin-top:24px;
  font-size:15px;
}

.button-wrapper{
  text-align:center;
  margin:35px 0;
}

.button{
  display:inline-block;
  background:#2563eb;
  color:#fff !important;
  text-decoration:none;
  padding:14px 32px;
  border-radius:8px;
  font-weight:600;
}

.footer{
  border-top:1px solid #e5e7eb;
  padding:24px;
  text-align:center;
  font-size:13px;
  color:#6b7280;
  line-height:1.8;
}

@media(max-width:600px){
  .header,
  .content,
  .footer{
    padding:25px;
  }

  .header h1{
    font-size:24px;
  }
}
</style>

</head>

<body>

<div class="container">

  <div class="header">
      <h1>Welcome 👋</h1>
      <p>Your account has been successfully created.</p>
  </div>

  <div class="content">

      <p>
        Hello,
      </p>

      <p>
        Your account has been created successfully. You can now sign in using the credentials below.
      </p>

      <div class="credentials">

          <h3>Account Information</h3>

          <div class="item">
              <span class="label">Email</span>
              <div class="value">${email}</div>
          </div>

          ${
            password
              ? `
          <div class="item">
              <span class="label">Temporary Password</span>
              <div class="value">${password}</div>
          </div>
          `
              : ''
          }

      </div>

      ${
        password
          ? `
      <div class="warning">
          🔒 For your security, please change your password immediately after your first login.
      </div>
      `
          : ''
      }

      <div class="button-wrapper">
          <a href="#" class="button">Login to Your Account</a>
      </div>

  </div>

  <div class="footer">
      If you did not expect this account to be created,
      please contact your administrator immediately.
      <br><br>
      © ${new Date().getFullYear()} POS System. All rights reserved.
  </div>

</div>

</body>
</html>
`;
};