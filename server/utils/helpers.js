const crypto = require("crypto");
const config = require("../config/config");

// Generate a unique shareable ID for polls
const generateShareableId = () => {
    return crypto.randomBytes(4).toString("hex");
};

//✅ Helper function to filter poll data
const filterPollData = (poll) => {
    const data = {
        question: poll.question,
        options: poll.options.map((option) => ({ text: option.text })),
        isActive: poll.isActive,
        remainingTime: poll.isActive
            ? formatTimeRemaining(poll.endTime)
            : "Expired",
        endTime: poll.endTime,
        shareableId: poll.shareableId,
        totalVotes: poll.totalVotes
    };

    return data;
};

// Format time remaining in human-readable format
const formatTimeRemaining = (endTime) => {
    const now = new Date().getTime();
    const timeLeft = endTime.getTime() - now;

    if (timeLeft <= 0) return "Expired";

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
        (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
};


// Sanitize user input to prevent XSS
const sanitizeInput = (input) => {
    if (typeof input !== "string") return input;

    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
};


// Calculate vote percentages for poll options
const calculatePercentages = (options, totalVotes) => {
    if (totalVotes === 0) {
        return options.map((option) => ({
            ...option,
            percentage: 0,
        }));
    }

    return options.map((option) => ({
        ...option,
        percentage: Math.round((option.votes / totalVotes) * 100 * 10) / 10, // Round to 1 decimal
    }));
};

// Generate a shareable poll URL
const generateShareableUrl = (
    shareableId,
    baseUrl = config.client_url || "http://localhost:3000"
) => {
    return `${baseUrl}/poll/${shareableId}`;
};

// Validate email format 
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Get client IP address from request
const getClientIp = (req) => {
    return (
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
        "0.0.0.0"
    );
};


// Generate poll analytics data
const generatePollAnalytics = (poll) => {
    const totalVotes = poll.totalVotes;
    const optionsWithPercentages = calculatePercentages(poll.options, totalVotes);

    const analytics = {
        pollId: poll._id,
        shareableId: poll.shareableId,
        question: poll.question,
        totalVotes,
        isActive: poll.isActive,
        isExpired: new Date() > poll.endTime,
        createdAt: poll.createdAt,
        endTime: poll.endTime,
        timeRemaining: formatTimeRemaining(poll.endTime),
        options: optionsWithPercentages,
        topOption: optionsWithPercentages.reduce(
            (max, option) => (option.votes > max.votes ? option : max),
            optionsWithPercentages[0]
        ),
        votingRate:
            totalVotes > 0
                ? totalVotes /
                Math.max(1, (new Date() - poll.createdAt) / (1000 * 60 * 60))
                : 0, // votes per hour
    };

    return analytics;
};

// Helper function to format poll data for the dashboard
const formatPollForDashboard = (poll) => {
    return {
        _id: poll._id,
        question: poll.question,
        options: poll.options.map((option) => ({
            text: option.text,
            votes: option.votes,
        })),
        totalVotes: poll.totalVotes,
        isActive: poll.isActive,
        createdAt: poll.createdAt,
        endTime: poll.endTime,
        shareableId: poll.shareableId,
        duration: poll.duration,
    };
};

module.exports = {
    generateShareableId,
    formatTimeRemaining,
    sanitizeInput,
    calculatePercentages,
    generateShareableUrl,
    isValidEmail,
    getClientIp,
    generatePollAnalytics,
    filterPollData,
    formatPollForDashboard,
};
