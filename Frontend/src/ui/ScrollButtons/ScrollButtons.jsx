import { useState, useEffect } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import styles from "./ScrollButtons.module.scss";

const ScrollButtons = () => {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 300);
      setShowBottom(window.innerHeight + window.scrollY < document.body.offsetHeight - 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  return (
    <div className={styles.scrollButtons}>
      {showTop && (
        <button className={styles.scrollButton} onClick={scrollToTop}>
          <FaArrowUp />
        </button>
      )}
      {showBottom && (
        <button className={styles.scrollButton} onClick={scrollToBottom}>
          <FaArrowDown />
        </button>
      )}
    </div>
  );
};

export default ScrollButtons;
