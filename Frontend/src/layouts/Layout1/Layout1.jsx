import { useState } from "react";
import { SearchProvider } from "../../contexts/SearchContext";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import styles from "./Layout1.module.scss";
import { Outlet } from "react-router-dom";

export default function Layout1() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className={styles.layout}>
      {/* Top Navigation */}
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* Main Content */}
      <div className={styles.content}>
        {/* Sidebar */}
        <aside
          className={`${styles.sidebar} ${
            !isSidebarOpen ? styles.collapsed : ""
          }`}
        >
          <Sidebar isSidebarOpen={isSidebarOpen} />
        </aside>

        {/* Main Section */}
        <main
          className={`${styles.main} ${!isSidebarOpen ? styles.expanded : ""}`}
        >
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
