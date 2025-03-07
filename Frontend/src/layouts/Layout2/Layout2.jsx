import { useState, useRef } from "react";
import { SearchProvider } from "../../contexts/SearchContext";
import Footer from "../../components/Footer/Footer";
import styles from "./Layout2.module.scss";
import { Link, Outlet } from "react-router-dom";
import {
  FaTable,
  FaChartBar,
  FaArrowLeft,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import Chat from "../../components/Chat/Chat";
import Overlay from "../../ui/Overlay/Overlay";

export default function Layout2({ onBack }) {
  const [isOverlayOpen, setOverlayOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);

  const handleMouseDown = (event) => {
    event.preventDefault();
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event) => {
    const newWidth = Math.max(300, Math.min(500, event.clientX));
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        <main className={styles.mainContent}>
          <button
            onClick={onBack}
            className={`${styles.button} ${styles.backButton}`}
          >
            <FaArrowLeft /> Back to Home
          </button>

          <div className={styles.buttonGroup}>
            <Link
              to="/graph"
              className={`${styles.button} ${styles.graphButton}`}
            >
              <FaChartBar /> Graph View
            </Link>

            <Link
              to="/table"
              className={`${styles.button} ${styles.tableButton}`}
            >
              <FaTable /> Table View
            </Link>

            <button
              onClick={() => setOverlayOpen(true)}
              className={`${styles.button} ${styles.overlayButton}`}
            >
              Show Summary
            </button>
          </div>

          <div className={styles.contentWrapper}>
            <Outlet />
          </div>
        </main>

        {isSidebarOpen && (
          <aside
            className={styles.sidebar}
            ref={sidebarRef}
            style={{ width: `${sidebarWidth}px` }}
          >
            <button
              onClick={() => setSidebarOpen(false)}
              className={styles.sidebarToggle}
            >
              <FaTimes />
            </button>
            <Chat />
            <div
              className={styles.sidebarResizeHandle}
              onMouseDown={handleMouseDown}
            ></div>
          </aside>
        )}

        {!isSidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className={styles.sidebarToggle}
            style={{ left: "10px" }}
          >
            <FaBars />
          </button>
        )}
      </div>

      <Overlay
        isOpen={isOverlayOpen}
        onClose={() => setOverlayOpen(false)}
        title="Summary"
      >
        <p>Here is a summary of the data being displayed...</p>
      </Overlay>

      <Footer />
    </div>
  );
}
