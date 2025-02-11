// Import React and necessary hooks
import React, { useState } from "react";
import "./SearchForm.scss";

const SearchForm = () => {
  const [query, setQuery] = useState("");

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Search query submitted:", query);
    // Add functionality to process the query here
  };

  return (
    <div className="search-form-container">
      <form className="search-form" onSubmit={handleSubmit}>
        <h2 className="search-form-title">Intelligent Digital Twin</h2>
        <div className="search-input-wrapper">
          <textarea
            className="search-input"
            placeholder="Search for your digital twin insights..."
            value={query}
            onChange={handleInputChange}
            required
          />
          <button type="submit" className="search-button">
            <span className="search-icon">🔍</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
