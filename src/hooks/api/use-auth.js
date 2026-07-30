import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { logoutUser } from "@/lib/queryClient";

const useAuth = () => {
  const [authData, setAuthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token") || localStorage.getItem("token");
    const isTabSessionActive = sessionStorage.getItem("tab_active_session") === "true";

    const userData = {
      id: Cookies.get("id") || localStorage.getItem("id"),
      name: Cookies.get("name") || localStorage.getItem("name"),
      userType: Cookies.get("userType") || localStorage.getItem("userType"),
      email: Cookies.get("email") || localStorage.getItem("email"),
    };

    if (token && isTabSessionActive) {
      setAuthData({ user: userData });
    } else {
      if (token && !isTabSessionActive) {
        // Tab was closed previously; perform full cleanup and logout
        logoutUser();
      }
      setAuthData({ user: null });
    }

    setIsLoading(false);
  }, []);

  return { data: authData, isLoading };
};

export default useAuth;