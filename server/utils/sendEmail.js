const crypto = require("crypto");
const config = require("../config/config");
const logger = require("../config/logger");
const transporter = require("../config/mailer");
const redisClient = require("../config/redis");

const getVerificationEmailHtml = require("./emailTemplates/verificationEmailTemplate");
const getForgotPasswordEmailHtml = require("./emailTemplates/forgotPasswordTemplate");
const getPasswordChangedEmailHtml = require("./emailTemplates/passwordChangedTemplate");

// Generate random token
const generateToken = () => crypto.randomBytes(16).toString("hex");

// Store token in Redis
const storeTokenInRedis = async (key, value, expirySeconds) => {
    await redisClient.setEx(key, expirySeconds, value);
};

// Generic send email function
const sendEmail = async ({ to, subject, html }) => {
    const mailOptions = {
        from: '"QuickPoll" <no-reply@quickpoll.com>',
        to,
        subject,
        html,
    };
    await transporter.sendMail(mailOptions);
    logger.info(`[EMAIL SENT] ${subject} to ${to}`);
};

// Send email with token (supports frontend or backend link)
const sendEmailWithToken = async ({
    user,
    prefix,
    expirySeconds,
    templateFn,
    subject,
    path,
    useFrontend = false,
}) => {
    try {
        const token = generateToken();
        const redisKey = `${prefix}:${token}`;

        // Use frontend or backend URL depending on the flag
        const baseUrl = useFrontend ? config.client_url : config.backend_url;
        const link = `${baseUrl}${path}/${token}`;

        await storeTokenInRedis(redisKey, user.email, expirySeconds);
        const html = templateFn(user, link);

        await sendEmail({ to: user.email, subject, html });
    } catch (err) {
        logger.error(
            `[EMAIL ERROR] ${subject} to ${user?.email || "unknown email"}: ${err.message}`,
            { stack: err.stack }
        );
    }
};

// Send verification email (uses backend link)
const sendVerificationMail = (user) =>
    sendEmailWithToken({
        user,
        prefix: "verify",
        expirySeconds: 86400, // 24 hours
        templateFn: getVerificationEmailHtml,
        subject: "Verify Your Email",
        path: "/api/v1/auth/verify",
        useFrontend: false,
    });

// Send forgot password email (uses frontend link)
const sendForgotPasswordMail = (user) =>
    sendEmailWithToken({
        user,
        prefix: "reset",
        expirySeconds: 3600, // 1 hour
        templateFn: getForgotPasswordEmailHtml,
        subject: "Reset Your Password",
        path: "/reset-password",
        useFrontend: true,
    });

// Send confirmation email when password is changed
const sendPasswordChangedMail = async (user) => {
    try {
        const html = getPasswordChangedEmailHtml(user);
        await sendEmail({
            to: user.email,
            subject: "Your Password Has Been Changed",
            html,
        });
    } catch (err) {
        logger.error(
            `[EMAIL ERROR] Password change email to ${user?.email || "unknown email"}: ${err.message}`,
            { stack: err.stack }
        );
    }
};

module.exports = {
    sendVerificationMail,
    sendForgotPasswordMail,
    sendPasswordChangedMail,
};
