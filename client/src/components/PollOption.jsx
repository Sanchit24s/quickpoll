// PollOption.jsx
import React from "react";

const PollOption = ({ option, maxVotes }) => {
    const percentage = maxVotes > 0 ? (option.votes / maxVotes) * 100 : 0;

    return (
        <div className="flex justify-between items-center py-2">
            <span className="text-sm text-white/90 flex-1 pr-4">{option.text}</span>
            <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-white min-w-[2rem] text-right">
                    {option.votes}
                </span>
                <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PollOption;
