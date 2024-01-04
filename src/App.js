import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Signin from "./pages/auth/signin/Signin";
import ForgetPassword from "./pages/auth/forgotPassword/ForgetPassword";
import TimeTracker from "./pages/timeTracker/TimeTracker";
import './App.css'
function App() {

  useEffect(() => {
    // detect internet connection
    const handleChange = (isOnline) => window?.electronApi?.send('online-status-changed', isOnline);

    window.addEventListener('online', () => handleChange(true));
    window.addEventListener('offline', () => handleChange(false));

    return () => {
      window.removeEventListener('online', () => handleChange(true));
      window.removeEventListener('offline', () => handleChange(false));
    }
  }, [])

  return (
    <>
      <Routes>
        <Route exact path="/" element={<Signin />} />
        <Route exact path="/forgotpassword" element={<ForgetPassword />} />
        <Route exact path="/timetracker" element={<TimeTracker />} />
      </Routes>
    </>
  );
}

export default App;
