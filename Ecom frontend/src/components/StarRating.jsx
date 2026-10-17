import React from 'react';

const StarRating = ({ rating }) => {
  const totalStars = 5;

  return (
    <div className="d-flex align-items-center text-muted fs-5">
      {[...Array(totalStars)].map((_, index) => {
        const isFilled = index + 1 <= Math.round(rating);
        return (
          <span
            key={index}
            className={`me-1 ${isFilled ? 'text-warning' : 'text-secondary'}`}
          >
            ★
          </span>
        );
      })}
      <span className="ms-1 fw-medium text-dark small">
        ({rating.toFixed(1)})
      </span>
    </div>
  );
};

export default StarRating;
