import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Signin from "./pages/auth/signin/Signin";
import ForgetPassword from "./pages/auth/forgotPassword/ForgetPassword";
import './App.css'
import AppContext from "./AppContext";
import Tracker from "./pages/tracker";
import { getAppVersion, setToStore, onlineStatusChanged, checkForUpdate } from "./utils/electronApi";
import { logInfo } from "./utils/loggerHelper";

function App() {

  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // detect internet connection
    const handleChange = (newStatus) => {
      setIsOnline(newStatus);
      (async () => {
        await onlineStatusChanged(newStatus);
      })();
    };

    window.addEventListener('online', () => handleChange(true));
    window.addEventListener('offline', () => handleChange(false));

    return () => {
      window.removeEventListener('online', () => handleChange(true));
      window.removeEventListener('offline', () => handleChange(false));
    }
  }, [])

  // get app version and update title
  useEffect(() => {
    getAppVersion()
      .then((version) => {
        logInfo(`App version: ${version}`);
        document.title = `Klever v${version}`;
      });
  }, []);

  // save base url to store
  // and check for update
  useEffect(() => {
    (async () => {
      await setToStore('baseUrl', process.env.REACT_APP_API_BASE_URL);
      await checkForUpdate();
    })()
  }, []);

  return (
    <AppContext.Provider value={{ isOnline }}>
      <Routes>
        <Route exact path="/" element={<Signin />} />
        <Route exact path="/forgotpassword" element={<ForgetPassword />} />
        <Route exact path="/timetracker" element={<Tracker />} />
      </Routes>
    </AppContext.Provider>
  );
}

export default App;
