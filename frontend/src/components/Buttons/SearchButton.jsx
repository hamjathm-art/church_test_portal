import React from 'react';
import './Buttons.css';

const SearchButton = ({ children, onClick, type = 'button', disabled = false, style = {} }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className="search-btn"
    style={style}
  >
    {children}
  </button>
);

export default SearchButton;
