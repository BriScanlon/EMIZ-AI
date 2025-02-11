import { FiSun, FiMoon } from 'react-icons/fi';
import { useLightDarkMode } from '../contexts/LightDarkModeContext';

export default function ThemeToggle() {
  const { isLightMode, toggleLightDarkMode } = useLightDarkMode();

  return (
    <button
      onClick={toggleLightDarkMode}
      className="theme-toggle-button focus:outline-none"
    >
      {isLightMode ? <FiMoon /> : <FiSun /> }
    </button>
  );
}