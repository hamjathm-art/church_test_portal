import React from 'react';
import './Buttons.css';

const ActionButton = ({ children, onClick, type = 'button', disabled = false, variant = 'primary', style = {} }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`action-btn action-btn-${variant}`}
    style={style}
  > 
    {children}
  </button>
);

export default ActionButton;
