import React from "react";
import StatusBadge from "./StatusBadge";
import PollOption from "./PollOption";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Users, Eye, Share2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PollCard = ({ poll, onView, onShare, onDelete }) => {
    const navigate = useNavigate();
    const status = poll.isActive
        ? new Date(poll.endTime) > new Date()
            ? "active"
            : "expired"
        : "inactive";
    const maxVotes = Math.max(...poll.options.map((opt) => opt.votes));

    // Format date for display
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Calculate time remaining
    const getTimeRemaining = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end - now;

        if (diff <= 0) return "Expired";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return days > 0 ? `${days}d ${hours}h remaining` : `${hours}h remaining`;
    };

    const handleView = (shareableId) => {
        navigate(`/poll/${shareableId}/creator`);
    };

    return (
        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/20 hover:transform hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white flex-1 pr-4 leading-tight">
                    {poll.question}
                </h3>
                <StatusBadge status={status} />
            </div>

            <div className="flex flex-wrap gap-4 mb-4 text-xs text-white/70">
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(poll.createdAt)}</span>
                </div>
                {poll.isActive && (
                    <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{getTimeRemaining(poll.endTime)}</span>
                    </div>
                )}
                <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{poll.totalVotes} votes</span>
                </div>
                {(!poll.isActive || new Date(poll.endTime) < new Date()) && (
                    <span className="text-red-400 text-xs font-medium">
                        Poll has expired
                    </span>
                )}
            </div>

            <div className="space-y-1 mb-6 flex-grow">
                {poll.options.map((option, index) => (
                    <PollOption key={index} option={option} maxVotes={maxVotes} />
                ))}
            </div>

            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-auto">
                <Button
                    onClick={() => handleView(poll.shareableId)}
                    className="px-3 py-1.5 bg-blue-500/80 hover:bg-blue-600 text-white text-xs rounded-lg flex items-center gap-1 transition-all duration-200 hover:scale-105"
                >
                    <Eye className="w-3 h-3" />
                    View
                </Button>
                <Button
                    onClick={() => onShare(poll.shareableId)}
                    className="px-3 py-1.5 bg-green-500/80 hover:bg-green-600 text-white text-xs rounded-lg flex items-center gap-1 transition-all duration-200 hover:scale-105"
                >
                    <Share2 className="w-3 h-3" />
                    Share
                </Button>
                {poll.isActive && new Date(poll.endTime) > new Date() && (
                    <Button
                        onClick={() => onDelete(poll.shareableId)}
                        className="px-3 py-1.5 bg-red-500/80 hover:bg-red-600 text-white text-xs rounded-lg flex items-center gap-1 transition-all duration-200 hover:scale-105"
                    >
                        <Trash2 className="w-3 h-3" />
                        Deactivate
                    </Button>
                )}
            </div>
        </div>
    );
};

export default PollCard;
