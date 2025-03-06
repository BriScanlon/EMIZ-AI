import React from "react";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import ThemeSwitch from "../ThemeSwitch";
import Logo from "../Logo/Logo";
import styles from "./Navbar.module.scss";

export default function Navbar({ toggleSidebar, isSidebarOpen }) {
  return (
    <div className={styles.navbar}>
      <Logo />

      <div className={styles["flex-items"]}>
        <ThemeSwitch className={styles["theme-switch"]} />

        <button className={styles["menu-button"]} onClick={toggleSidebar}>
          {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>
    </div>
  );
}
