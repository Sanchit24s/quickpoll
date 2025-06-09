const Poll = require("../models/pollModel");
const {
    emitToPoll,
    sendPollUpdate,
    notifyPollExpired,
} = require("../services/socketService");
const logger = require("../config/logger");
const {
    generateShareableId,
    sanitizeInput,
    getClientIp,
    formatTimeRemaining,
    filterPollData,
    formatPollForDashboard,
    calculatePercentages,
    generateShareableUrl,
    generatePollAnalytics,
} = require("../utils/helpers");
const { voteTracker } = require("../middlewares/voteProtection");

//✅ Create Poll
const createPoll = async (req, res, next) => {
    try {
        const { question, options, durationMinutes } = req.body;

        //✅ Basic input validations
        if (!question || typeof question !== "string") {
            return res.status(400).json({
                success: false,
                message: "Poll question is required and must be a string.",
            });
        }

        if (!Array.isArray(options) || options.length < 2 || options.length > 6) {
            return res.status(400).json({
                success: false,
                message: "Poll must have between 2 to 6 options.",
            });
        }

        if (
            typeof durationMinutes !== "number" ||
            durationMinutes < 1 ||
            durationMinutes > 43200
        ) {
            return res.status(400).json({
                success: false,
                message: "Duration must be between 1 and 43200 minutes (30 days).",
            });
        }

        // Sanitize inputs
        const sanitizedQuestion = sanitizeInput(question.trim());
        const sanitizedOptions = options.map((opt) => {
            if (typeof opt !== "string" || !opt.trim()) {
                throw new Error("Each option must be a non-empty string.");
            }
            return { text: sanitizeInput(opt.trim()) };
        });

        const now = Date.now();
        const duration = durationMinutes * 60 * 1000;

        const poll = await Poll.create({
            question: sanitizedQuestion,
            options: sanitizedOptions,
            duration,
            endTime: new Date(now + duration),
            createdBy: req.user?._id,
            creatorIp: getClientIp(req),
            shareableId: generateShareableId(),
            totalVotes: 0,
            isActive: true,
        });

        emitToPoll(poll.shareableId, "poll_created", poll);

        logger.info(`Poll created successfully: ${poll.shareableId}`);
        return res.status(201).json({ success: true, poll });
    } catch (error) {
        logger.error("Poll creation failed:", error);
        return next(error);
    }
};

// Get Poll by Shareable ID
const getPollByShareableId = async (req, res, next) => {
    try {
        const { shareableId } = req.params;

        const poll = await Poll.findOne({ shareableId }).select(
            "question options.text isActive endTime shareableId totalVotes"
        );

        if (!poll) {
            logger.warn(`Poll not found for shareableId: ${shareableId}`);
            return res
                .status(404)
                .json({ success: false, message: "Poll not found" });
        }

        await poll.checkAndDeactivate();

        logger.info(`Poll fetched for shareableId: ${shareableId}`);

        return res.status(200).json({ success: true, poll: filterPollData(poll) });
    } catch (error) {
        logger.error(`Error in getPollByShareableId: ${error.message}`, { error });
        return next(error);
    }
};

// Vote on Poll
const voteOnPoll = async (req, res, next) => {
    try {
        const { shareableId } = req.params;
        const { optionIndex } = req.body;
        const voterIp = req.voterIp;

        const poll = await Poll.findOne({ shareableId });
        if (!poll) {
            logger.warn(`Vote failed: Poll not found (ID: ${shareableId})`);
            return res.status(404).json({ message: "Poll not found" });
        }

        await poll.checkAndDeactivate();
        if (!poll.isActive || poll.isExpired) {
            logger.warn(`Vote attempt on expired poll: ${shareableId}`);
            return res.status(400).json({ message: "Poll has expired" });
        }

        if (
            typeof optionIndex !== "number" ||
            optionIndex < 0 ||
            optionIndex > poll.options.length
        ) {
            logger.warn(
                `Invalid option index: ${optionIndex} for poll ${shareableId}`
            );
            return res.status(400).json({ message: "Invalid option index" });
        }

        const alreadyVoted = await voteTracker.hasVoted(shareableId, voterIp);
        if (alreadyVoted) {
            logger.warn(`Duplicate vote: IP ${voterIp} on poll ${shareableId}`);
            return res
                .status(400)
                .json({ message: "You have already voted in this poll" });
        }

        poll.options[optionIndex].votes += 1;
        poll.totalVotes += 1;
        await poll.save();

        await voteTracker.recordVote(shareableId, voterIp);

        logger.info(
            `Vote recorded: poll=${shareableId}, option=${optionIndex}, ip=${voterIp}`
        );

        await sendPollUpdate(shareableId);

        return res
            .status(200)
            .json({ message: "Vote recorded", poll: filterPollData(poll) });
    } catch (error) {
        logger.error(
            `Vote error for poll ${req.params?.shareableId}: ${error.message}`
        );
        return next(error);
    }
};

