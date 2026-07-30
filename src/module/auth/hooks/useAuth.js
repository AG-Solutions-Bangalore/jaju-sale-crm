import { useMutation } from "@tanstack/react-query";
import { loginApi, changePasswordApi, forgotPasswordApi } from "../api/auth";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export const useLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (res) => {
      let responseData = res.data;
      
      // If the backend returned a string instead of JSON, parse it
      if (typeof responseData === "string") {
        try {
          responseData = JSON.parse(responseData);
        } catch (e) {
          console.error("Failed to parse login response", e);
        }
      }

      console.log("Login API Response:", responseData);

      const token = responseData?.data?.token || responseData?.token || responseData?.UserInfo?.token;
      const user = responseData?.data?.user || responseData?.user || responseData?.UserInfo?.user;

      if (!token) {
        console.error("No token found in response. Token path tried: data.token, token, UserInfo.token");
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: responseData?.message || "No token received.",
        });
        return;
      }

      const isProduction = window.location.protocol === "https:";
      const cookieOptions = {
        expires: 7,
        secure: isProduction,
        sameSite: "Lax",
        path: "/",
      };

      Cookies.set("token", token, cookieOptions);
      if (user?.id) Cookies.set("id", user.id.toString(), cookieOptions);
      if (user?.name) Cookies.set("name", user.name, cookieOptions);
      if (user?.user_type || user?.user_type_id) Cookies.set("userType", (user.user_type || user.user_type_id).toString(), cookieOptions);
      if (user?.email) Cookies.set("email", user.email, cookieOptions);

      // Save to localStorage as a fallback
      localStorage.setItem("token", token);
      if (user?.id) localStorage.setItem("id", user.id.toString());
      if (user?.name) localStorage.setItem("name", user.name);
      if (user?.user_type || user?.user_type_id) localStorage.setItem("userType", (user.user_type || user.user_type_id).toString());
      if (user?.email) localStorage.setItem("email", user.email);

      // Track active tab session for tab close detection
      sessionStorage.setItem("tab_active_session", "true");

      // Clear any previous stale query cache
      queryClient.clear();

      toast({
        title: "Success",
        description: responseData?.message || "Successfully logged in.",
      });

      navigate("/sale-dashboard");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description:
          error.response?.data?.message || "Please check your credentials.",
      });
    },
  });
};

export const useChangePassword = ({ onSuccess } = {}) => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: changePasswordApi,
    onSuccess: (res) => {
      if (res?.data.code == 200) {
        toast({
          title: "Success",
          description: res.data.msg,
        });
        onSuccess?.();
      } else {
        toast({
          title: "Error",
          description: res.data.msg,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });
};

export const useForgotPassword = ({ onSuccess } = {}) => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: (res) => {
      if (res?.data?.code === 200) {
        toast({
          title: "Success",
          description: res.data.msg || "Password sent successfully.",
        });
        onSuccess?.();
      } else {
        toast({
          title: "Error",
          description: res.data?.msg || "Unexpected response from server.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to send password reset request.",
        variant: "destructive",
      });
    },
  });
};
