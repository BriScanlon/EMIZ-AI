import { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import ThemeToggle from '../components/ThemeToggle';
// import ServicesDropdown from '../features/home/ServicesDropdown';
import { useScreenSize } from '../contexts/ScreenSizeContext';

const liStyle =
  'border-colorBrand500 border-b p-5 text-2xl text-colorGrey900 md:p-0 md:border-none hover:text-colorBrand500 transition-transform duration-300 ease-in-out transform hover:translate-y-1 tracking-tighter';

const activeLinkStyle =
  'bg-colorBrand2 inline-block w-full p-4 text-colorGrey50';

function Ssidebar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const { isSmallScreen } = useScreenSize();

//   const toggleDropdownWhenServiceIsClicked = () => {
//     if (!isSmallScreen) return;
//     setIsServiceDropdownOpen(!isServiceDropdownOpen);
//   };

//   const toggleDropdown = () => {
//     if (isSmallScreen) return;
//     setIsServiceDropdownOpen(!isServiceDropdownOpen);
//   };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = useCallback(() => {
    if (isMobileMenuOpen) setMobileMenuOpen(false);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen && isMobileMenuOpen)
      document
        .getElementById('divToCloseMenu')
        .addEventListener('click', () => {
          closeMobileMenu();
        });

    return () => {
      if (isMobileMenuOpen && isMobileMenuOpen)
        document
          .getElementById('divToCloseMenu')
          .addEventListener('click', () => {
            closeMobileMenu();
          });
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  return (
    <div className="w-full text-right text-colorGrey800 md:flex md:justify-between">
      {/* Mobile Menu Icon */}
      <button
        className="focus:outline-none md:hidden"
        onClick={toggleMobileMenu}
      >
        <FaBars />
      </button>

      <div
        id="divToCloseMenu"
        className={isMobileMenuOpen ? ' absolute h-screen w-full' : ''}
      ></div>

      {/* Navigation Menu (Hidden on Small Screens) */}
      <ul
        className={`${
          isSmallScreen && isMobileMenuOpen
            ? 'absolute left-0 top-0 h-screen w-2/3 space-y-5 border-y-2 border-colorBrand2 bg-colorGrey50 p-5 text-left opacity-95'
            : 'hidden'
        }  md:flex md:gap-7 `}
      >
        <li className={liStyle}>
          <NavLink
            to="/"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? activeLinkStyle : '')}
          >
            Home
          </NavLink>
        </li>
        {/* <span
          className="text-left"
          onClick={toggleDropdownWhenServiceIsClicked}
          onMouseEnter={toggleDropdown}
          onMouseLeave={toggleDropdown}
        >
          <li className={`${liStyle} md:mb-5`}>
            <NavLink to="#" onClick={!isSmallScreen && closeMobileMenu}>
              Services
            </NavLink>
          </li>
          {isServiceDropdownOpen && <ServicesDropdown />}
        </span> */}

        <li className={liStyle}>
          <NavLink
            to="/how-it-works"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? activeLinkStyle : '')}
          >
            How It Works
          </NavLink>
        </li>
        <li className={liStyle}>
          <NavLink
            to="/signup-login"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? activeLinkStyle : '')}
          >
            Sign up/Log in
          </NavLink>
        </li>
        <li className={liStyle}>
          <NavLink
            to="/become-a-professional"
            className={({ isActive }) => (isActive ? activeLinkStyle : '')}
          >
            Become a Blue Kollar
          </NavLink>
        </li>
        <li className={liStyle}>
          <NavLink
            to="/about-us"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? activeLinkStyle : '')}
          >
            About
          </NavLink>
        </li>
        <li className={liStyle}>
          <NavLink
            to="#"
            onClick={closeMobileMenu}
            // className={({ isActive }) => (isActive ? activeLinkStyle : '')}
          >
            Blog
          </NavLink>
        </li>
        <li className={liStyle}>
          <NavLink
            to="/contact-us"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? activeLinkStyle : '')}
          >
            Contact
          </NavLink>
        </li>
        <li className={isSmallScreen ? liStyle + ' flex gap-4' : liStyle}>
          {isSmallScreen && 'Switch Theme'}
          <ThemeToggle />
        </li>
      </ul>
    </div>
  );
}

export default Ssidebar;