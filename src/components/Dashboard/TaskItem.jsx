import { useState } from 'react';

const TaskItem = ({ task, onToggle, completed }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onToggle(task.id);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div 
      className={`flex items-center p-4 mb-3 rounded-xl transition-all duration-300 transform hover:scale-[1.01] ${
        completed 
          ? 'bg-accent-primary/10 border border-accent-primary/30' 
          : 'bg-background-card border border-gray-800'
      }`}
    >
      <button
        onClick={handleClick}
        className={`relative w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-4 transition-all duration-300 ${
          isAnimating ? 'scale-110' : ''
        } ${
          completed
            ? 'border-accent-primary bg-accent-primary shadow-glow'
            : 'border-gray-600 bg-transparent hover:border-accent-primary/50'
        }`}
      >
        {completed && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-white"></span>
          </span>
        )}
      </button>
      
      <div className="flex-1">
        <h3 className={`font-medium transition-colors duration-300 ${
          completed ? 'text-text-secondary line-through' : 'text-text-primary'
        }`}>
          {task.name}
        </h3>
        {task.description && (
          <p className={`text-sm mt-1 transition-colors duration-300 ${
            completed ? 'text-text-secondary/50 line-through' : 'text-text-secondary'
          }`}>
            {task.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
