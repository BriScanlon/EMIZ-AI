import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import Logo from "../Logo/Logo";
import styles from "./Navbar.module.scss";

export default function Navbar({ toggleSidebar, isSidebarOpen }) {
  return (
    <div className={styles.navbar}>
      <button className={styles["menu-button"]} onClick={toggleSidebar}>
        {isSidebarOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
      </button>
      <Logo />
    </div>
  );
}
