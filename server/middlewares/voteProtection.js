const rateLimit = require("express-rate-limit");
const { getClientIp } = require("../utils/helpers");
const logger = require("../config/logger");
const redisClient = require("../config/redis");

// Rate limiting for poll creation
const createPollLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: "Too many polls created from this IP, please try again later.",
        retryAfter: "15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getClientIp(req),
});

// Rate limiting for voting
const voteLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: {
        error: "Too many votes from this IP, please slow down.",
        retryAfter: "1 minute",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getClientIp(req),
});

// Rate limiting for getting poll data
const getPollLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 60,
    message: {
        error: "Too many requests from this IP, please try again later.",
        retryAfter: "1 minute",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getClientIp(req),
});

const voteTracker = {
    async hasVoted(pollId, ip) {
        try {
            const isMember = await redisClient.sIsMember(`poll_votes:${pollId}`, ip);
            return isMember === 1;
        } catch (err) {
            logger.error(`Redis hasVoted error: ${err.message}`);
            return false;
        }
    },

    async recordVote(pollId, ip, ttlSeconds = 30 * 24 * 60 * 60) {
        try {
            await redisClient.sAdd(`poll_votes:${pollId}`, ip);
            const ttl = await redisClient.ttl(`poll_votes:${pollId}`);
            if (ttl === -1) {
                await redisClient.expire(`poll_votes:${pollId}`, ttlSeconds);
            }
            logger.info(`Vote recorded in Redis: pollId=${pollId}, ip=${ip}`);
        } catch (err) {
            logger.error(`Redis recordVote error: ${err.message}`);
        }
    },

    async removePoll(pollId) {
        try {
            await redisClient.del(`poll_votes:${pollId}`);
            logger.info(`Removed Redis vote data for pollId=${pollId}`);
        } catch (err) {
            logger.error(`Redis removePoll error: ${err.message}`);
        }
    },

    async getVoteCount(pollId) {
        try {
            const count = await redisClient.sCard(`poll_votes:${pollId}`);
            return count || 0;
        } catch (err) {
            logger.error(`Redis getVoteCount error: ${err.message}`);
            return 0;
        }
    },
};

const preventDuplicateVote = async (req, res, next) => {
    try {
        const { shareableId } = req.params;
        const voterIp = getClientIp(req);

        if (!shareableId) {
            logger.warn("Missing shareableId in preventDuplicateVote");
            return res.status(400).json({ error: "Poll ID is required" });
        }

        const alreadyVoted = await voteTracker.hasVoted(shareableId, voterIp);
        if (alreadyVoted) {
            logger.warn(
                `Duplicate vote attempt: pollId=${shareableId}, ip=${voterIp}`
            );
            return res
                .status(400)
                .json({ error: "You have already voted in this poll" });
        }

        req.voteTracker = voteTracker;
        req.voterIp = voterIp;
        next();
    } catch (err) {
        logger.error(`Error in preventDuplicateVote: ${err.message}`);
        next(err);
    }
};

const validateWithRateLimit = (validator) => [
    validator,
    (req, res, next) => {
        res.locals.rateLimit = {
            windowMs: req.rateLimit?.windowMs,
            max: req.rateLimit?.max,
            current: req.rateLimit?.current,
            remaining: req.rateLimit?.remaining,
        };
        next();
    },
];

const checkPollAccess = (req, res, next) => {
    const { shareableId } = req.params;

    if (
        !shareableId ||
        typeof shareableId !== "string" ||
        shareableId.length !== 8
    ) {
        logger.warn(`Invalid shareableId format: ${shareableId}`);
        return res.status(400).json({ error: "Invalid poll ID format" });
    }

    next();
};

module.exports = {
    createPollLimiter,
    voteLimiter,
    getPollLimiter,
    preventDuplicateVote,
    validateWithRateLimit,
    checkPollAccess,
    voteTracker,
};
