const getForgotPasswordEmailHtml = (user, resetLink) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Reset Your Password - QuickPoll</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f2f5; line-height: 1.6; color: #333333; width: 100%; height: 100%;">
    
    <!-- Email Wrapper -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f2f5;">
        <tr>
            <td style="padding: 20px 0;">
                
                <!-- Email Container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 1px solid #e1e8ed; max-width: 600px;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); background-color: #e74c3c; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            
                            <!-- Logo -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding-bottom: 20px;">
                                        <div style="display: inline-block; width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 50%; padding: 15px; margin-bottom: 10px;">
                                            <div style="font-size: 30px; line-height: 30px;">🔑</div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Header Title -->
                            <h1 style="color: white; font-size: 26px; font-weight: 600; margin: 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">Reset Your Password</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px; background-color: white;">
                            
                            <!-- Greeting -->
                            <div style="font-size: 18px; color: #2c3e50; margin-bottom: 20px; font-weight: 500;">
                                Hello ${user.name || 'there'},
                            </div>
                            
                            <!-- Message -->
                            <div style="font-size: 16px; color: #555555; margin-bottom: 30px; line-height: 1.7;">
                                We received a request to reset the password for your <strong>QuickPoll</strong> account 
                                associated with this email address. If you made this request, click the button below 
                                to create a new password.
                            </div>
                            
                            <!-- Button Container -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 30px 0;">
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetLink}" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="12%" stroke="f" fillcolor="#e74c3c">
                                            <w:anchorlock/>
                                            <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">Reset Password</center>
                                        </v:roundrect>
                                        <![endif]-->
                                        <!--[if !mso]><!-->
                                        <a href="${resetLink}" 
                                           style="display: inline-block; background-color: #e74c3c; color: white; text-decoration: none; padding: 16px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; text-align: center; box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3); min-width: 200px;"
                                           target="_blank" 
                                           rel="noopener noreferrer">
                                            Reset Password
                                        </a>
                                        <!--<![endif]-->
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Security Notice -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; margin: 25px 0; font-size: 14px; text-align: center; font-weight: 500; border: 1px solid #ffeaa7;">
                                        ⏰ This password reset link will expire in 1 hour for security reasons.
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Important Notice -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin: 25px 0; font-size: 14px; text-align: center; font-weight: 500; border: 1px solid #f5c6cb;">
                                        🔒 If you didn't request a password reset, you can safely ignore this email. 
                                        Your password will remain unchanged.
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Warning Text -->
                            <div style="font-size: 14px; color: #6c757d; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center;">
                                For security reasons, if you didn't request this password reset, please 
                                <a href="mailto:support@quickpoll.com" style="color: #e74c3c; text-decoration: none;">contact our support team</a> 
                                immediately. You may also want to review your account security settings.
                            </div>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef; border-radius: 0 0 12px 12px;">
                            <p style="font-size: 16px; color: #495057; margin-bottom: 8px; font-weight: 600;">QuickPoll</p>
                            <p style="font-size: 14px; color: #6c757d; margin-bottom: 8px;">Your Personal QuickPoll Solution</p>
                            <p style="font-size: 14px; color: #6c757d; margin-bottom: 20px;">
                                Need help? Contact us at 
                                <a href="mailto:support@quickpoll.com" style="color: #e74c3c; text-decoration: none;">support@quickpoll.com</a>
                            </p>
                            
                            <div style="font-size: 12px; color: #6c757d; border-top: 1px solid #e9ecef; padding-top: 20px;">
                                © 2025 QuickPoll. All rights reserved.<br>
                                <a href="#" style="color: #6c757d; text-decoration: none; margin: 0 5px;">Unsubscribe</a> | 
                                <a href="#" style="color: #6c757d; text-decoration: none; margin: 0 5px;">Privacy Policy</a> |
                                <a href="#" style="color: #6c757d; text-decoration: none; margin: 0 5px;">Terms of Service</a>
                            </div>
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>`;
};

module.exports = getForgotPasswordEmailHtml;