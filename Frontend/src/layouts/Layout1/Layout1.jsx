import { useState } from "react";
import { SearchProvider } from "../../contexts/SearchContext";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import styles from "./Layout1.module.scss";
import { Outlet } from "react-router-dom";
import SecondaryNavbar from "../../components/Navbar/SecondaryNavbar";

export default function Layout1() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className={styles.layout}>
      {/* Top Navigation */}
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <SecondaryNavbar />
      {/* Main Content */}
      <div className={styles.content}>
        {/* Main Section */}
        <main
          className={`${styles.main} ${!isSidebarOpen ? styles.collapsed : ""}`}
        >
          <Outlet />
        </main>
        {/* Sidebar */}
        <div
          className={`${styles.sidebar} ${
            isSidebarOpen ? styles.expanded : styles.collapsed
          }`}
        >
          <Sidebar isSidebarOpen={isSidebarOpen} />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
