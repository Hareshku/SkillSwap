import React from 'react';

const Rating = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange = null,
  showValue = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const handleStarClick = (starRating) => {
    if (interactive && onChange) {
      onChange(starRating);
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => {
          const starRating = index + 1;
          const isFilled = starRating <= rating;
          const isHalfFilled = rating > index && rating < starRating;

          return (
            <button
              key={index}
              type="button"
              className={`${sizeClasses[size]} ${interactive
                  ? 'cursor-pointer hover:scale-110 transition-transform'
                  : 'cursor-default'
                } focus:outline-none`}
              onClick={() => handleStarClick(starRating)}
              disabled={!interactive}
            >
              <svg
                className={`w-full h-full ${isFilled
                    ? 'text-yellow-400'
                    : isHalfFilled
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                {isHalfFilled ? (
                  <defs>
                    <linearGradient id={`half-${index}`}>
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="#D1D5DB" />
                    </linearGradient>
                  </defs>
                ) : null}
                <path
                  fillRule="evenodd"
                  d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z"
                  clipRule="evenodd"
                  fill={isHalfFilled ? `url(#half-${index})` : 'currentColor'}
                />
              </svg>
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-2">
          {rating.toFixed(1)} / {maxRating}
        </span>
      )}
    </div>
  );
};

export default Rating;