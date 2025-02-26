import { NavLink } from "react-router-dom";
import { useLightDarkMode } from "../../contexts/LightDarkModeContext";
// import { useUser } from '../features/authentication/useUser';
import styles from "./Logo.module.scss";

function Logo() {
  const { isLightDarkMode } = useLightDarkMode();
  //   const { isAuthenticated } = useUser();

  return (
    <NavLink to="/">
      {isLightDarkMode ? (
        <img
          src="../../assets/bloc_hub_logo.svg"
          alt="logo"
          className={styles["logo-container"]}
        />
      ) : (
        <img
          src="bloc_hub_logo.svg"
          alt="logo"
          className={styles["logo-container"]}
        />
      )}
    </NavLink>
  );
}

export default Logo;
