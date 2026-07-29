import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Customize from "./pages/customize";
import Customize2 from "./pages/Customize2"; 
import { Home } from "./pages/Home";
import { userDataContext } from "./context/UserContext";

axios.defaults.withCredentials = true;

const App = () => {
  const { userData } = useContext(userDataContext);

  return (
    <Routes>
      <Route
        path="/"
        element={
          userData
            ? (userData.assistantImage
                ? <Navigate to="/home" />
                : <Navigate to="/customize" />)
            : <Navigate to="/signin" />
        }
      />

      <Route
        path="/signin"
        element={userData ? <Navigate to="/home" /> : <SignIn />}
      />

      <Route
        path="/signup"
        element={userData ? <Navigate to="/home" /> : <SignUp />}
      />

      <Route
        path="/home"
        element={userData ? <Home /> : <Navigate to="/signin" />}
      />

      <Route
        path="/customize"
        element={userData ? <Customize /> : <Navigate to="/signin" />}
      />

      <Route
        path="/customize2"
        element={userData ? <Customize2 /> : <Navigate to="/signin" />}
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;