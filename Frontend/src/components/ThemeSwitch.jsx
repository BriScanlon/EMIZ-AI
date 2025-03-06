import { ThemeProvider, CssBaseline, IconButton, Button } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { FiSun, FiMoon } from "react-icons/fi";

import { useLightDarkMode } from "../contexts/LightDarkModeContext";
import { getTheme } from "../theme/theme";

const ThemeSwitch = () => {
  const { isLightMode, toggleLightDarkMode } = useLightDarkMode();
  const theme = getTheme(isLightMode ? "light" : "dark");
  console.log("Theme:", theme);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Button
        onClick={toggleLightDarkMode}
        color="inherit"
        // startIcon={isLightMode ? <Brightness4 /> : <Brightness7 />}
        startIcon={isLightMode ? <FiMoon /> : <FiSun />}
      >
        {/* Toggle to {isLightMode ? "Dark" : "Light"} Mode */}
      </Button>
    </ThemeProvider>
  );
};

export default ThemeSwitch;
