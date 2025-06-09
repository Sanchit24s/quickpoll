require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");

const config = require("./config/config");
const connectDB = require("./config/db");
const logger = require("./config/logger");
const redisClient = require("./config/redis");
const limiter = require("./middlewares/rateLimiter");
const router = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");
const { initializeSocket } = require("./services/socketService");

const app = express();

const server = http.createServer(app);

initializeSocket(server);

// Middlewares
app.use(helmet());
app.use(cors({
    origin: config.client_url,
    credentials: true,
}));
app.use(express.json());
app.use(
    morgan("combined", {
        stream: {
            write: (message) => logger.info(message.trim()),
        },
    })
);
// app.use(limiter);

app.use("/api/v1", router);
app.use(errorHandler);

connectDB();

app.get("/", (req, res) => {
    res.json({ msg: "Hello" });
});

const PORT = config.port;

server.listen(PORT, () => {
    logger.info(`🚀 Server started on port: ${PORT}`);
});

// Graceful Shutdown
process.on("SIGINT", async () => {
    logger.info("🛑 Gracefully shutting down...");
    try {
        await redisClient.quit();
    } catch (err) {
        logger.error("❌ Redis quit failed:", err);
    }

    server.close(() => {
        logger.info("✅ HTTP server closed.");
        process.exit(0);
    });
});