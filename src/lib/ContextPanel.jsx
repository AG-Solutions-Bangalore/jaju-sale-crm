import BASE_URL from "@/config/BaseUrl";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const ContextPanel = createContext();

const AppProvider = ({ children }) => {
  const [statusCheck, setStatusCheck] = useState(null);
  const [panelDetails, setPanelDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPanelStatus = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/web-check-status`);
        const data = await response.json();

        const isSuccess =
          data.success === "ok" ||
          data.success === "true" ||
          data.success === true ||
          data.code === 201 ||
          data.company_detils?.company_status === "Active";

        if (isSuccess) {
          setStatusCheck("ok");
          setPanelDetails(data);
        } else {
          navigate("/maintenance");
        }
      } catch (error) {
        console.error("Error fetching panel status:", error);
        navigate("/maintenance"); 
      }
    };

    checkPanelStatus();

    const interval = setInterval(checkPanelStatus, 300000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ContextPanel.Provider value={{ statusCheck, panelDetails }}>
      {statusCheck === "ok" ? children : null}
    </ContextPanel.Provider>
  );
};

export default AppProvider;
