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
      className={`flex items-center p-4 mb-3 rounded-lg transition-all ${
        completed 
          ? 'bg-accent-primary/20 border border-accent-primary/30' 
          : 'bg-background-card border border-gray-700'
      }`}
    >
      <button
        onClick={handleClick}
        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mr-4 transition-colors duration-300 ${
          isAnimating ? 'check-animation' : ''
        } ${
          completed
            ? 'border-accent-primary bg-accent-primary'
            : 'border-gray-600 bg-transparent hover:bg-gray-700'
        }`}
      >
        {completed && (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      
      <div className="flex-1">
        <h3 className={`font-medium transition-colors ${
          completed ? 'text-text-primary line-through' : 'text-text-primary'
        }`}>
          {task.name}
        </h3>
        {task.description && (
          <p className={`text-sm transition-colors ${
            completed ? 'text-text-secondary line-through' : 'text-text-secondary'
          }`}>
            {task.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskItem;