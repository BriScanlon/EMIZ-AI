import { useScreenSize } from "../../contexts/ScreenSizeContext";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Mail as MailIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  ExitToApp as ExitToAppIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from "@mui/icons-material";
import "./Sidebar.scss";

const items = [
  { label: "Dashboard", icon: <DashboardIcon /> },
  { label: "Analytics", icon: <BarChartIcon /> },
  { label: "Settings", icon: <SettingsIcon /> },
  { label: "Profile", icon: <AccountCircleIcon /> },
  { label: "Messages", icon: <MailIcon /> },
  { label: "Notifications", icon: <NotificationsIcon /> },
  { label: "Help", icon: <HelpIcon /> },
  { label: "Logout", icon: <ExitToAppIcon /> },
];

const Sidebar = ({ onItemSelect, mode, toggleTheme }) => {
  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <h2>Intelligent Digital Twin</h2>
        <div className="sidebar__theme-switch">
          {mode === "dark" ? (
            <Brightness4Icon onChange={toggleTheme} />
          ) : (
            <Brightness7Icon onChange={toggleTheme} />
          )}
          {/* <Brightness4Icon />
          <Switch checked={mode === 'dark'} onChange={toggleTheme} /> */}
        </div>
      </div>
      <List className="sidebar__menu">
        {items.map((item, index) => (
          <ListItem
            button
            key={index}
            className="sidebar__menu-item"
            onClick={() => onItemSelect(item)}
          >
            <ListItemIcon className="sidebar__menu-icon">
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} className="sidebar__menu-text" />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default Sidebar;
