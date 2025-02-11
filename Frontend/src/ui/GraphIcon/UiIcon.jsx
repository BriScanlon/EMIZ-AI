import React, { useState } from "react";
import "./UiIcon.scss";  // Importing the Sass stylesheet

const UiIcon = ({ icon: Icon, tooltipText = "Icon text" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="icon-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Use the passed icon dynamically */}
      <Icon
        className={`ui-icon ${isHovered ? "hovered" : ""}`}
        size={20} // Default size for the icon
      />
      {/* Show tooltip only when hovered */}
      {isHovered && <span className="tooltip">{tooltipText}</span>}
    </div>
  );
};

export default UiIcon;
