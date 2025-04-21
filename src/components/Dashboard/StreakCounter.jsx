import { useEffect, useState } from 'react';

const StreakCounter = ({ streak }) => {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    // Animate when streak changes
    if (streak > 0) {
      setAnimate(true);
      
      const timer = setTimeout(() => {
        setAnimate(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [streak]);

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`flex items-center justify-center rounded-full bg-accent-primary text-white w-24 h-24 text-3xl font-bold mb-2 ${
          animate ? 'animate-glow' : ''
        }`}
      >
        {streak}
      </div>
      <div className="text-text-secondary text-sm">Day Streak</div>
    </div>
  );
};

export default StreakCounter;