// Deactivate poll manually
const deactivatePoll = async (req, res, next) => {
    const { shareableId } = req.params;

    try {
        const poll = await Poll.findOne({ shareableId });
        if (!poll) {
            logger.warn(`Poll not found during deactivation (ID: ${shareableId})`);
            return res.status(404).json({ message: "Poll not found" });
        }

        await poll.checkAndDeactivate();
        const now = Date.now();
        const filteredPoll = filterPollData(poll);

        if (!poll.isActive) {
            const statusCode = poll.endTime < now ? 410 : 200;
            const message =
                poll.endTime < now
                    ? "Poll has already expired"
                    : "Poll was already deactivated";

            logger.info(`Poll ${shareableId} already inactive: ${message}`);
            return res.status(statusCode).json({ message, poll: filteredPoll });
        }

        poll.isActive = false;
        await poll.save();

        await notifyPollExpired(shareableId);
        logger.info(`Poll ${shareableId} deactivated successfully`);

        return res.status(200).json({
            message: "Poll deactivated",
            poll: filteredPoll,
        });
    } catch (error) {
        logger.error(`Error deactivating poll (${shareableId}): ${error.message}`);
        return next(error);
    }
};

// Get All Polls for Dashboard
const getAllPolls = async (req, res, next) => {
    try {
        const {
            statusFilter = "all",
            sortFilter = "newest",
            searchQuery = "",
            page = 1,
            limit = 6,
        } = req.query;

        const userId = req.user?._id;
        if (!userId) {
            logger.warn("Unauthorized access attempt to getAllPolls.");
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const now = new Date();
        const parsedLimit = Math.max(1, Number(limit));
        const parsedPage = Math.max(1, Number(page));
        const skip = (parsedPage - 1) * parsedLimit;

        // Build query
        const query = { createdBy: userId };

        if (statusFilter === "active") {
            query.isActive = true;
            query.endTime = { $gt: now };
        } else if (statusFilter === "expired") {
            query.$or = [
                { isActive: false },
                { endTime: { $lte: now } }
            ];
        } else if (statusFilter === "inactive") {
            query.isActive = false;
            query.endTime = { $gt: now };
        }

        if (searchQuery) {
            const regex = new RegExp(searchQuery, "i");
            query.$or = [
                ...(query.$or || []),
                { question: { $regex: regex } },
                { "options.text": { $regex: regex } }
            ];
        }

        // Sorting
        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            "most-votes": { totalVotes: -1 },
            "least-votes": { totalVotes: 1 },
        };
        const sort = sortOptions[sortFilter] || { createdAt: -1 };

        logger.info(`Fetching polls for user: ${userId} | Page: ${parsedPage}, Limit: ${parsedLimit}`);

        // Count and fetch in parallel
        const [totalPolls, polls] = await Promise.all([
            Poll.countDocuments(query),
            Poll.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parsedLimit)
                .select("question options totalVotes isActive createdAt endTime shareableId duration")
        ]);

        logger.info(`Fetched ${polls.length} polls out of ${totalPolls} total.`);
        const formattedPolls = polls.map(formatPollForDashboard);

        return res.status(200).json({
            success: true,
            polls: formattedPolls,
            totalPolls,
            totalPages: Math.ceil(totalPolls / parsedLimit),
            currentPage: parsedPage,
        });
    } catch (error) {
        logger.error(`Error in getAllPolls: ${error.message}`, { error });
        return next(error);
    }
};

