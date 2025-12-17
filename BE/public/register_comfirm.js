function getHTMLRegisterComfirm({ name, link }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                Welcome to Laboratory Management!
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px; font-weight: 600;">
                Hello ${name},
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                Thank you for registering with us! We're excited to have you on board.
              </p>
              
              <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                To complete your account setup and ensure its security, please verify your email address by clicking the button below:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${link}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Verify Your Account
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                Once verified, you'll be able to:
              </p>
              
              <!-- Features -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 15px; background-color: #f8f9ff; border-left: 4px solid #667eea; margin-bottom: 10px;">
                    <p style="margin: 0; color: #333333; font-size: 15px;">
                      <strong style="color: #667eea;">📅 Manage Appointments:</strong> Easily book and track your lab test appointments
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #f8f9ff; border-left: 4px solid #667eea; margin-bottom: 10px;">
                    <p style="margin: 0; color: #333333; font-size: 15px;">
                      <strong style="color: #667eea;">📊 Access Results:</strong> View and store your test results securely as soon as they are available
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #f8f9ff; border-left: 4px solid #667eea;">
                    <p style="margin: 0; color: #333333; font-size: 15px;">
                      <strong style="color: #667eea;">✏️ Update Information:</strong> Keep your personal profile accurate and up-to-date
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Warning -->
              <div style="margin: 30px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  ⏰ <strong>Important:</strong> This verification link will expire in 5 minutes.
                </p>
              </div>
              
              <p style="margin: 20px 0 0 0; color: #555555; font-size: 16px; line-height: 1.6;">
                Thank you for trusting us with your care.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">
                Best regards,<br>
                <strong style="color: #495057;">The Laboratory Management Team</strong>
              </p>
              <p style="margin: 10px 0 0 0; color: #adb5bd; font-size: 12px;">
                This is an automated email. Please do not reply to this message.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
module.exports = getHTMLRegisterComfirm;
