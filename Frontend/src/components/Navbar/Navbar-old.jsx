import { useEffect, useRef, useState } from 'react';
import React from 'react';

// components
import Icon from './Navbar.icons';
import UserIcon from '../UserIcon/UserIcon';
// import ScraperForm from '../ScraperForm';

// styles
import styles from './Navbar.module.scss';

const hardcodedUser = {
  name: 'Admin',
  email: 'admin@bloc.digital',
  additionalFields: {
    avatarURL: 'path/to/avatar.jpg', // Provide the correct path to the avatar image if available
  },
};

export default function Navbar({ className }) {
  const popoverTriggerRef = useRef(null);
  const popoverFirstButtonRef = useRef(null);

  const [popoverOpen, setPopoverOpen] = useState(false);

  // focus inside the user popover
  useEffect(() => {
    if (!popoverOpen) return;

    // delay so that element exists before focusing
    setTimeout(() => {
      if (popoverFirstButtonRef.current) popoverFirstButtonRef.current.focus();
    }, 50);
  }, [popoverOpen]);

  // keydown handler
  useEffect(() => {
    if (!popoverOpen) return;

    const handleKeyDown = ({ key }) => {
      if (key !== 'Escape') return;

      setPopoverOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [popoverOpen]);


  return (
    <nav className={`${styles.navbar} ${className || ''}`}>
      <div className={styles['navbar__group']}>
        <button
          className={styles['navbar__logo-button']}
          aria-label="company logo home"
          onClick={() => window.location.assign('/')}
        >
          <Icon className={styles['navbar__logo']} type="logo" />
        </button>
      </div>
      <UserIcon
        onClick={() => setPopoverOpen((o) => !o)}
        ref={popoverTriggerRef}
        name={hardcodedUser.name}
        profilePicture={hardcodedUser.additionalFields.avatarURL}
      />
    </nav>
  );
}
