module.exports = function getHTMLForgotPassword({ name, link }) {
  return `
    <h2>Xin chào ${name}</h2>
    <p>Bạn đã yêu cầu đặt lại mật khẩu. Click vào link bên dưới để đặt lại:</p>
    <a href="${link}" target="_blank">${link}</a>
    <p>Link có hiệu lực trong 15 phút.</p>
  `;
};