import React from "react";
import { AppBar, Toolbar } from "@mui/material";
import NewChat from "../NewChat/NewChat";
import styles from "./SecondaryNavbar.module.scss";

const SecondaryNavbar = () => {
  return (
    <div className={styles.appBar}>
      <div className={styles.toolbar}>
        <NewChat />
      </div>
    </div>
  );
};

export default SecondaryNavbar;
