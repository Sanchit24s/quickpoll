// hooks/usePollApi.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_BASE_URL;

const usePollApi = () => {
  const createPoll = async (pollData, token) => {
    try {
      const response = await axios.post(
        `${API_BASE}/poll/createPoll`,
        pollData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error creating poll", error);
    }
  };

  const getPollByShareableId = async (shareableId) => {
    try {
      const response = await axios.get(`${API_BASE}/poll/${shareableId}`);
      console.log("Poll fetched:", response.data);
      return response.data?.poll || response.data;
    } catch (error) {
      console.error(
        "Error fetching poll",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  // Submit a vote on a poll
  const voteOnPoll = async (shareableId, optionIndex) => {
    try {
      const response = await axios.post(
        `${API_BASE}/poll/${shareableId}/vote`,
        { optionIndex }
      );
      console.log("Vote recorded:", response.data);
      return response.data?.poll || response.data;
    } catch (error) {
      console.error(
        "Error voting on poll",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  // Get all polls for the dashboard
  const getAllPolls = async ({
    statusFilter,
    sortFilter,
    searchQuery,
    page,
    token,
  }) => {
    try {
      const response = await axios.get(`${API_BASE}/poll/getAll`, {
        params: {
          statusFilter,
          sortFilter,
          searchQuery,
          page,
          limit: 6,
        },
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching polls for dashboard",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  // Deactivate a poll
  const deactivatePoll = async (shareableId, token) => {
    try {
      const response = await axios.patch(
        `${API_BASE}/poll/${shareableId}/deactivate`,
        {},
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // get poll results
  const getPollResults = async (shareableId, token) => {
    try {
      const response = await axios.get(
        `${API_BASE}/poll/${shareableId}/results`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching poll results",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  // Get poll results summary (probably for dashboard or analytics)
  const getPollResultsSummary = async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/poll/results/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching poll results summary",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  // Export poll results by shareableId (usually file download or CSV export)
  const exportPollResults = async (shareableId, token) => {
    try {
      const response = await axios.get(
        `${API_BASE}/poll/${shareableId}/export`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error exporting poll results",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  return {
    createPoll,
    getPollByShareableId,
    voteOnPoll,
    deactivatePoll,
    getAllPolls,
    getPollResults,
    exportPollResults,
    getPollResultsSummary,
  };
};

export { usePollApi };
