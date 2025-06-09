

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Navigate } from "react-router-dom"
// import { usePollApi } from "../hooks/usePollApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, Eye, Users, Clock, BarChart3 } from "lucide-react"

const ResultsDashboard = () => {
  const { user, loading: authLoading, isAdmin } = useAuth()
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPolls: 0,
    activePolls: 0,
    totalVotes: 0,
  })

  const { fetchAllPolls } = usePollApi()

  useEffect(() => {
    const loadPolls = async () => {
      try {
        const pollsData = await fetchAllPolls()
        setPolls(pollsData)

        // Calculate stats
        const totalPolls = pollsData.length
        const activePolls = pollsData.filter((poll) => poll.isActive).length
        const totalVotes = pollsData.reduce(
          (sum, poll) => sum + poll.options.reduce((optSum, opt) => optSum + opt.votes, 0),
          0,
        )

        setStats({ totalPolls, activePolls, totalVotes })
      } catch (error) {
        console.error("Failed to load polls:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user && isAdmin()) {
      loadPolls()
    }
  }, [user, isAdmin, fetchAllPolls])

  if (authLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getTotalVotes = (poll) => {
    return poll.options.reduce((sum, option) => sum + option.votes, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor and manage all polls across the platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPolls}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePolls}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVotes}</div>
            </CardContent>
          </Card>
        </div>

        {/* Polls List */}
        <Card>
          <CardHeader>
            <CardTitle>All Polls</CardTitle>
          </CardHeader>
          <CardContent>
            {polls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No polls found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {polls.map((poll) => {
                  const totalVotes = getTotalVotes(poll)
                  return (
                    <div key={poll.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{poll.question}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Created: {formatDate(poll.createdAt)}</span>
                            <span>Votes: {totalVotes}</span>
                            <Badge variant={poll.isActive ? "default" : "secondary"}>
                              {poll.isActive ? "Active" : "Closed"}
                            </Badge>
                          </div>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <a href={`/poll/${poll.id}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </a>
                        </Button>
                      </div>

                      {/* Poll Results Preview */}
                      <div className="space-y-2">
                        {poll.options.map((option, index) => {
                          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
                          return (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{option.text}</span>
                                <span>
                                  {option.votes} votes ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResultsDashboard
