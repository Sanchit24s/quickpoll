
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Share2, Users, Clock } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"

const PollResults = ({ poll }) => {
  const { toast } = useToast()
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0)

  const handleShare = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: poll.question,
          text: "Check out these poll results!",
          url: url,
        })
      } catch (error) {
        copyToClipboard(url)
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Link copied!",
        description: "Poll link has been copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Poll Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-xl md:text-2xl">{poll.question}</CardTitle>
                <Badge variant="secondary">Closed</Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Ended {formatDate(poll.endTime)}
                </div>
              </div>
            </div>
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Final Results</CardTitle>
        </CardHeader>
        <CardContent>
          {totalVotes === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No votes were cast for this poll.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {poll.options
                .map((option, index) => ({
                  ...option,
                  index,
                  percentage: (option.votes / totalVotes) * 100,
                }))
                .sort((a, b) => b.votes - a.votes)
                .map((option, rank) => (
                  <div key={option.index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {rank === 0 && option.votes > 0 && (
                          <Badge className="bg-yellow-100 text-yellow-800">Winner</Badge>
                        )}
                        <span className="font-medium">{option.text}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {option.votes} votes ({option.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={option.percentage} className="h-3" />
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Poll Info */}
      <Card>
        <CardHeader>
          <CardTitle>Poll Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <p className="text-gray-600">{formatDate(poll.createdAt)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Duration:</span>
              <p className="text-gray-600">{poll.duration} hours</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total Votes:</span>
              <p className="text-gray-600">{totalVotes}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <p className="text-gray-600">Closed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PollResults
