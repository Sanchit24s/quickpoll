
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "../contexts/AuthContext"
import { Plus, Vote, Clock, Share } from "lucide-react"

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-800 text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Hero Section */}
      <div className="text-center mb-20">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
          Create Polls in <span className="text-indigo-400">Seconds</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          QuickPoll makes it easy to create real-time polls, share them instantly, and see live results. No signup required for voters!
        </p>
  
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Button asChild size="lg" className="bg-indigo-500 hover:bg-indigo-600 text-lg px-8 py-3">
              <Link to="/create">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Poll
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" className="bg-indigo-500 hover:bg-indigo-600 text-lg px-8 py-3">
                <Link to="/signup">Get Started Free</Link>
              </Button>
              <Button asChild variant="lg" size="lg" className="bg-indigo-500 hover:bg-indigo-600 text-lg px-8 py-3">
                <Link to="/login">Login</Link>
              </Button>
            </>
          )}
        </div>
      </div>
  
      {/* Features Section */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {[
          { icon: <Plus className="text-indigo-300" />, title: "Easy Creation", desc: "Create polls with multiple options in just a few clicks" },
          { icon: <Vote className="text-green-300" />, title: "Real-time Voting", desc: "See votes update instantly as people participate" },
          { icon: <Clock className="text-purple-300" />, title: "Time Limits", desc: "Set automatic expiry times for your polls" },
          { icon: <Share className="text-orange-300" />, title: "Easy Sharing", desc: "Share polls with a simple link - no signup required for voters" },
        ].map(({ icon, title, desc }, i) => (
          <Card key={i} className="text-center bg-gray-600 backdrop-blur-md border border-white/20 shadow-xl p-6 rounded-xl">
            <CardHeader>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                {icon}
              </div>
              <CardTitle className="text-white">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">{desc}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
  
      {/* CTA Section */}
      <div className="text-center bg-indigo-800 backdrop-blur-lg rounded-2xl p-10 shadow-2xl border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
        <p className="text-gray-300 mb-6">Join thousands of users who trust QuickPoll for their polling needs</p>
        {!user && (
          <Button asChild size="lg" className="bg-indigo-500 hover:bg-indigo-600 px-8 py-3 text-lg">
            <Link to="/signup">Create Free Account</Link>
          </Button>
        )}
      </div>
    </div>
  </div>
  
  )
}

export default Home
