import { useState } from "react";
import styles from "./Main.module.scss";
import PdfUpload from "../../components/PdfUpload/PdfUpload";
import ChatForm from "../../components/ChatForm/ChatForm";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import { SearchProvider } from "../../contexts/SearchContext";
import Footer from "../../components/Footer/Footer";
import Chat from "../../components/Chat/Chat";

export default function Main({ showPdfUpload }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  //   const clearSearch = (id) => {
//     setRecentSearches(recentSearches.filter((search) => search.id !== id));
//   }; 

  return (
    <SearchProvider>
      <div className={styles["main-content"]}>
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className={styles["sidebar-main"]}>
          <div className={`${styles.sidebar} ${!isSidebarOpen ? styles.collapsed : ""}`}>
            <Sidebar isSidebarOpen={isSidebarOpen} />
          </div>
          <div className={`${styles["main-section"]} ${!isSidebarOpen ? styles["full-width"] : ""}`}>
            {showPdfUpload ? <PdfUpload /> : <Chat />}
          </div>
        </div>
        <Footer/>
      </div>
    </SearchProvider>
  );
}
