// controllers/authController.js
const userModel = require("../models/userModel");
const redisClient = require("../config/redis");
const {
    sendVerificationMail,
    sendForgotPasswordMail,
    sendPasswordChangedMail,
} = require("../utils/sendEmail");
const { generateToken } = require("../utils/jwt");
const {
    validateRequiredFields,
    validateEmail,
} = require("../utils/validateRequest");
const config = require("../config/config");

const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        const missingFields = validateRequiredFields(req.body, [
            "name",
            "email",
            "password",
        ]);

        if (missingFields.length) {
            return res.status(400).json({
                success: false,
                message: `Missing required field(s): ${missingFields.join(", ")}`,
            });
        }

        if (!validateEmail(email)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid email format" });
        }

        const normalizedEmail = email.toLowerCase();
        let user = await userModel.findOne({ email: normalizedEmail });

        if (user && user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email",
            });
        }

        if (user) {
            user.name = name;
            user.password = password;
            await user.save();
        } else {
            user = new userModel({ name, email: normalizedEmail, password });
            await user.save();
        }

        await sendVerificationMail(user);
        return res.status(201).json({
            success: true,
            message: "Verification email sent successfully",
        });
    } catch (error) {
        return next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const missingFields = validateRequiredFields(req.body, [
            "email",
            "password",
        ]);

        if (missingFields.length) {
            return res.status(400).json({
                success: false,
                message: `Missing required field(s): ${missingFields.join(", ")}`,
            });
        }

        if (!validateEmail(email)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid email format" });
        }

        const normalizedEmail = email.toLowerCase();
        const user = await userModel.findOne({ email: normalizedEmail });

        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        if (!user.isVerified) {
            return res
                .status(403)
                .json({ success: false, message: "Email is not verified" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid password" });
        }

        const token = generateToken(user);
        return res
            .status(200)
            .json({ success: true, message: "Login successful", token, user });
    } catch (error) {
        return next(error);
    }
};

const verifyToken = async (req, res, next) => {
    try {
        const { token } = req.params;
        if (!token) {
            return res
                .status(400)
                .json({ message: "Verification token is required." });
        }

        const email = await redisClient.get(`verify:${token}`);
        if (!email) {
            return res
                .status(410)
                .json({ message: "Invalid or expired verification link." });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ message: "User associated with this token was not found." });
        }

        if (user.isVerified) {
            await redisClient.del(`verify:${token}`);
            return res.status(200).json({ message: "Email already verified." });
        }

        user.isVerified = true;
        await user.save();
        await redisClient.del(`verify:${token}`);

        return res.redirect(`${config.client_url}/verified-successful`);
    } catch (error) {
        return next(error);
    }
};

const forgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!validateEmail(email)) {
            return res
                .status(400)
                .json({ success: false, message: "Valid email is required." });
        }

        const normalizedEmail = email.toLowerCase();
        const user = await userModel.findOne({ email: normalizedEmail });

        if (!user || !user.isVerified) {
            return res.status(404).json({
                success: false,
                message: "User not found or email not verified.",
            });
        }

        await sendForgotPasswordMail(user);
        return res
            .status(200)
            .json({
                success: true,
                message: "Password reset email sent successfully.",
            });
    } catch (error) {
        return next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { newPassword, confirmNewPassword } = req.body;

        if (!token || !newPassword || !confirmNewPassword) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Token, new password, and confirm password are required.",
                });
        }

        if (newPassword !== confirmNewPassword) {
            return res
                .status(400)
                .json({ success: false, message: "Passwords do not match." });
        }

        const email = await redisClient.get(`reset:${token}`);
        if (!email) {
            return res
                .status(410)
                .json({
                    success: false,
                    message: "Invalid or expired password reset link.",
                });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found." });
        }

        user.password = newPassword;
        await user.save();
        await redisClient.del(`reset:${token}`);
        await sendPasswordChangedMail(user);

        return res
            .status(200)
            .json({ success: true, message: "Password reset successfully." });
    } catch (error) {
        return next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        const missingFields = validateRequiredFields(req.body, [
            "oldPassword",
            "newPassword",
            "confirmNewPassword",
        ]);
        if (missingFields.length) {
            return res.status(400).json({
                success: false,
                message: `Missing required field(s): ${missingFields.join(", ")}`,
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res
                .status(400)
                .json({ success: false, message: "Passwords do not match." });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found." });
        }

        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, message: "Old password is incorrect." });
        }

        user.password = newPassword;
        await user.save();
        await sendPasswordChangedMail(user);

        return res
            .status(200)
            .json({ success: true, message: "Password changed successfully." });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    register,
    verifyToken,
    login,
    forgetPassword,
    resetPassword,
    changePassword,
};