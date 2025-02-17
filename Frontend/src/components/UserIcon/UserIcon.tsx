/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, forwardRef, CSSProperties } from "react";

// styles
import styles from "./UserIcon.module.scss";

// types
import type { HTMLProps } from "react";
import React from "react";

interface IUserIcon extends HTMLProps<HTMLButtonElement> {
  name: string;
  profilePicture?: string;
  diameter?: string;
}

const UserIcon = forwardRef(
  (
    {
      className,
      onClick,
      name,
      profilePicture = "",
      diameter = "2.5rem",
    }: IUserIcon,
    ref: any
  ) => {
    const [styleState, setStyleState] = useState(
      (profilePicture
        ? { "--pp-url": `url('${profilePicture}')` }
        : {}) as CSSProperties
    );
    const [initials, setInitials] = useState("");

    const classList = `${styles["user-icon"]} ${className || ""}`;

    // calculate initials
    useEffect(() => {
      if (!name) return;

      const _names = name.split(" ");

      setInitials(
        `${_names[0]?.charAt(0)}${
          _names.length > 1 ? _names[_names.length - 1]?.charAt(0) : ""
        }`
      );
    }, [name]);

    // set custom diameter
    useEffect(() => {
      if (diameter)
        setStyleState((s) => ({ ...s, "--icon-diameter": diameter }));
    }, [diameter]);

    return onClick ? (
      <button
        className={classList}
        tabIndex={0}
        onClick={onClick}
        style={styleState}
        ref={ref}
      >
        <span className={styles["user-icon__initials"]}>{initials}</span>
      </button>
    ) : (
      <div className={classList} style={styleState} ref={ref}>
        <span className={styles["user-icon__initials"]}>{initials}</span>
      </div>
    );
  }
);

UserIcon.displayName = "UserIcon";

export default UserIcon;
