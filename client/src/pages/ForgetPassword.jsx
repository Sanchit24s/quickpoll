import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuthApi } from "../hooks/useAuthApi";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const { forgetUserPassword } = useAuthApi();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await forgetUserPassword({email});
      console.log(response);
      toast.success("Reset link sent! Check your email.");

    } catch (error) {
      toast.error("Something went wrong. Try again.");
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-800  flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Forgot Your Password?</h2>
        <p className="text-gray-300 mb-6 text-center">
          Enter your registered email and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-3 text-white"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer" 
          >
            Send Reset Link
          </Button>
        </form>
      </div>
    </div>
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick pauseOnHover />
    </>
  );
};

export default ForgetPassword;
