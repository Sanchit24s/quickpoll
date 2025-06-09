// StatsCard.jsx
import React from "react";

const StatsCard = ({
    icon: Icon,
    number,
    label,
    gradient = "from-blue-500 to-purple-600",
}) => (
    <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-200">
        <div
            className={`w-12 h-12 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center mb-4`}
        >
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-2xl font-bold text-white mb-1">
            {number.toLocaleString()}
        </div>
        <div className="text-sm text-white/70">{label}</div>
    </div>
);

export default StatsCard;
