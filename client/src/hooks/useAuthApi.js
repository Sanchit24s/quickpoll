import axios from "axios";

const API_BASE = import.meta.env.VITE_BASE_URL;

export const useAuthApi = () => {
  const registerUser = async (data) => {
    const res = await axios.post(`${API_BASE}/auth/register`, data);
    return res.data;
  };

  const loginUser = async (data) => {
   try {
     const res = await axios.post(`${API_BASE}/auth/login`, data);
     if (!res.data.user) {
      throw new Error('User data missing from login response');
    }
     if(res.data.success && res.data.token){
       localStorage.setItem("token", res.data.token);
       localStorage.setItem("userData", JSON.stringify(res.data.user));
       return res.data;
     }
   } catch (error) {
    console.log('Login Error',error);
    return error;
   }    
  };


  const forgetUserPassword = async (data) => {
    const res = await axios.post(`${API_BASE}/auth/forgot-password`, data);
    return res.data;
  };


  const verifyEmail = async (token) => {
    try {
      const res = await axios.get(`${API_BASE}/auth/verify/${token}`);
      console.log(res.data);
      return res.data; 
    } catch (error) {
      // axios error response handling
      if (error.response && error.response.data) {
        return Promise.reject(error.response.data);
      }
      return Promise.reject({ message: "Verification failed. Please try again." });
    }
  };
  

  const resetUserPassword = async (data, token) => {
    const res = await axios.post(`${API_BASE}/auth/reset-password/${token}`, data);
    return res.data;
  };

  const logoutUser = async () => {
    const res = await axios.post(`${API_BASE}/auth/logout`);
    return res.data;
  };

  // Optional: add verifyEmail, forgotPassword, resetPassword etc.

  return {
    registerUser,
    loginUser,
    verifyEmail,
    forgetUserPassword,
    resetUserPassword,
    logoutUser,
  };
};
