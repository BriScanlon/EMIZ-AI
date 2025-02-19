import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider, CssBaseline } from "@mui/material";

// Components
import ForceGraph from "./components/Graphs/ForceGraph/ForceGraph";
import ForceGraph2 from "./components/Graphs/ForceGraph/ForceGraph2";
import Navbar from "./components/Navbar/Navbar-old";
import Table from "./components/Table/Table";
// import ScraperForm from "./components/ScraperForm";
import SearchForm from "./components/SearchForm/SearchForm";

import "./App.scss";
// import theme from './theme/theme';
import { getTheme } from "./theme/theme";
import Sidebar from "./components/Sidebar/Sidebar-old";
import Ssidebar from "./ui/Ssidebar";
import { ScreenSizeProvider } from "./contexts/ScreenSizeContext";
import { LightDarkModeProvider } from "./contexts/LightDarkModeContext";
import SidebarNav from "./components/Sidebar/SidebarNav";
import Footer from "./components/Footer/Footer";
import Logo from "./components/Logo/Logo";
import Main from "./pages/Main/Main";
import ForceGraph3DComponent from "./components/Graphs/ForceGraph3D/ForceGraph3DComponent";
import ResponseLayout from "./pages/Response/ResponseLayout";
import Chat from "./components/Chat/Chat";
import Layout1 from "./layouts/Layout1/Layout1";
import PdfUpload from "./components/PdfUpload/PdfUpload";
import Layout2 from "./layouts/Layout2/Layout2";
import { useState } from "react";
import { SearchProvider } from "./contexts/SearchContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

function App() {
  const [mode, setMode] = useState("light");
  const [selectedItem, setSelectedItem] = useState("Dashboard");

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item.label);
  };

  console.log(mode);

  const [chatGPTResponse, setChatGPTResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("table");
  const handleViewSwitch = () => {
    setView((prevView) => (prevView === "table" ? "graph" : "table"));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <BrowserRouter>
        <LightDarkModeProvider>
          {/* <ScreenSizeProvider> */}
          <SearchProvider>
            {/* <div className="App"> */}
            <Routes>
              <Route element={<Layout1 />}>
                <Route index element={<Main />} />
                {/* <Route index element={<Chat />} /> */}

                <Route path="/upload" element={<PdfUpload />} />
              </Route>
              <Route element={<Layout2 />}>
                {/* <Route index element={<Chat />} /> */}
                <Route index element={<Main />} />
                <Route path="/graph" element={<ForceGraph2 />} />
                <Route path="/table" element={<Table />} />
              </Route>
              {/* <Route path="/upload" element={<Main showPdfUpload={true} />} /> Route for PdfUpload */}
              {/* <Route path="/chat" element={<Chat />} /> */}
              {/* <Route path="/response" element={<ResponseLayout />} /> */}
              <Route path="/response2" element={<ForceGraph3DComponent />} />
              {/* <Route path="/table" element={<Table />} /> */}
            </Routes>
            {/* <Ssidebar/>
        <Sidebar/> */}
            {/* </div> */}
            {/* </ScreenSizeProvider> */}
            {/* <Footer/> */}
          </SearchProvider>
        </LightDarkModeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
