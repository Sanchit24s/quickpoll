import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthApi } from "../hooks/useAuthApi";
import { Button } from "@/components/ui/button";

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuthApi();

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await verifyEmail(token);
        toast.success(res.message || "Email verified successfully");
        setTimeout(() => navigate("/login"), 3000);
      } catch (error) {
        toast.error(error.message || "Verification failed or expired");
      }
    };
    verify();
  }, [token, navigate, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br via-indigo-900 to-violet-900 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white p-8 rounded-lg text-center max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Email Verified Successfully</h1>
       <Button className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer" onClick={() => navigate("/login")}>Click Here To Login</Button>
      </div>
    </div>
  );
};

export default EmailVerification;
