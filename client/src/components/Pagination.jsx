// Pagination.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, "...");
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push("...", totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-white/10 border border-white/30 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
            >
                <ChevronLeft className="w-4 h-4" />
                Previous
            </Button>

            {getVisiblePages().map((page, index) => (
                <Button
                    key={index}
                    onClick={() => typeof page === "number" && onPageChange(page)}
                    className={`px-3 py-2 rounded-lg transition-all duration-200 ${currentPage === page
                            ? "bg-indigo-600 text-white shadow-lg"
                            : typeof page === "number"
                                ? "bg-white/10 border border-white/30 text-white hover:bg-white/20"
                                : "text-white/50 cursor-default"
                        }`}
                    disabled={typeof page !== "number"}
                >
                    {page}
                </Button>
            ))}

            <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-white/10 border border-white/30 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
            >
                Next
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
};

export default Pagination;
