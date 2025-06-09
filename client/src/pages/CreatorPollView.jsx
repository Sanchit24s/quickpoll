import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Clock,
    Users,
    Share2,
    Trash2,
    Loader2,
    Trophy,
    BarChart2,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import { useSocket } from "../contexts/SocketContext";
import { usePollApi } from "../hooks/usePollApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreatorPollView = () => {
    const { shareableId } = useParams();
    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [retryAfter, setRetryAfter] = useState(null);
    const [socketError, setSocketError] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const { socket } = useSocket();
    const { getPollResults, deactivatePoll } = usePollApi();

    // Log React DevTools suggestion in development
    useEffect(() => {
        if (process.env.NODE_ENV === "development") {
            console.warn(
                "Download the React DevTools for a better development experience: https://react.dev/link/react-devtools"
            );
        }
    }, []);

    // Fetch poll results with rate-limit handling
    useEffect(() => {
        let retryTimeout;
        const fetchPollResults = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Authentication required");
                const response = await getPollResults(shareableId, token);
                const fetchedPoll = response.results;

                // Validate number of options (schema enforces 2 to 6 options)
                if (fetchedPoll.options.length < 2 || fetchedPoll.options.length > 6) {
                    throw new Error("Poll must have between 2 and 6 options.");
                }

                setPoll(fetchedPoll);
                setValidationError(null);
                setRetryAfter(null);
            } catch (err) {
                if (err.response?.status === 429) {
                    const retryTime = err.response.data?.retryAfter || "1 minute";
                    setRetryAfter(retryTime);
                    toast.error(
                        `Too many requests. Please try again after ${retryTime}.`
                    );
                    retryTimeout = setTimeout(
                        fetchPollResults,
                        parseRetryAfter(retryTime)
                    );
                } else if (err.message.includes("must have between 2 and 6 options")) {
                    setValidationError(err.message);
                } else {
                    toast.error(
                        err.response?.data?.message || "Failed to load poll results."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPollResults();
        return () => clearTimeout(retryTimeout);
    }, [shareableId]);

    // Parse retryAfter string to milliseconds
    const parseRetryAfter = (retryAfter) => {
        if (typeof retryAfter === "number") return retryAfter * 1000;
        const [value, unit] = retryAfter.split(" ");
        const num = parseInt(value, 10);
        return unit.includes("minute") ? num * 60 * 1000 : num * 1000;
    };

    // Handle socket events for real-time updates
    useEffect(() => {
        if (!socket || !poll) return;

        socket.on("connect_error", () => {
            setSocketError(true);
            toast.error(
                "Failed to connect to real-time updates. Using fallback mode."
            );
        });

        socket.emit("join-poll", poll.pollInfo.id);
        socket.on("vote-update", (updatedPoll) => {
            const updatedResults = updatedPoll.results;
            if (
                updatedResults.options.length < 2 ||
                updatedResults.options.length > 6
            ) {
                setValidationError("Poll must have between 2 and 6 options.");
                setPoll(null);
            } else {
                setPoll(updatedResults);
                setValidationError(null);
            }
        });
        socket.on("poll-closed", (updatedPoll) => {
            const updatedResults = updatedPoll.results;
            if (
                updatedResults.options.length < 2 ||
                updatedResults.options.length > 6
            ) {
                setValidationError("Poll must have between 2 and 6 options.");
                setPoll(null);
            } else {
                setPoll(updatedResults);
                setValidationError(null);
            }
        });

        return () => {
            socket.emit("leave-poll", poll.pollInfo.id);
            socket.off("vote-update");
            socket.off("poll-closed");
            socket.off("connect_error");
        };
    }, [socket, poll]);

    // Handle poll deactivation
    const handleDeactivate = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication required");
            await deactivatePoll(poll.pollInfo.shareableId, token);
            toast.success("Poll deactivated successfully!");
            fetchPollResults();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to deactivate poll");
        }
    };

    // Handle sharing poll link
    const handleShare = () => {
        navigator.clipboard.writeText(poll.pollInfo.shareableUrl);
        toast.success("Poll link copied to clipboard!");
    };

    // Helper to determine participation level color
    const getParticipationColor = (level) => {
        switch (level) {
            case "No votes yet":
                return "text-gray-400";
            case "Low":
                return "text-red-400";
            case "Medium":
                return "text-yellow-400";
            case "High":
                return "text-green-400";
            case "Very High":
                return "text-green-500";
            default:
                return "text-gray-300";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-800 p-4">
                <Card className="w-full max-w-md bg-gray-900/80 backdrop-blur-lg border-gray-700 shadow-lg">
                    <CardContent className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mr-3 text-indigo-400" />
                        <span className="text-gray-200 text-lg">Loading poll...</span>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (validationError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-800 p-4">
                <Card className="w-full max-w-md bg-gray-900/80 backdrop-blur-lg border-gray-700 shadow-lg">
                    <CardContent className="text-center py-8">
                        <h2 className="text-2xl font-semibold text-gray-200 mb-3">
                            Invalid Poll
                        </h2>
                        <p className="text-gray-400 text-lg">{validationError}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!poll) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-800 p-4">
                <Card className="w-full max-w-md bg-gray-900/80 backdrop-blur-lg border-gray-700 shadow-lg">
                    <CardContent className="text-center py-8">
                        <h2 className="text-2xl font-semibold text-gray-200 mb-3">
                            Poll Not Found
                        </h2>
                        <p className="text-gray-400 text-lg">
                            {retryAfter
                                ? `Rate limit exceeded. Please try again after ${retryAfter}.`
                                : "The poll you're looking for doesn't exist or you don't have access."}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-800 py-10 px-4 sm:px-6 lg:px-8">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                toastClassName="bg-gray-800 text-gray-200 border border-gray-700 shadow-md"
            />
            <div className="max-w-3xl mx-auto space-y-8">
                <Card className="relative bg-gray-900/80 backdrop-blur-lg border-gray-700 rounded-2xl shadow-xl overflow-hidden">
                    <CardHeader className="border-b border-gray-700/50 pb-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">
                                    {poll.pollInfo.question}
                                </CardTitle>
                                <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-indigo-400" />
                                        <span>
                                            Created:{" "}
                                            {new Date(poll.timing.createdAt).toLocaleDateString(
                                                "en-US",
                                                {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                }
                                            )}
                                        </span>
                                    </div>
                                    {poll.pollInfo.isActive && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-indigo-400" />
                                            <span>{poll.timing.timeRemaining}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4 text-indigo-400" />
                                        <span>
                                            {poll.voteStats.totalVotes}{" "}
                                            {poll.voteStats.totalVotes === 1 ? "vote" : "votes"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-indigo-400" />
                                        <span>
                                            Poll Age: {poll.timing.pollAge.days} days (
                                            {poll.timing.pollAge.hours} hours)
                                        </span>
                                    </div>
                                    {socketError && (
                                        <span className="text-red-400 text-sm">
                                            Real-time updates unavailable
                                        </span>
                                    )}
                                    {(poll.pollInfo.isExpired || !poll.pollInfo.isActive) && (
                                        <span className="text-red-400 text-sm font-medium">
                                            Poll has expired
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleShare}
                                    variant="outline"
                                    size="sm"
                                    className="border-indigo-500 text-indigo-300 bg-indigo-900/30 hover:bg-indigo-700/50 hover:text-indigo-100 transition-all duration-200 rounded-lg shadow-sm"
                                    aria-label="Share poll link"
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                                {poll.pollInfo.isActive && !poll.pollInfo.isExpired && (
                                    <Button
                                        onClick={handleDeactivate}
                                        variant="outline"
                                        size="sm"
                                        className="border-red-500 text-red-300 bg-red-900/30 hover:bg-red-700/50 hover:text-red-100 transition-all duration-200 rounded-lg shadow-sm"
                                        aria-label="Deactivate poll"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Deactivate
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <h3 className="font-semibold text-xl text-indigo-300 mb-4">
                            Poll Results
                        </h3>
                        <div className="space-y-4">
                            {poll.options?.map((option) => (
                                <div
                                    key={option.index}
                                    className="flex flex-col p-4 border border-gray-700/50 rounded-xl bg-gray-800/40 hover:bg-gray-800/70 transition-all duration-200 shadow-sm"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-gray-200 font-medium">
                                                {option.text}
                                            </span>
                                            {option.isWinning && poll.voteStats.totalVotes > 0 && (
                                                <span className="text-green-400 text-sm font-medium flex items-center gap-1">
                                                    <Trophy className="w-4 h-4" />
                                                    Winning
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-gray-300 text-sm font-medium">
                                            {option.votes} {option.votes === 1 ? "vote" : "votes"}
                                        </span>
                                    </div>
                                    <div className="relative w-full h-6 bg-gray-700/50 rounded-full overflow-hidden">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all duration-1000 ease-out"
                                            style={{ width: `${option.percentage}%` }}
                                        >
                                            <span className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-medium text-gray-100">
                                                {option.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {poll.winner && (
                            <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                                <h4 className="text-gray-200 font-semibold text-lg flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-yellow-400" />
                                    Winner
                                </h4>
                                <p className="text-gray-300 mt-2">
                                    {poll.winner.text} with {poll.winner.votes}{" "}
                                    {poll.winner.votes === 1 ? "vote" : "votes"} (
                                    {poll.winner.percentage}%)
                                    {poll.winner.isTie && (
                                        <span className="text-yellow-400 ml-2 font-medium">
                                            (Tie)
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}
                        <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                            <h4 className="text-gray-200 font-semibold text-lg mb-4">
                                Poll Insights
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-indigo-400" />
                                    <span className="text-gray-400">Participation: </span>
                                    <span
                                        className={`font-medium ${getParticipationColor(
                                            poll.voteStats.participationLevel
                                        )}`}
                                    >
                                        {poll.voteStats.participationLevel}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BarChart2 className="w-5 h-5 text-indigo-400" />
                                    <span className="text-gray-400">Average Votes/Hour: </span>
                                    <span className="text-gray-300 font-medium">
                                        {poll.voteStats.averageVotesPerHour}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BarChart2 className="w-5 h-5 text-indigo-400" />
                                    <span className="text-gray-400">Vote Distribution: </span>
                                    <span className="text-gray-300 font-medium">
                                        {poll.insights.voteDistribution}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BarChart2 className="w-5 h-5 text-indigo-400" />
                                    <span className="text-gray-400">Options Count: </span>
                                    <span className="text-gray-300 font-medium">
                                        {poll.insights.optionsCount}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-400" />
                                    <span className="text-gray-400">Most Popular: </span>
                                    <span className="text-gray-300 font-medium">
                                        {poll.insights.mostPopularOption || "N/A"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingDown className="w-5 h-5 text-red-400" />
                                    <span className="text-gray-400">Least Popular: </span>
                                    <span className="text-gray-300 font-medium">
                                        {poll.insights.leastPopularOption || "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CreatorPollView;
