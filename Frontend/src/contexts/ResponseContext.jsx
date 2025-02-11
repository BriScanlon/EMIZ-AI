import { createContext, useContext, useState } from "react";

const ResponseContext = createContext();

function ResponseProvider({ children }) {
  const [chatGPTResponse, setChatGPTResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <ResponseContext.Provider value={{ chatGPTResponse, setChatGPTResponse, loading, setLoading }}>
      {children}
    </ResponseContext.Provider>
  );
}

function useResponse() {
    const context = useContext(ResponseContext);
  if (context === undefined)
    throw new Error(
      'The ResponseContext was used outside of the ScreenSizeProvider',
    );
    return context;
}

export { ResponseProvider, useResponse };
