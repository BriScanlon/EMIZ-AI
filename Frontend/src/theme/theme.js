// import { createTheme } from "@mui/material/styles";
// import customSettings from "./customSettings";

// export const getTheme = (mode) =>
//   createTheme({
//     palette: {
//       mode,
//       ...customSettings.palette,
//       ...(mode === "dark" && {
//         background: {
//           default: "#121212",
//           paper: "#1d1d1d",
//         },
//         text: {
//           primary: "#ffffff",
//           secondary: "#b0b0b0",
//         },
//       }),
//     },
//     breakpoints: customSettings.breakpoints,
//     typography: customSettings.typography,
//     shadows: customSettings.shadows,
//     shape: customSettings.shape,
//     transitions: customSettings.transitions,
//     zIndex: customSettings.zIndex,
//   });

import { createTheme } from "@mui/material/styles";
import customSettings from "./customSettings";

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...customSettings.palette,
      ...(mode === "dark" && {
        background: {
          default: "#121212",
          paper: "#1d1d1d",
        },
        text: {
          primary: "#ffffff",
          secondary: "#b0b0b0",
        },
      }),
    },
    breakpoints: customSettings.breakpoints,
    typography: customSettings.typography,
    shadows: customSettings.shadows,
    shape: customSettings.shape,
    transitions: customSettings.transitions,
    zIndex: customSettings.zIndex,
  });
