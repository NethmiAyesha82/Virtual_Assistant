import React, { useContext, useState } from "react";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdKeyboardBackspace } from "react-icons/md";

const Customize2 = () => {
  const {
    userData,
    backendImage,
    selectedImage,
    serverUrl,
    setUserData,
  } = useContext(userDataContext);

  const [assistantName, setAssistantName] = useState(
    userData?.assistantName || ""
  );

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdateAssistant = async () => {
    if (!assistantName.trim()) {
      alert("Please enter assistant name");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("assistantName", assistantName);

      if (backendImage) {
        formData.append("assistantImage", backendImage);
      }

      if (selectedImage) {
        formData.append("imageUrl", selectedImage);
      }

      // LocalStorage එකෙන් Token එක ලබා ගැනීම
      const token = localStorage.getItem("token");

      const result = await axios.post(
        `${serverUrl}/api/user/update`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Token එක Header එකට එකතු කිරීම
          },
        }
      );

      setUserData(result.data);

      navigate("/");
    } catch (error) {
      console.error(error.response?.data || error.message);

      alert(
        error.response?.data?.message ||
          "Failed to update assistant"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-t from-black to-[#030353] flex justify-center items-center flex-col p-4 relative">
      <MdKeyboardBackspace
        className="absolute top-4 left-4 text-white w-7 h-7 cursor-pointer"
        onClick={() => navigate("/")}
      />

      <div className="w-full max-w-[600px] flex flex-col items-center">
        <h1 className="text-white text-3xl text-center mb-6">
          Enter Your
          <span className="text-blue-200">
            {" "}
            Assistant Name
          </span>
        </h1>

        <input
          type="text"
          placeholder="eg. Ayesha"
          value={assistantName}
          onChange={(e) => setAssistantName(e.target.value)}
          className="w-full h-[55px] border-2 border-white bg-transparent text-white px-5 rounded-full outline-none"
        />

        {assistantName.trim() && (
          <button
            onClick={handleUpdateAssistant}
            disabled={loading}
            className="w-full mt-6 h-[55px] bg-blue-500 hover:bg-blue-600 rounded-full text-white font-semibold"
          >
            {loading
              ? "Loading..."
              : "Finally Create Your Assistant"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Customize2;