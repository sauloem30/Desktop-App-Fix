import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Signin from "./pages/auth/signin/Signin";
import ForgetPassword from "./pages/auth/forgetPassword/ForgetPassword";
function App() {
  return (
    <>
      <Routes>
        <Route exact basename="/" element={<Signin />} />
        <Route exact path="/forgotpassword" element={<ForgetPassword />} />
      </Routes>
      <Signin />
    </>
  );
}

export default App;
