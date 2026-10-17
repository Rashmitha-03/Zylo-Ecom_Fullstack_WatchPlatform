import React from 'react';
import { useNavigate } from 'react-router-dom';

function GoBackButton() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // This navigates one step back in the history stack
  };

  return (
    <button
      onClick={handleGoBack}
      className="btn btn-link text-dark" // Use btn-link to make it look like a clickable icon/text
      style={{
        position: 'relative', // Position it absolutely relative to its parent container
        top: '0px',        // Adjust as needed for spacing from the top
        left: '0px',       // Adjust as needed for spacing from the left
        fontSize: '3.5rem', // Make the arrow larger
        textDecoration: 'none', // Remove underline from link button
        zIndex: 1000 // Ensure it's above other content
      }}
      aria-label="Go back"
    >
      &larr; {/* Left arrow character */}
    </button>
  );
}

export default GoBackButton;