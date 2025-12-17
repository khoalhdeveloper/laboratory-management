function createTestResultEmailHTML(testOrder, testResult) {
    const frontendUrl = process.env.FRONTEND_URL || 'https://laboratory-management-phi.vercel.app';
    const loginLink = `${frontendUrl}/login`;
    
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Result Ready</title>
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
                  Test Results Ready
                </h1>
              </td>
            </tr>
            
            <!-- Body -->
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px; font-weight: 600;">
                  Hello ${testOrder.patient_name || 'Valued Customer'},
                </h2>
                
                <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                  Your test results for order code <strong>${testOrder.order_code}</strong> have been completed.
                </p>
                
                <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                  You can log in to the system to view your detailed test results.
                </p>
                
                <!-- Button -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                  <tr>
                    <td align="center">
                      <a href="${loginLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                        Log in to View Results
                      </a>
                    </td>
                  </tr>
                </table>
                
                <p style="margin: 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                  Or you can access directly at: <a href="${loginLink}" style="color: #667eea; text-decoration: none;">${loginLink}</a>
                </p>
                
                <!-- Test Info -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; border-top: 1px solid #e9ecef; padding-top: 20px;">
                  <tr>
                    <td style="padding: 15px; background-color: #f8f9ff; border-left: 4px solid #667eea;">
                      <p style="margin: 0; color: #333333; font-size: 15px;">
                        <strong style="color: #667eea;">📋 Order Code:</strong> ${testOrder.order_code}
                      </p>
                      <p style="margin: 10px 0 0 0; color: #333333; font-size: 15px;">
                        <strong style="color: #667eea;">🏥 Test Type:</strong> ${testOrder.test_type || 'N/A'}
                      </p>
                      <p style="margin: 10px 0 0 0; color: #333333; font-size: 15px;">
                        <strong style="color: #667eea;">📊 Status:</strong> ${testResult.status || 'completed'}
                      </p>
                    </td>
                  </tr>
                </table>
                
                <p style="margin: 20px 0 0 0; color: #555555; font-size: 16px; line-height: 1.6;">
                  Thank you for using our services.
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e9ecef;">
                <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">
                  Best regards,<br>
                  <strong style="color: #495057;">Laboratory Management Team</strong>
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
  
  module.exports = createTestResultEmailHTML;
  