const validatePollData = (req, res, next) => {
    const { question, options, duration } = req.body;

    if (
        !question ||
        typeof question !== "string" ||
        question.trim().length === 0
    ) {
        return res
            .status(400)
            .json({ error: "Question is required and must be a non-empty string" });
    }

    if (question.trim().length > 500) {
        return res
            .status(400)
            .json({ error: "Question must be 500 characters or less" });
    }

    if (!Array.isArray(options) || options.length < 2 || options.length > 6) {
        return res
            .status(400)
            .json({ error: "Must provide between 2 and 6 options" });
    }

    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        if (!option || typeof option !== "string" || option.trim().length === 0) {
            return res.status(400).json({
                error: `Option ${i + 1} is required and must be a non-empty string`,
            });
        }
        if (option.trim().length > 200) {
            return res
                .status(400)
                .json({ error: `Option ${i + 1} must be 200 characters or less` });
        }
    }

    const uniqueOptions = new Set(options.map((opt) => opt.trim().toLowerCase()));
    if (uniqueOptions.size !== options.length) {
        return res.status(400).json({ error: "All options must be unique" });
    }

    // Validate duration
    if (
        !duration ||
        typeof duration !== "number" ||
        duration < 1 ||
        duration > 43200
    ) {
        return res
            .status(400)
            .json({ error: "Duration must be between 1 minute and 30 days" });
    }

    // Sanitize data
    req.body.question = question.trim();
    req.body.options = options.map((opt) => opt.trim());

    next();
};

const validateVote = (req, res, next) => {
    const { optionIndex } = req.body;

    if (
        typeof optionIndex !== "number" ||
        optionIndex < 0 ||
        !Number.isInteger(optionIndex)
    ) {
        return res
            .status(400)
            .json({ error: "Option index must be a non-negative integer" });
    }

    next();
};

// Middleware to validate query parameters for getAllPolls
const validateGetAllPollsQuery = (req, res, next) => {
    const {
        statusFilter = "all",
        sortFilter = "newest",
        searchQuery = "",
        page = "1",
        limit = "6",
    } = req.query;

    const allowedStatus = ["all", "active", "expired", "inactive"];
    const allowedSort = ["newest", "oldest", "most-votes", "least-votes"];

    // Validate statusFilter
    if (!allowedStatus.includes(statusFilter)) {
        return res.status(400).json({
            success: false,
            message: `Invalid statusFilter. Must be one of: ${allowedStatus.join(
                ", "
            )}`,
        });
    }

    // Validate sortFilter
    if (!allowedSort.includes(sortFilter)) {
        return res.status(400).json({
            success: false,
            message: `Invalid sortFilter. Must be one of: ${allowedSort.join(", ")}`,
        });
    }

    // Validate searchQuery (must be a string)
    if (searchQuery && typeof searchQuery !== "string") {
        return res.status(400).json({
            success: false,
            message: "searchQuery must be a string.",
        });
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    // Validate page (must be positive integer)
    if (isNaN(pageNum) || pageNum < 1 || !Number.isInteger(pageNum)) {
        return res.status(400).json({
            success: false,
            message: "page must be a positive integer.",
        });
    }

    // Validate limit (must be between 1 and 100)
    if (
        isNaN(limitNum) ||
        limitNum < 1 ||
        limitNum > 100 ||
        !Number.isInteger(limitNum)
    ) {
        return res.status(400).json({
            success: false,
            message: "limit must be an integer between 1 and 100.",
        });
    }

    next();
};

module.exports = {
    validatePollData,
    validateVote,
    validateGetAllPollsQuery,
};
