import React, { createContext, useContext, useState } from "react";
import ServerWakeupLoader from "../components/common/ServerWakeupLoader";

const ServerLoaderContext = createContext();

export function ServerLoaderProvider({ children }) {
  const [loading, setLoading] = useState(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  return (
    <ServerLoaderContext.Provider
      value={{ showLoader, hideLoader }}
    >
      {loading && <ServerWakeupLoader />}
      {children}
    </ServerLoaderContext.Provider>
  );
}

export function useServerLoader() {
  return useContext(ServerLoaderContext);
}