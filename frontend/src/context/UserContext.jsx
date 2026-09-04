import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";

export const userDataContext = createContext();

const UserContext = ({ children }) => {
  const serverUrl = "";

  const [userData, setUserData] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.clear();
    setUserData(null);
    setFrontendImage(null);
    setBackendImage(null);
    setSelectedImage(null);
  };

  const handleCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserData(null);
        return;
      }

      const result = await axios.get(
        `${serverUrl}/api/user/current`,
        getAuthHeaders()
      );

      setUserData(result.data);
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        console.error(error.response?.data || error.message);
      }
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserData(null);
        return;
      }

      const result = await axios.get(
        `${serverUrl}/api/user/current`,
        getAuthHeaders()
      );

      setUserData(result.data);
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
      }
      console.error(error.response?.data || error.message);
    }
  }, [serverUrl]);

  const getGeminiResponse = async (prompt) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/user/askToassistant`,
        { prompt },
        getAuthHeaders()
      );

      return result.data;
    } catch (error) {
      console.error("Gemini Error:", error.response?.data || error.message);
      return null;
    }
  };

  useEffect(() => {
    handleCurrentUser();
  }, []);

  return (
    <userDataContext.Provider
      value={{
        serverUrl,
        userData,
        setUserData,
        refreshUser,
        frontendImage,
        setFrontendImage,
        backendImage,
        setBackendImage,
        selectedImage,
        setSelectedImage,
        getGeminiResponse,
        handleLogout,
      }}
    >
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;