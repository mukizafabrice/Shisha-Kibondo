// src/context/RefreshContext.js
import React, { createContext, useState, useEffect, useContext } from "react";

// The interval for 10 minutes (600,000 milliseconds)
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {
  // refreshKey is the state used to force the App component to remount
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Set up the interval to increment the key every 10 minutes
    const intervalId = setInterval(() => {
      console.log("--- App Refresh Triggered ---");
      setRefreshKey((prevKey) => prevKey + 1);
    }, REFRESH_INTERVAL_MS);

    // Cleanup the interval when the provider component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures it runs only once on mount

  // The context value provides the current key
  return (
    <RefreshContext.Provider value={refreshKey}>
      {children}
    </RefreshContext.Provider>
  );
};

// Custom hook to easily access the key
export const useRefreshKey = () => useContext(RefreshContext);
