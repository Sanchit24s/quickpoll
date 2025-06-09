require("dotenv").config();
const { createClient } = require("redis");
const logger = require("./logger");
const config = require("./config");

// Create Redis client
const redisClient = createClient({
    username: "default",
    password: config.redis_password,
    socket: {
        host: config.redis_host,
        port: Number(config.redis_port) || 6379,
    },
});

redisClient.on("error", (err) => {
    logger.error(`❌ Redis Client Error: ${err.message}`);
});

const connectRedis = async () => {
    try {
        await redisClient.connect();
        logger.info("✅ Connected to Redis successfully");
    } catch (error) {
        logger.error(`❌ Could not connect to Redis: ${error.message}`);
    }
};

connectRedis();

module.exports = redisClient;