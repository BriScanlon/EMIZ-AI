import { createContext, useContext, useEffect, useState } from 'react';

const LightDarkModeContext = createContext();

function LightDarkModeProvider({ children }) {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(
    function () {
      if (isLightMode) {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    },
    [isLightMode],
  );

  function toggleLightDarkMode() {
    setIsLightMode((isLight) => !isLight);
  }

  return (
    <LightDarkModeContext.Provider value={{ isLightMode, toggleLightDarkMode }}>
      {children}
    </LightDarkModeContext.Provider>
  );
}

function useLightDarkMode() {
  const context = useContext(LightDarkModeContext);
  if (context === undefined)
    throw new Error('LightDarkModeContext was used outside of LightDarkModeProvider');
  return context;
}

export { LightDarkModeProvider, useLightDarkMode };