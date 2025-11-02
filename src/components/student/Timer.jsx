import React from 'react';

/**
 * A "dumb" component that simply formats and displays
 * the time (in seconds) it receives as a prop.
 */
const Timer = ({ timeLeftInSeconds }) => {
  // Format the time
  const minutes = Math.floor(timeLeftInSeconds / 60);
  const seconds = timeLeftInSeconds % 60;

  return (
    <div className="text-2xl font-bold text-red-600">
      Time Left: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};

export default Timer;

