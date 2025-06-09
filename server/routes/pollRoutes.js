const express = require("express");
const pollRouter = express.Router();
const {
    deactivatePoll,
    voteOnPoll,
    getPollByShareableId,
    createPoll,
    getAllPolls,
    getPollResults,
    getPollResultsSummary,
    exportPollResults,
} = require("../controllers/pollController");

const {
    createPollLimiter,
    voteLimiter,
    getPollLimiter,
    preventDuplicateVote,
    checkPollAccess,
} = require("../middlewares/voteProtection");
const { authenticate } = require("../middlewares/authMiddleware");
const { validateGetAllPollsQuery } = require("../middlewares/validation");

// get all
pollRouter.get("/getAll", authenticate, validateGetAllPollsQuery, getAllPolls);

// create
pollRouter.post("/createPoll", createPollLimiter, authenticate, createPoll);

// get
pollRouter.get(
    "/:shareableId",
    checkPollAccess,
    getPollLimiter,
    getPollByShareableId
);

// result
pollRouter.get("/:shareableId/results", authenticate, getPollResults);

// summary
pollRouter.get("/results/summary", authenticate, getPollResultsSummary);

// export
pollRouter.get("/:shareableId/export", authenticate, exportPollResults);

// vote
pollRouter.post(
    "/:shareableId/vote",
    checkPollAccess,
    voteLimiter,
    preventDuplicateVote,
    voteOnPoll
);

// deactivate
pollRouter.patch(
    "/:shareableId/deactivate",
    checkPollAccess,
    authenticate,
    deactivatePoll
);

module.exports = pollRouter;
