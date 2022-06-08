import React from "react";
import { Routes, Route } from "react-router-dom";
import Signin from "./pages/auth/signin/Signin";
import ForgetPassword from "./pages/auth/forgetPassword/ForgetPassword";
import CurrentProject from "./pages/currentProject/CurrentProject";
function App() {
  return (
    <>
      <Routes>
        <Route exact path="/" element={<Signin />} />
        <Route exact path="/forgotpassword" element={<ForgetPassword />} />
        <Route exact path="/currentproject" element={<CurrentProject />} />
      </Routes>
    </>
  );
}

export default App;
