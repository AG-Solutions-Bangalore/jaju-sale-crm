import { QueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents refetching every time user switches browser tabs!
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 10,   // 10 minutes cache freshness
      gcTime: 1000 * 60 * 60,      // 1 hour memory cache retention
      retry: 1,
    },
  },
});

export const logoutUser = () => {
  // Clear all cookies
  const cookiesToRemove = ["token", "id", "name", "userType", "email", "token-expire-time"];
  cookiesToRemove.forEach((cookie) => {
    Cookies.remove(cookie);
    Cookies.remove(cookie, { path: "/" });
  });

  // Clear local storage
  try {
    localStorage.clear();
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }

  // Clear session storage
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error("Failed to clear sessionStorage:", error);
  }

  // Clear query client cache
  try {
    queryClient.clear();
  } catch (error) {
    console.error("Failed to clear queryClient cache:", error);
  }
};
