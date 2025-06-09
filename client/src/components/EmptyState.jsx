// EmptyState.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmptyState = () => {
    const navigate = useNavigate();

    return (
        <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-50">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">No polls found</h3>
            <p className="text-white/70 mb-6">
                Try adjusting your filters or create a new poll to get started.
            </p>
            <Button
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto"
                onClick={() => navigate("/create")}
            >
                <Plus className="w-4 h-4" />
                Create Your First Poll
            </Button>
        </div>
    );
};

export default EmptyState;
