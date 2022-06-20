import React from "react";
import { Routes, Route } from "react-router-dom";
import Signin from "./pages/auth/signin/Signin";
import ForgetPassword from "./pages/auth/forgotPassword/ForgetPassword";
import TimeTracker from "./pages/timeTracker/TimeTracker";
import PasswordInstruction from "./pages/auth/forgotPassword/PasswordInstruction";
function App() {
  return (
    <>
      <Routes>
        <Route exact path="/" element={<Signin />} />
        <Route exact path="/forgotpassword" element={<ForgetPassword />} />
        <Route exact path="/timetracker" element={<TimeTracker />} />
        <Route exact path="/confirmation" element={<PasswordInstruction />} />
      </Routes>
    </>
  );
}

export default App;
