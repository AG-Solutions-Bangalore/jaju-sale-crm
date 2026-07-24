import { useMutation } from "@tanstack/react-query";
import { loginApi, changePasswordApi, forgotPasswordApi } from "../api/auth";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const useLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (res) => {
      const responseData = res.data;
      const token = responseData?.data?.token || responseData?.token || responseData?.UserInfo?.token;
      const user = responseData?.data?.user || responseData?.user || responseData?.UserInfo?.user;

      if (!token) {
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
        sameSite: "Strict",
      };

      Cookies.set("token", token, cookieOptions);
      if (user?.id) Cookies.set("id", user.id, cookieOptions);
      if (user?.name) Cookies.set("name", user.name, cookieOptions);
      if (user?.user_type || user?.user_type_id) Cookies.set("userType", user.user_type || user.user_type_id, cookieOptions);
      if (user?.email) Cookies.set("email", user.email, cookieOptions);

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
