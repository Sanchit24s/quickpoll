const socketIo = require("socket.io");
const Poll = require("../models/pollModel");
const {
    calculatePercentages,
    formatTimeRemaining,
} = require("../utils/helpers");
const logger = require("../config/logger");
const config = require("../config/config");


const pollRooms = new Map();
let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: config.client_url || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        logger.info(`User connected: ${socket.id}`);

        socket.on("join_poll", async (shareableId) => {
            try {
                const poll = await Poll.findOne({ shareableId });
                if (!poll) return socket.emit("error", { message: "Poll not found" });

                for (const room of socket.rooms) {
                    if (room.startsWith("poll_")) socket.leave(room);
                }

                const roomName = `poll_${shareableId}`;
                socket.join(roomName);

                if (!pollRooms.has(shareableId)) {
                    pollRooms.set(shareableId, new Set());
                }
                pollRooms.get(shareableId).add(socket.id);

                await sendPollUpdate(shareableId);
                logger.info(`Socket ${socket.id} joined room ${roomName}`);
            } catch (err) {
                logger.error("join_poll error:", err);
                socket.emit("error", { message: "Failed to join poll" });
            }
        });

        socket.on("leave_poll", (shareableId) => {
            const roomName = `poll_${shareableId}`;
            socket.leave(roomName);

            if (pollRooms.has(shareableId)) {
                pollRooms.get(shareableId).delete(socket.id);
                if (pollRooms.get(shareableId).size === 0) {
                    pollRooms.delete(shareableId);
                }
            }

            logger.info(`Socket ${socket.id} left room ${roomName}`);
        });

        socket.on("vote", async ({ shareableId, optionIndex }) => {
            try {
                const poll = await Poll.findOne({ shareableId });
                if (!poll)
                    return socket.emit("vote_error", { message: "Poll not found" });
        
                await poll.checkAndDeactivate();
        
                if (poll.isExpired || !poll.isActive) {
                    return socket.emit("vote_error", { message: "Poll is no longer active." });
                }
        
                // Validate option index
                if (
                    typeof optionIndex !== "number" ||
                    optionIndex < 0 ||
                    optionIndex >= poll.options.length
                ) {
                    return socket.emit("vote_error", { message: "Invalid option index." });
                }
        
                // Use socket ID or IP to prevent duplicate voting (optional)
                const voterIp = socket.handshake.address;
                const hasVoted = await voteTracker.hasVoted(shareableId, voterIp);
                if (hasVoted) {
                    return socket.emit("vote_error", { message: "You have already voted." });
                }
        
                poll.options[optionIndex].votes += 1;
                poll.totalVotes += 1;
                await poll.save();
        
                await voteTracker.recordVote(shareableId, voterIp);
        
                socket.emit("vote_success", { message: "Vote recorded", optionIndex });
                await sendPollUpdate(shareableId);
            } catch (err) {
                logger.error("Socket vote error:", err);
                socket.emit("vote_error", { message: "Internal server error during vote." });
            }
        });
        

        socket.on("disconnect", () => {
            logger.info(`User disconnected: ${socket.id}`);
            pollRooms.forEach((sockets, shareableId) => {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    pollRooms.delete(shareableId);
                }
            });
        });
    });

    startCleanupInterval();
}

async function sendPollUpdate(shareableId) {
    try {
        const poll = await Poll.findOne({ shareableId });
        if (!poll) return;

        await poll.checkAndDeactivate();

        const pollData = {
            id: poll._id,
            shareableId: poll.shareableId,
            question: poll.question,
            options: calculatePercentages(poll.options, poll.totalVotes),
            totalVotes: poll.totalVotes,
            isActive: poll.isActive,
            isExpired: new Date() > poll.endTime,
            endTime: poll.endTime,
            timeRemaining: formatTimeRemaining(poll.endTime),
            createdAt: poll.createdAt,
        };

        const roomName = `poll_${shareableId}`;
        io.to(roomName).emit("poll_update", pollData);

        if (poll.isExpired && !poll.isActive) {
            io.to(roomName).emit("poll_expired", {
                shareableId,
                message: "Poll has expired",
            });
        }
    } catch (err) {
        logger.error("sendPollUpdate error:", err);
    }
}

async function notifyPollExpired(shareableId) {
    if (!shareableId || typeof shareableId !== "string") {
        logger.warn("notifyPollExpired called with invalid shareableId");
        return;
    }

    try {
        const roomName = `poll_${shareableId}`;
        io.to(roomName).emit("poll_expired", {
            shareableId,
            message: "Poll has expired and is now closed",
        });

        logger.info(`Poll ${shareableId} expiration emitted to room ${roomName}`);

        await sendPollUpdate(shareableId);
        logger.info(`Poll ${shareableId} update broadcasted successfully`);
    } catch (error) {
        logger.error(
            `Error notifying expiration for poll ${shareableId}: ${error.message}`
        );
    }
}

function startCleanupInterval() {
    setInterval(async () => {
        try {
            const expiredPolls = await Poll.find({
                endTime: { $lt: new Date() },
                isActive: true,
            });

            for (const poll of expiredPolls) {
                await poll.checkAndDeactivate();
                await notifyPollExpired(poll.shareableId);
            }

            if (expiredPolls.length > 0) {
                logger.info(`Expired ${expiredPolls.length} polls`);
            }
        } catch (err) {
            logger.error("cleanup error:", err);
        }
    }, 60000);
}

function emitToPoll(shareableId, event, data) {
    const roomName = `poll_${shareableId}`;
    io.to(roomName).emit(event, data);
}

function getActivePollRooms() {
    const active = {};
    pollRooms.forEach((sockets, id) => {
        active[id] = sockets.size;
    });
    return active;
}

function getIO() {
    return io;
}

module.exports = {
    initializeSocket,
    emitToPoll,
    getActivePollRooms,
    sendPollUpdate,
    getIO,
    notifyPollExpired,
};
