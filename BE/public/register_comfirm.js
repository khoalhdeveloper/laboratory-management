function getHTMLRegisterComfirm({ name, link }) {
  return `
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif">
  <h1>Welcome ${name} to Our Service</h1>
  <p>Nhấn nút bên dưới để xác thực tài khoản của bạn:</p>
  <a href="${link}" style="
    display:inline-block;
    padding:12px 25px;
    background:#007bff;
    color:#fff;
    text-decoration:none;
    border-radius:5px;">
    Xác nhận tài khoản
  </a>
</body>
</html>
  `;
}
module.exports = getHTMLRegisterComfirm;
