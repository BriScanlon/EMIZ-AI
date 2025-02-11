import { useState, useRef } from "react";
import { SearchProvider } from "../../contexts/SearchContext";
import Footer from "../../components/Footer/Footer";
import styles from "./Layout2.module.scss";
import { Link, Outlet } from "react-router-dom";
import { FaTable, FaChartBar, FaArrowLeft, FaTimes, FaBars } from "react-icons/fa";
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
    <SearchProvider>
      <div className={styles.layout}>
        <div className={styles.container}>
          {/* Sidebar - Draggable and Toggleable */}
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

          {/* Sidebar Toggle Button (When Sidebar is Closed) */}
          {!isSidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className={styles.sidebarToggle}
              style={{ left: "10px" }}
            >
              <FaBars />
            </button>
          )}

          {/* Main Content Area */}
          <main className={styles.mainContent}>
            {/* Back Button */}
            <button onClick={onBack} className="p-2 bg-blue-600 rounded-md text-white flex items-center gap-2">
              <FaArrowLeft /> Back to Home
            </button>

            {/* Toggle Buttons */}
            <div className="flex gap-4 mb-4">
              <Link to="/graph" className="p-2 bg-blue-600 rounded-md text-white flex items-center gap-2">
                <FaChartBar /> Graph View
              </Link>

              <Link to="/table" className="p-2 bg-green-600 rounded-md text-white flex items-center gap-2">
                <FaTable /> Table View
              </Link>

              {/* Toggle Overlay Button */}
              <button
                onClick={() => setOverlayOpen(true)}
                className="p-2 bg-gray-800 rounded-md text-white"
              >
                Show Summary
              </button>
            </div>

            {/* Dynamic Content Section */}
            <div className={styles.contentWrapper}>
              <Outlet />
            </div>
          </main>
        </div>

        {/* Right Overlay Section */}
        <Overlay
          isOpen={isOverlayOpen}
          onClose={() => setOverlayOpen(false)}
          title="Summary"
        >
          <p>Here is a summary of the data being displayed...</p>
        </Overlay>

        {/* Footer */}
        <Footer />
      </div>
    </SearchProvider>
  );
}
