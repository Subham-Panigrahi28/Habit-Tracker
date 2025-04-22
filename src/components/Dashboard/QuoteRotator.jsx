import { useState, useEffect } from 'react';

const quotes = [
  "In the silence of discipline lies the path to mastery.",
  "Every moment of focus builds the foundation of greatness.",
  "Through solitude, we discover our true strength.",
  "Discipline is the bridge between goals and accomplishment.",
  "In monk mode, we transform ourselves one day at a time."
];

const QuoteRotator = () => {
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center mb-8 h-16 flex items-center justify-center">
      <p className="quote-fade text-lg text-text-secondary italic">
        "{quotes[currentQuote]}"
      </p>
    </div>
  );
};

export default QuoteRotator;
