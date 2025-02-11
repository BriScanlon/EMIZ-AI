import styles from "./Spinner.module.scss";

const Spinner = ({ size = "50px", color = "#007bff" }) => {
  return (
    <div
      className={styles.spinner}
      style={{ width: size, height: size, borderColor: `${color} transparent transparent transparent` }}
    />
  );
};

export default Spinner;
