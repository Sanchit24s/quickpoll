const getPasswordChangedEmailHtml = (user) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Password Changed Successfully - QuickPoll</title>
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
                        <td style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); background-color: #27ae60; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            
                            <!-- Logo -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding-bottom: 20px;">
                                        <div style="display: inline-block; width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 50%; padding: 15px; margin-bottom: 10px;">
                                            <div style="font-size: 30px; line-height: 30px;">🛡️</div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Header Title -->
                            <h1 style="color: white; font-size: 26px; font-weight: 600; margin: 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">Password Changed Successfully</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px; background-color: white;">
                            
                            <!-- Greeting -->
                            <div style="font-size: 18px; color: #2c3e50; margin-bottom: 20px; font-weight: 500;">
                                Hello ${user.name || 'there'},
                            </div>
                            
                            <!-- Success Notice -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="background-color: #d4edda; color: #155724; padding: 20px; border-radius: 8px; margin: 25px 0; font-size: 16px; text-align: center; font-weight: 500; border: 1px solid #c3e6cb;">
                                        ✅ Your password has been successfully changed!
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Message -->
                            <div style="font-size: 16px; color: #555555; margin-bottom: 20px; line-height: 1.7;">
                                This email confirms that the password for your <strong>QuickPoll</strong> account 
                                has been successfully updated. Your account is now secured with your new password.
                            </div>
                            
                            <!-- Security Tips -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #27ae60;">
                                        <h3 style="color: #2c3e50; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">🔒 Security Tips:</h3>
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="color: #555555; font-size: 14px; line-height: 1.5;">
                                                    • Keep your password confidential and don't share it with anyone<br>
                                                    • Use a unique password that you don't use for other accounts<br>
                                                    • Consider enabling two-factor authentication for extra security<br>
                                                    • Sign out of all devices if you suspect unauthorized access
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Warning Notice -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin: 25px 0; font-size: 14px; text-align: center; font-weight: 500; border: 1px solid #f5c6cb;">
                                        🚨 If you didn't change your password, your account may be compromised. 
                                        Please contact support immediately.
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Warning Text -->
                            <div style="font-size: 14px; color: #6c757d; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center;">
                                If you didn't make this change or have any security concerns, please 
                                <a href="mailto:support@quickpoll.com" style="color: #27ae60; text-decoration: none;">contact our support team</a> 
                                immediately. We're here to help keep your account secure.
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
                                <a href="mailto:support@quickpoll.com" style="color: #27ae60; text-decoration: none;">support@quickpoll.com</a>
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

module.exports = getPasswordChangedEmailHtml;