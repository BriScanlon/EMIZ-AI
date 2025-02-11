import React from "react";
import { FaTimes } from "react-icons/fa";
import styles from "./Overlay.module.scss";

const Overlay = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <aside className={styles.overlay}>
      <div className={styles.overlayHeader}>
        <h2>{title}</h2>
        <button onClick={onClose} className={styles.closeButton}>
          <FaTimes />
        </button>
      </div>
      <div className={styles.overlayContent}>{children}</div>
    </aside>
  );
};

export default Overlay;