const getPollResults = async (req, res, next) => {
    try {
        const { shareableId } = req.params;
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        const poll = await Poll.findOne({ shareableId, createdBy: userId }).select(
            "question options totalVotes isActive createdAt endTime shareableId duration createdBy"
        );
        if (!poll) {
            logger.warn(`Poll not found or access denied: ${shareableId} by user ${userId}`);
            return res.status(404).json({ success: false, message: "Poll not found or access denied" });
        }

        await poll.checkAndDeactivate();

        const now = new Date();
        const isExpired = now > poll.endTime;
        const status = poll.isActive && !isExpired ? "active" : isExpired ? "expired" : "deactivated";

        const optionsWithPercentages = poll.options.map(option => {
            const percentage = poll.totalVotes > 0
                ? Math.round((option.votes / poll.totalVotes) * 100)
                : 0;
            return {
                text: option.text,
                votes: option.votes,
                percentage,
            };
        });

        const sortedOptions = [...optionsWithPercentages].sort((a, b) => b.votes - a.votes);
        const highestVoteCount = sortedOptions[0]?.votes || 0;
        const tiedOptions = sortedOptions.filter(opt => opt.votes === highestVoteCount);
        const isTie = poll.totalVotes > 0 && tiedOptions.length > 1;

        const pollAgeHours = Math.max(1, (now - poll.createdAt) / 3600000);
        const averageVotesPerHour = Math.round((poll.totalVotes / pollAgeHours) * 10) / 10;

        const results = {
            pollInfo: {
                id: poll._id,
                shareableId: poll.shareableId,
                question: poll.question,
                status,
                isActive: poll.isActive,
                isExpired,
                shareableUrl: generateShareableUrl(poll.shareableId),
            },
            timing: {
                createdAt: poll.createdAt,
                endTime: poll.endTime,
                duration: poll.duration,
                timeRemaining: formatTimeRemaining(poll.endTime),
                pollAge: {
                    hours: Math.round(pollAgeHours * 10) / 10,
                    days: Math.round((pollAgeHours / 24) * 10) / 10,
                },
            },
            voteStats: {
                totalVotes: poll.totalVotes,
                averageVotesPerHour,
                votingRate: generatePollAnalytics(poll).votingRate,
                participationLevel:
                    poll.totalVotes === 0
                        ? "No votes yet"
                        : poll.totalVotes < 10
                            ? "Low"
                            : poll.totalVotes < 50
                                ? "Medium"
                                : poll.totalVotes < 100
                                    ? "High"
                                    : "Very High",
            },
            options: optionsWithPercentages.map((option, index) => ({
                index,
                text: option.text,
                votes: option.votes,
                percentage: option.percentage,
                isWinning: option.votes === highestVoteCount && poll.totalVotes > 0,
                rank: sortedOptions.findIndex(sorted => sorted.text === option.text) + 1,
            })),
            rankedResults: sortedOptions.map((option, rank) => ({
                rank: rank + 1,
                text: option.text,
                votes: option.votes,
                percentage: option.percentage,
                isWinner: rank === 0 && poll.totalVotes > 0,
            })),
            winner: poll.totalVotes > 0
                ? {
                    text: sortedOptions[0].text,
                    votes: sortedOptions[0].votes,
                    percentage: sortedOptions[0].percentage,
                    isTie,
                }
                : null,
            insights: {
                hasVotes: poll.totalVotes > 0,
                optionsCount: poll.options.length,
                averageVotesPerOption:
                    poll.totalVotes > 0
                        ? Math.round((poll.totalVotes / poll.options.length) * 10) / 10
                        : 0,
                mostPopularOption: poll.totalVotes > 0 ? sortedOptions[0].text : null,
                leastPopularOption:
                    poll.totalVotes > 0 ? sortedOptions[sortedOptions.length - 1].text : null,
                voteDistribution:
                    poll.totalVotes > 0 &&
                        Math.max(...sortedOptions.map(o => o.votes)) -
                        Math.min(...sortedOptions.map(o => o.votes)) <= 1
                        ? "Even"
                        : "Varied",
            },
        };

        logger.info(`Fetched poll results: ${shareableId} by user: ${userId}`);
        return res.status(200).json({ success: true, results });
    } catch (error) {
        logger.error(`Error in getPollResults for ${req.params?.shareableId}: ${error.message}`, { error });
        return next(error);
    }
};



