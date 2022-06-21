import React from "react";
import { Routes, Route } from "react-router-dom";
import Signin from "./pages/auth/signin/Signin";
import ForgetPassword from "./pages/auth/forgotPassword/ForgetPassword";
import TimeTracker from "./pages/timeTracker/TimeTracker";
function App() {
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
