import { createContext, useContext, useEffect, useState } from 'react';

const ScreenSizeContext = createContext();

function ScreenSizeProvider({ children }) {
  const [windowDimension, setWindowDimension] = useState({
    winWidth: window.innerWidth,
    winHeight: window.innerHeight,
  });

  const isSmallScreen = windowDimension.winWidth <= 768;

  const detectWinSize = () => {
    setWindowDimension({
      winWidth: window.innerWidth,
      winHeight: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener('resize', detectWinSize);

    return () => window.removeEventListener('resize', detectWinSize);
  }, [windowDimension]);

  return (
    <ScreenSizeContext.Provider value={{ windowDimension, isSmallScreen }}>
      {children}
    </ScreenSizeContext.Provider>
  );
}

const useScreenSize = () => {
  const context = useContext(ScreenSizeContext);
  if (context === undefined)
    throw new Error(
      'The ScreenSizeContext was used outside of the ScreenSizeProvider',
    );
  return context;
};

export { ScreenSizeProvider, useScreenSize };