const getPollResultsSummary = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });

        const { limit = 10, sortBy = "newest" } = req.query;
        const parsedLimit = Math.min(50, Math.max(1, Number(limit)));

        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            "most-votes": { totalVotes: -1 },
            "most-active": { isActive: -1, totalVotes: -1 },
        };

        const polls = await Poll.find({ createdBy: userId })
            .sort(sortOptions[sortBy] || { createdAt: -1 })
            .limit(parsedLimit)
            .select("question options totalVotes isActive createdAt endTime shareableId");

        const now = new Date();
        const summaries = polls.map(poll => {
            const isExpired = now > poll.endTime;
            const status = poll.isActive && !isExpired ? "active" : isExpired ? "expired" : "deactivated";
            const optionsWithPercentages = calculatePercentages(poll.options, poll.totalVotes);
            const topOption = optionsWithPercentages.reduce(
                (max, option) => (option.votes > max.votes ? option : max),
                optionsWithPercentages[0]
            );

            return {
                shareableId: poll.shareableId,
                question: poll.question.length > 60 ? `${poll.question.slice(0, 60)}...` : poll.question,
                totalVotes: poll.totalVotes,
                status,
                createdAt: poll.createdAt,
                endTime: poll.endTime,
                timeRemaining: formatTimeRemaining(poll.endTime),
                topOption:
                    poll.totalVotes > 0
                        ? {
                            text: topOption.text,
                            votes: topOption.votes,
                            percentage: topOption.percentage,
                        }
                        : null,
                shareableUrl: generateShareableUrl(poll.shareableId),
            };
        });

        logger.info(`Poll summary fetched: ${summaries.length} polls for user: ${userId}`);
        return res.status(200).json({ success: true, summaries, totalCount: summaries.length });
    } catch (error) {
        logger.error(`Error in getPollResultsSummary: ${error.message}`, { error });
        return next(error);
    }
};

const exportPollResults = async (req, res, next) => {
    try {
        const { shareableId } = req.params;
        const { format = "json" } = req.query;
        const userId = req.user?._id;

        if (!userId) return res.status(401).json({ success: false, message: "Authentication required" });

        const poll = await Poll.findOne({ shareableId, createdBy: userId });
        if (!poll) return res.status(404).json({ success: false, message: "Poll not found or access denied" });

        const optionsWithPercentages = calculatePercentages(poll.options, poll.totalVotes);

        if (format === "csv") {
            const csvHeader = "Option,Votes,Percentage\n";
            const csvRows = optionsWithPercentages
                .map(option => `"${option.text}",${option.votes},${option.percentage}%`)
                .join("\n");

            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename="poll-${shareableId}-results.csv"`);
            return res.status(200).send(csvHeader + csvRows);
        }

        const exportData = {
            poll: {
                question: poll.question,
                shareableId: poll.shareableId,
                createdAt: poll.createdAt,
                endTime: poll.endTime,
                totalVotes: poll.totalVotes,
                isActive: poll.isActive,
            },
            results: optionsWithPercentages,
            exportedAt: new Date().toISOString(),
        };

        logger.info(`Poll exported: ${shareableId} by user ${userId} as ${format}`);
        return res.status(200).json({ success: true, data: exportData });
    } catch (error) {
        logger.error(`Error in exportPollResults for ${req.params?.shareableId}: ${error.message}`, { error });
        return next(error);
    }
};

module.exports = {
    createPoll,
    getPollByShareableId,
    voteOnPoll,
    deactivatePoll,
    getAllPolls,
    getPollResults,
    exportPollResults,
    getPollResultsSummary,
};
