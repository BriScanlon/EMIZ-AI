import "./Footer.scss";

const Footer = () => {
  return (
    <footer className="footer">
      <p className="footer-text">
        © {new Date().getFullYear()} bloc hub. All rights reserved.
      </p>
      {/* <nav className="footer-links">
        <a href="#" className="footer-link">
          Privacy Policy
        </a>
        <a href="#" className="footer-link">
          Terms of Service
        </a>
        <a href="#" className="footer-link">
          Contact
        </a>
      </nav> */}
    </footer>
  );
};

export default Footer;
