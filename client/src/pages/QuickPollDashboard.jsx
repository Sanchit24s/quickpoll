import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart3, TrendingUp, Users, Clock, X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { usePollApi } from "../hooks/usePollApi";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";
import PollCard from "@/components/PollCard";
import FilterControls from "@/components/FilterControls";
import StatsCard from "@/components/StatsCard";

// Toast Component
const Toast = ({ toast, onClose }) => {
    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info
    };

    const colors = {
        success: 'bg-green-500 border-green-600',
        error: 'bg-red-500 border-red-600',
        info: 'bg-blue-500 border-blue-600'
    };

    const Icon = icons[toast.type] || Info;

    return (
        <div className={`${colors[toast.type]} border-l-4 p-4 rounded-lg shadow-lg backdrop-blur-md text-white flex items-center justify-between min-w-80 animate-in slide-in-from-right duration-300`}>
            <div className="flex items-center space-x-3">
                <Icon size={20} />
                <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
                onClick={() => onClose(toast.id)}
                className="text-white/80 hover:text-white transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
};

// Toast Container
const ToastContainer = ({ toasts, onClose }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </div>
    );
};

// Debounce utility
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

const QuickPollDashboard = () => {
    const { getAllPolls, deactivatePoll } = usePollApi();
    const [polls, setPolls] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortFilter, setSortFilter] = useState("newest");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [toasts, setToasts] = useState([]);
    const [retryAfter, setRetryAfter] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Use refs to track current values and prevent stale closures
    const abortControllerRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const toastIdRef = useRef(0);

    // Get token from your auth system
    const [token, setToken] = useState(null);

    // Initialize token on component mount
    useEffect(() => {
        // Replace this with your actual token retrieval logic
        // For example: from context, auth provider, or secure storage
        const authToken = getAuthToken(); // Implement this function
        setToken(authToken);
    }, []);

    // Mock function - replace with your actual auth token retrieval
    const getAuthToken = () => {
        // In a real app, get this from your auth context/provider
        const token = localStorage.getItem("token");
        return token;
    };

    // Toast management
    const addToast = useCallback((type, message) => {
        const id = ++toastIdRef.current;
        const toast = { id, type, message };
        setToasts(prev => [...prev, toast]);

        // Auto-remove toast after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Stable fetch function that doesn't change on every render
    const fetchPolls = useCallback(async (searchTerm = "") => {
        if (!token) return; // Don't fetch if no token

        // Check rate limiting
        if (retryAfter && Date.now() < retryAfter) {
            const secondsLeft = Math.ceil((retryAfter - Date.now()) / 1000);
            addToast("error", `Too many requests. Please retry after ${secondsLeft} seconds.`);
            return;
        }

        // Prevent concurrent requests
        if (isLoading) return;

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setIsLoading(true);

        try {
            const data = await getAllPolls({
                statusFilter,
                sortFilter,
                searchQuery: searchTerm,
                page: currentPage,
                token,
                signal
            });

            if (signal.aborted) return; // Request was cancelled

            if (data.success) {
                setPolls(data.polls);
                setTotalPages(data.totalPages);
                setRetryAfter(null);
            } else {
                addToast("error", "Failed to fetch polls");
            }
        } catch (error) {
            if (error.name === "AbortError" || signal.aborted) {
                return; // Request was cancelled, don't show error
            }

            if (error.response?.status === 429) {
                const retryAfterSeconds = error.response.headers["retry-after"]
                    ? parseInt(error.response.headers["retry-after"], 10) * 1000
                    : 60000;
                setRetryAfter(Date.now() + retryAfterSeconds);
                addToast("error", `Too many requests. Please retry after ${retryAfterSeconds / 1000} seconds.`);
            } else {
                addToast("error", error.message || "Error fetching polls");
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [statusFilter, sortFilter, currentPage, token, retryAfter, isLoading, getAllPolls, addToast]);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((searchTerm) => {
            fetchPolls(searchTerm);
        }, 500),
        [fetchPolls]
    );

    // Effect for initial load and filter changes (not search)
    useEffect(() => {
        if (token) {
            fetchPolls(searchQuery);
        }

        // Cleanup on unmount
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [statusFilter, sortFilter, currentPage, token]); // Intentionally exclude searchQuery

    // Handle search changes with debouncing
    const handleSearchChange = useCallback((value) => {
        setSearchQuery(value);

        // Clear existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Cancel current request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Set new timeout for search
        searchTimeoutRef.current = setTimeout(() => {
            fetchPolls(value);
        }, 500);
    }, [fetchPolls]);

    // Calculate statistics
    const stats = useMemo(() => {
        const totalPolls = polls.length;
        const activePolls = polls.filter(
            (poll) => poll.isActive && new Date(poll.endTime) > new Date()
        ).length;
        const totalVotes = polls.reduce((sum, poll) => sum + poll.totalVotes, 0);
        const avgVotes = totalPolls > 0 ? Math.round(totalVotes / totalPolls) : 0;

        return { totalPolls, activePolls, totalVotes, avgVotes };
    }, [polls]);

    // Event handlers
    const handleViewPoll = useCallback((shareableId) => {
        addToast("info", `Opening poll ${shareableId}...`);
        // Add your navigation logic here
        // For example: navigate(`/poll/${shareableId}`);
    }, [addToast]);

    const handleSharePoll = useCallback(async (shareableId) => {
        try {
            const url = `${window.location.origin}/poll/${shareableId}`;
            await navigator.clipboard.writeText(url);
            addToast("success", "Poll link copied to clipboard!");
        } catch (err) {
            addToast("error", "Failed to copy link");
        }
    }, [addToast]);

    const handleDeletePoll = useCallback(async (shareableId) => {
        if (!window.confirm("Are you sure you want to deactivate this poll? This action cannot be undone.")) {
            return;
        }

        try {
            const data = await deactivatePoll(shareableId, token);
            if (data.success || data.message === "Poll has already expired" || data.message === "Poll was already deactivated") {
                setPolls(prev =>
                    prev.map((poll) =>
                        poll.shareableId === shareableId
                            ? { ...poll, isActive: false }
                            : poll
                    )
                );
                addToast("success", "Poll deactivated successfully!");
            } else {
                addToast("error", "Failed to deactivate poll");
            }
        } catch (error) {
            addToast("error", error.response.data.message || "Error deactivating poll");
        }
    }, [deactivatePoll, token, addToast]);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-800 text-white">
            <ToastContainer toasts={toasts} onClose={removeToast} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                        Poll Dashboard
                    </h1>
                    <p className="text-lg text-white/70 max-w-2xl mx-auto">
                        Manage and monitor all your polls in one place with real-time analytics
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatsCard
                        icon={BarChart3}
                        number={stats.totalPolls}
                        label="Total Polls"
                        gradient="from-blue-500 to-indigo-600"
                    />
                    <StatsCard
                        icon={TrendingUp}
                        number={stats.activePolls}
                        label="Active Polls"
                        gradient="from-green-500 to-emerald-600"
                    />
                    <StatsCard
                        icon={Users}
                        number={stats.totalVotes}
                        label="Total Votes"
                        gradient="from-purple-500 to-pink-600"
                    />
                    <StatsCard
                        icon={Clock}
                        number={stats.avgVotes}
                        label="Avg Votes/Poll"
                        gradient="from-orange-500 to-red-600"
                    />
                </div>

                <FilterControls
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    sortFilter={sortFilter}
                    setSortFilter={setSortFilter}
                    searchQuery={searchQuery}
                    setSearchQuery={handleSearchChange}
                />

                {isLoading && (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        <p className="text-white/70 mt-2">Loading polls...</p>
                    </div>
                )}

                {!isLoading && polls.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {polls.map((poll) => (
                                <PollCard
                                    key={poll._id}
                                    poll={poll}
                                    onView={handleViewPoll}
                                    onShare={handleSharePoll}
                                    onDelete={handleDeletePoll}
                                />
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                ) : !isLoading ? (
                    <EmptyState />
                ) : null}
            </div>
        </div>
    );
};

export default QuickPollDashboard;