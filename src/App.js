import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Signin from "./pages/auth/signin/Signin";
import ForgetPassword from "./pages/auth/forgotPassword/ForgetPassword";
import TimeTracker from "./pages/timeTracker/TimeTracker";
import './App.css'
import AppContext from "./AppContext";
function App() {

  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // detect internet connection
    const handleChange = (newStatus) => {
      window?.electronApi?.changeOnlineStatus(newStatus);
      setIsOnline(newStatus);
    };

    window.addEventListener('online', () => handleChange(true));
    window.addEventListener('offline', () => handleChange(false));

    return () => {
      window.removeEventListener('online', () => handleChange(true));
      window.removeEventListener('offline', () => handleChange(false));
    }
  }, [])

  return (
    <AppContext.Provider value={{ isOnline }}>
      <Routes>
        <Route exact path="/" element={<Signin />} />
        <Route exact path="/forgotpassword" element={<ForgetPassword />} />
        <Route exact path="/timetracker" element={<TimeTracker />} />
      </Routes>
    </AppContext.Provider>
  );
}

export default App;
