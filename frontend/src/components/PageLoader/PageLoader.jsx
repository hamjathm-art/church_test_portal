import React from 'react';
import './PageLoader.css';

const PageLoader = () => {
  return (
    <div className="page-loader">
      <div className="page-loader-content">
        <div className="page-loader-row">
          <p className="page-loader-text">Loading</p>
          <div className="page-loader-ring">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
