import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Share2, Users, Clock } from "lucide-react";
import { useSocket } from "../contexts/SocketContext";
import CountdownTimer from "../components/CountdownTimer";
import { usePollApi } from "../hooks/usePollApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewPoll = () => {
  const { shareableId } = useParams();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [retryAfter, setRetryAfter] = useState(null);
  const [socketError, setSocketError] = useState(false);
  const [isPollExpired, setIsPollExpired] = useState(false);

  const { socket } = useSocket();
  const { getPollByShareableId, voteOnPoll } = usePollApi();
  const navigate = useNavigate();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Download React DevTools: https://react.dev/link/react-devtools"
      );
    }
  }, []);

  useEffect(() => {
    let retryTimeout;
    const fetchPoll = async () => {
      try {
        const data = await getPollByShareableId(shareableId);
        setPoll(data);
        setTotalVotes(data.totalVotes);
        setRetryAfter(null);

        // Check if poll is expired (either endTime has passed or isActive is false)
        const endTime = new Date(data.endTime).getTime();
        setIsPollExpired(endTime < Date.now() || !data.isActive);
      } catch (err) {
        if (err.response?.status === 429) {
          const retryTime = err.response.data?.retryAfter || "1 minute";
          setRetryAfter(retryTime);
          toast.error(`Too many requests. Retry after ${retryTime}.`);
          retryTimeout = setTimeout(fetchPoll, parseRetryAfter(retryTime));
        } else {
          toast.error(err.message || "Failed to load poll.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
    return () => clearTimeout(retryTimeout);
  }, [shareableId]);

  const parseRetryAfter = (retryAfter) => {
    if (typeof retryAfter === "number") return retryAfter * 1000;
    const [value, unit] = retryAfter.split(" ");
    const num = parseInt(value, 10);
    return unit.includes("minute") ? num * 60 * 1000 : num * 1000;
  };

  useEffect(() => {
    if (!socket || !poll) return;

    socket.on("connect_error", () => {
      setSocketError(true);
      toast.error("Real-time connection failed. Using fallback mode.");
    });

    socket.emit("join-poll", poll.id);
    socket.on("vote-update", (updatedPoll) => {
      setPoll(updatedPoll);
      setTotalVotes(updatedPoll.totalVotes);
      setIsPollExpired(new Date(updatedPoll.endTime).getTime() < Date.now() || !updatedPoll.isActive);
    });

    socket.on("poll-closed", (updatedPoll) => {
      setPoll(updatedPoll);
      setIsPollExpired(true);
    });

    return () => {
      socket.emit("leave-poll", poll.id);
      socket.off("vote-update");
      socket.off("poll-closed");
      socket.off("connect_error");
    };
  }, [socket, poll]);

  const handleVote = async () => {
    if (selectedOption === null || voting || isPollExpired) return;

    setVoting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const updatedPoll = await voteOnPoll(
        poll.shareableId,
        selectedOption,
        token
      );
      setPoll(updatedPoll);
      setTotalVotes(updatedPoll.totalVotes);
      setHasVoted(true);
      toast.success("Vote submitted successfully!");
      setTimeout(() => {
        navigate("/");
      }, 5000);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit vote");
    } finally {
      setVoting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/poll/${shareableId}`
    );
    toast.success("Poll link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mr-3 text-indigo-500" />
            <span className="text-gray-700">Loading poll...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-800 p-4">
        <Card className="w-full max-w-md bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#3f3cbb] border-gray-700">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-white mb-2">Poll Not Found</h2>
            <p className="text-gray-300">
              {retryAfter
                ? `Rate limit exceeded. Please try again after ${retryAfter}.`
                : "The poll you're looking for doesn't exist."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-800 py-8 px-4">
      <ToastContainer theme="dark" />
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#3f3cbb] border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl md:text-2xl mb-2 text-white">
                  {poll.question}
                </CardTitle>
                <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-indigo-400" />
                    {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
                  </div>
                  {!isPollExpired && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <CountdownTimer endTime={poll.endTime} isActive={poll.isActive} />
                    </div>
                  )}
                  {socketError && (
                    <span className="text-red-400 text-sm">
                      Real-time updates unavailable
                    </span>
                  )}
                  {isPollExpired && (
                    <span className="text-red-400 text-sm">
                      Poll has expired
                    </span>
                  )}
                </div>
              </div>
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="border-indigo-500 text-indigo-400 hover:bg-indigo-600/30"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#3f3cbb] border-gray-700">
          <CardContent className="pt-6">
            {hasVoted ? (
              <h3 className="font-semibold text-lg text-green-400">
                Thank you for voting!
              </h3>
            ) : isPollExpired ? (
              <h3 className="font-semibold text-lg text-red-400">
                This poll has expired.
              </h3>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-indigo-300">
                  Cast your vote:
                </h3>
                <div className="space-y-3">
                  {poll.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedOption === index
                          ? "border-indigo-500 bg-indigo-700"
                          : "border-gray-700 hover:border-indigo-500"
                        }`}
                      onClick={() => setSelectedOption(index)}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="poll-option"
                          checked={selectedOption === index}
                          onChange={() => setSelectedOption(index)}
                          className="mr-3 accent-indigo-500"
                        />
                        <span className="text-gray-200">{option.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleVote}
                  disabled={selectedOption === null || voting || isPollExpired}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {voting ? "Recording Vote..." : "Submit Vote"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewPoll;