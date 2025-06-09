// StatusBadge.jsx
import React from "react";
import { Badge } from "@/components/ui/badge";

const StatusBadge = ({ status }) => {
    const getStatusStyles = (status) => {
        switch (status) {
            case "active":
                return "bg-green-500 text-white";
            case "expired":
                return "bg-red-500 text-white";
            case "inactive":
                return "bg-gray-500 text-white";
            default:
                return "bg-gray-500 text-white";
        }
    };

    return (
        <Badge className={`text-xs font-medium ${getStatusStyles(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
};

export default StatusBadge;
