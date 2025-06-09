// FilterControls.jsx
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const FilterControls = ({
    statusFilter,
    setStatusFilter,
    sortFilter,
    setSortFilter,
    searchQuery,
    setSearchQuery,
}) => (
    <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
                <Label className="text-white text-sm font-medium min-w-fit">
                    Status:
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] bg-white/10 border-white/30 text-white text-sm backdrop-blur-sm">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-white/30">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-2">
                <Label className="text-white text-sm font-medium min-w-fit">
                    Sort by:
                </Label>
                <Select value={sortFilter} onValueChange={setSortFilter}>
                    <SelectTrigger className="w-[150px] bg-white/10 border-white/30 text-white text-sm backdrop-blur-sm">
                        <SelectValue placeholder="Select sort option" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-white/30">
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="most-votes">Most Votes</SelectItem>
                        <SelectItem value="least-votes">Least Votes</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="flex-1 max-w-md lg:ml-auto">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <Input
                    type="text"
                    placeholder="Search polls..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 text-sm focus:ring-indigo-500 focus:border-indigo-500 backdrop-blur-sm"
                />
            </div>
        </div>
    </div>
);

export default FilterControls;
