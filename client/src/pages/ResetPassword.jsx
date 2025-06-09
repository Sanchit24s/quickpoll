import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuthApi } from "../hooks/useAuthApi";
import { useParams } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const { resetUserPassword} = useAuthApi();

  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      const response = await resetUserPassword({newPassword, confirmNewPassword}, token);
      console.log(response);
      toast.success("Password reset successfully!");

    } catch (error) {
      console.log(error)
      toast.error("Password reset failed. Please try again.");
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-800  flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Reset Password</h2>
        <p className="text-gray-300 mb-6 text-center">
        Reset your password to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="newPassword" className="text-white">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="you@example.com"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="mt-3 text-white"
            />
          </div>

          <div>
            <Label htmlFor="confirmNewPassword" className="text-white">Confirm New Password</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              placeholder="you@example.com"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              className="mt-3 text-white"
            />
          </div>


          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer" 
          >
            Reset Password
          </Button>
        </form>
      </div>
    </div>
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick pauseOnHover />
    </>
  );
};

export default ResetPassword;
