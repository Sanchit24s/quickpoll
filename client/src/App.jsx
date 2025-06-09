import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreatePoll from "./pages/CreatePoll";
import ViewPoll from "./pages/ViewPoll";
import ResultsDashboard from "./pages/ResultsDashboard";
import NotFound from "./pages/NotFound";
import ForgetPassword from "./pages/ForgetPassword";
import EmailVerification from "./pages/EmailVerification";
import ResetPassword from "./pages/ResetPassword";
import QuickPollDashboard from "./pages/QuickPollDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import CreatorPollView from "./pages/CreatorPollView";
// import { ToastContainer } from "react-toastify"
// import "react-toastify/dist/ReactToastify.css"

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        {/* <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick pauseOnHover > */}
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<MainLayout />}>
                {/* Public Routes (only for unauthenticated users) */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forget-password" element={<ForgetPassword />} />
                </Route>
                <Route index element={<Home />} />
                <Route path="/verified-successful" element={<EmailVerification />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/poll/:shareableId" element={<ViewPoll />} />
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/create" element={<CreatePoll />} />
                  <Route path="/dashboard" element={<QuickPollDashboard />} />
                  <Route path="/poll/:shareableId/creator" element={<CreatorPollView />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </div>
        </Router>
        {/* </ToastContainer> */}
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
