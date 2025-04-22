import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../Auth/AuthProvider';

const DURATION_OPTIONS = [
  { value: 21, label: '21 Days' },
  { value: 45, label: '45 Days' },
  { value: 90, label: '90 Days' },
  { value: 0, label: 'No Limit' }
];

const EditProtocol = ({ currentProtocol, onEditComplete }) => {
  const { currentUser } = useAuth();
  const [duration, setDuration] = useState(currentProtocol.duration.toString());
  const [tasks, setTasks] = useState(currentProtocol.tasks);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddTask = () => {
    setTasks([...tasks, { 
      id: (tasks.length + 1).toString(),
      name: '', 
      description: '' 
    }]);
  };

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const handleRemoveTask = (index) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!duration) {
        throw new Error('Please select a duration');
      }

      const validTasks = tasks.filter(task => task.name.trim());
      if (validTasks.length === 0) {
        throw new Error('Please add at least one task');
      }

      const protocol = {
        ...currentProtocol,
        duration: parseInt(duration),
        tasks: validTasks.map((task, index) => ({
          id: (index + 1).toString(),
          name: task.name.trim(),
          description: task.description.trim()
        }))
      };

      const protocolDocRef = doc(db, 'users', currentUser.uid, 'protocol', 'current');
      await setDoc(protocolDocRef, protocol);
      onEditComplete();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-card/50 p-6 rounded-xl backdrop-blur">
      <h2 className="text-2xl font-bold text-accent-primary mb-6">Edit Your Monk Mode Protocol</h2>
      
      {error && (
        <div className="p-4 mb-6 bg-error/20 border border-error/30 rounded-lg text-sm text-white">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Protocol Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-4 py-2 bg-background-dark border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all duration-300"
          >
            {DURATION_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-text-secondary">
            Protocol Tasks
          </label>
          {tasks.map((task, index) => (
            <div key={index} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Task name"
                  value={task.name}
                  onChange={(e) => handleTaskChange(index, 'name', e.target.value)}
                  className="flex-1 px-4 py-2 bg-background-dark border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTask(index)}
                  className="px-3 py-2 bg-error/20 hover:bg-error/30 rounded-lg transition-all duration-300"
                  disabled={tasks.length === 1}
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                placeholder="Description (optional)"
                value={task.description}
                onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                className="w-full px-4 py-2 bg-background-dark border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all duration-300"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleAddTask}
            className="px-4 py-2 bg-background-dark hover:bg-gray-800 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            Add Task
          </button>
          <button
            type="button"
            onClick={onEditComplete}
            className="px-4 py-2 bg-background-dark hover:bg-gray-800 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-accent-primary hover:bg-accent-secondary rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProtocol;
