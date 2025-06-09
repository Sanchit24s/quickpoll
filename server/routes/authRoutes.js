const express = require("express");
const {
    register,
    verifyToken,
    login,
    forgetPassword,
    resetPassword,
    changePassword,
} = require("../controllers/authController");
const { authenticate } = require("../middlewares/authMiddleware");
const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/verify/:token", verifyToken);

authRouter.post("/forgot-password", forgetPassword);
authRouter.post("/reset-password/:token", resetPassword);
authRouter.post("/change-password", authenticate, changePassword);

module.exports = authRouter;