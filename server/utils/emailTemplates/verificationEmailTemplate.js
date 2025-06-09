const getVerificationEmailHtml = (user, link) => {
    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <title>Verify Your Email Address - QuickPoll</title>
                <!--[if mso]>
                <noscript>
                    <xml>
                        <o:OfficeDocumentSettings>
                            <o:PixelsPerInch>96</o:PixelsPerInch>
                        </o:OfficeDocumentSettings>
                    </xml>
                </noscript>
                <![endif]-->
                <style>
                    /* Reset and base styles */
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body, table, td, p, a, li, blockquote {
                        -webkit-text-size-adjust: 100%;
                        -ms-text-size-adjust: 100%;
                    }
                    
                    table, td {
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                    }
                    
                    img {
                        -ms-interpolation-mode: bicubic;
                        border: 0;
                        height: auto;
                        line-height: 100%;
                        outline: none;
                        text-decoration: none;
                    }
                    
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif;
                        background-color: #f0f2f5;
                        margin: 0;
                        padding: 0;
                        line-height: 1.6;
                        color: #333333;
                        width: 100% !important;
                        height: 100% !important;
                    }
                    
                    /* Container styles */
                    .email-wrapper {
                        width: 100%;
                        background-color: #f0f2f5;
                        padding: 20px 0;
                    }
                    
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 12px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                        border: 1px solid #e1e8ed;
                    }
                    
                    /* Header styles */
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 40px 30px;
                        text-align: center;
                        color: white;
                    }
                    
                    .logo {
                        display: inline-block;
                        margin-bottom: 20px;
                    }
                    
                    .logo-img {
                        width: 60px;
                        height: 60px;
                        display: block;
                        object-fit: contain;
                        filter: brightness(0) invert(1);
                        opacity: 1;
                    }
                    
                    .logo-fallback {
                        display: none;
                        font-size: 28px;
                        line-height: 1;
                        color: white;
                        font-weight: bold;
                    }
                    
                    .header h1 {
                        color: white;
                        font-size: 26px;
                        font-weight: 600;
                        margin: 0;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    
                    /* Content styles */
                    .content {
                        padding: 40px 30px;
                        background-color: white;
                    }
                    
                    .greeting {
                        font-size: 18px;
                        color: #2c3e50;
                        margin-bottom: 20px;
                        font-weight: 500;
                    }
                    
                    .message {
                        font-size: 16px;
                        color: #555555;
                        margin-bottom: 30px;
                        line-height: 1.7;
                    }
                    
                    /* Button styles */
                    .button-container {
                        text-align: center;
                        margin: 30px 0;
                    }
                    
                    .verify-button {
                        display: inline-block;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white !important;
                        text-decoration: none;
                        padding: 16px 32px;
                        border-radius: 6px;
                        font-size: 16px;
                        font-weight: 600;
                        text-align: center;
                        transition: all 0.2s ease;
                        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                        border: none;
                        cursor: pointer;
                        mso-padding-alt: 16px 32px;
                    }
                    
                    .verify-button:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
                        text-decoration: none;
                    }
                    
                    /* Alternative link styles */
                    .alternative-link {
                        margin-top: 25px;
                        padding: 20px;
                        background-color: #f8f9fa;
                        border-radius: 8px;
                        border-left: 4px solid #667eea;
                    }
                    
                    .alternative-link p {
                        font-size: 14px;
                        color: #6c757d;
                        margin-bottom: 10px;
                    }
                    
                    .link-text {
                        word-break: break-all;
                        font-family: 'Courier New', monospace;
                        font-size: 13px;
                        color: #495057;
                        background-color: #ffffff;
                        padding: 8px;
                        border-radius: 4px;
                        border: 1px solid #dee2e6;
                    }
                    
                    /* Security notice */
                    .security-notice {
                        background: linear-gradient(135deg, #fff3cd, #ffeaa7);
                        color: #856404;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 25px 0;
                        font-size: 14px;
                        text-align: center;
                        font-weight: 500;
                        border: 1px solid #ffeaa7;
                    }
                    
                    .warning-text {
                        font-size: 14px;
                        color: #6c757d;
                        margin-top: 25px;
                        padding-top: 20px;
                        border-top: 1px solid #e9ecef;
                        text-align: center;
                    }
                    
                    /* Footer styles */
                    .footer {
                        background-color: #f8f9fa;
                        padding: 30px;
                        text-align: center;
                        border-top: 1px solid #e9ecef;
                    }
                    
                    .footer p {
                        font-size: 14px;
                        color: #6c757d;
                        margin-bottom: 8px;
                    }
                    
                    .company-name {
                        font-weight: 600;
                        color: #495057;
                    }
                    
                    .support-link {
                        color: #667eea !important;
                        text-decoration: none;
                    }
                    
                    .support-link:hover {
                        text-decoration: underline;
                    }
                    
                    .footer-links {
                        margin-top: 20px;
                        font-size: 12px;
                    }
                    
                    .footer-links a {
                        color: #6c757d;
                        text-decoration: none;
                        margin: 0 5px;
                    }
                    
                    .footer-links a:hover {
                        color: #667eea;
                        text-decoration: underline;
                    }
                    
                    /* Responsive design */
                    @media only screen and (max-width: 640px) {
                        .email-wrapper {
                            padding: 10px;
                        }
                        
                        .email-container {
                            margin: 0;
                            border-radius: 8px;
                        }
                        
                        .header, .content, .footer {
                            padding: 25px 20px !important;
                        }
                        
                        .header h1 {
                            font-size: 22px !important;
                        }
                        
                        .verify-button {
                            padding: 14px 24px !important;
                            font-size: 15px !important;
                            width: 100%;
                            max-width: 280px;
                        }
                        
                        .greeting {
                            font-size: 16px !important;
                        }
                        
                        .message {
                            font-size: 15px !important;
                        }
                    }
                    
                    /* Dark mode support */
                    @media (prefers-color-scheme: dark) {
                        .email-container {
                            background-color: #1a1a1a !important;
                            border-color: #333333 !important;
                        }
                        
                        .content {
                            background-color: #1a1a1a !important;
                        }
                        
                        .greeting {
                            color: #ffffff !important;
                        }
                        
                        .message {
                            color: #cccccc !important;
                        }
                        
                        .footer {
                            background-color: #2a2a2a !important;
                            border-top-color: #444444 !important;
                        }
                    }
                    
                    /* Outlook and email client specific fixes */
                    .ExternalClass {
                        width: 100%;
                    }
                    
                    .ExternalClass,
                    .ExternalClass p,
                    .ExternalClass span,
                    .ExternalClass font,
                    .ExternalClass td,
                    .ExternalClass div {
                        line-height: 100%;
                    }
                    
                    /* Image fallback handling */
                    .logo-img {
                        max-width: 60px !important;
                        max-height: 60px !important;
                    }
                    
                    /* Show fallback if image fails to load */
                    .logo-img[alt]:after { 
                        display: none;
                    }
                    
                    /* Ensure proper image display in Outlook */
                    img {
                        border: 0;
                        display: block;
                        outline: none;
                        text-decoration: none;
                        -ms-interpolation-mode: bicubic;
                    }
                </style>
            </head>
            <body>
                <div class="email-wrapper">
                    <div class="email-container">
                        <div class="header">
                            <div class="logo">
                                <img src="https://static.vecteezy.com/system/resources/previews/015/130/843/original/check-mark-icon-free-png.png" 
                                     alt="Checkmark" 
                                     class="logo-img"
                                     width="60" 
                                     height="60"
                                     style="display: block; width: 60px; height: 60px; object-fit: contain; filter: brightness(0) invert(1);">
                                <span class="logo-fallback">✓</span>
                            </div>
                            <h1>Verify Your Email</h1>
                        </div>
                        
                        <div class="content">
                            <div class="greeting">Hello ${user.name || 'there'},</div>
                            
                            <div class="message">
                                Welcome to <strong>QuickPoll</strong>! We're excited to have you join our quickpoll platform. 
                                To complete your registration and start organizing your polls, please verify your email address 
                                by clicking the button below.
                            </div>
                            
                            <div class="button-container">
                                <a href="${link}" class="verify-button" target="_blank" rel="noopener noreferrer">
                                    Verify Email Address
                                </a>
                            </div>
                            
                            <div class="security-notice">
                                ⏰ This verification link will expire in 24 hours for security reasons.
                            </div>
                            
                            <div class="alternative-link">
                                <p><strong>Having trouble with the button?</strong></p>
                                <p>Copy and paste this link into your browser:</p>
                                <div class="link-text">${link}</div>
                            </div>
                            
                            <div class="warning-text">
                                If you didn't create an account with QuickPoll, please ignore this email or 
                                <a href="mailto:support@quickpoll.com" class="support-link">contact our support team</a> 
                                if you have concerns.
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p class="company-name">QuickPoll</p>
                            <p>Your Personal QuickPoll Solution</p>
                            <p>
                                Need help? Contact us at 
                                <a href="mailto:support@quickpoll.com" class="support-link">support@quickpoll.com</a>
                            </p>
                            
                            <div class="footer-links">
                                © 2025 QuickPoll. All rights reserved.<br>
                                <a href="#" onclick="return false;">Unsubscribe</a> | 
                                <a href="#" onclick="return false;">Privacy Policy</a> |
                                <a href="#" onclick="return false;">Terms of Service</a>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>`;
};

module.exports = getVerificationEmailHtml;