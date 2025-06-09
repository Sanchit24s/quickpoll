const jwt = require("jsonwebtoken");
const config = require("../config/config");
const redisClient = require("../config/redis");
const userModel = require("../models/userModel");

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, config.jwt_secret);

        // Try to get user from Redis
        const redisKey = `user:${decoded.id}`;
        let cachedUser = await redisClient.get(redisKey);

        let user;

        if (cachedUser) {
            user = JSON.parse(cachedUser);
        } else {
            user = await userModel.findById(decoded.id).select("-password");

            if (!user) {
                return res.status(401).json({ message: "User no longer exists" });
            }

            // Cache user in Redis for 5 minutes
            await redisClient.setEx(redisKey, 300, JSON.stringify(user));
        }

        req.user = user;
        next();
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            error.statusCode = 401;
            error.message = "Invalid or expired token";
        }

        next(error);
    }
};

module.exports = { authenticate };