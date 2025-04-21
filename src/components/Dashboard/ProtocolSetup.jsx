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

const ProtocolSetup = ({ onProtocolCreated }) => {
  const { currentUser } = useAuth();
  const [duration, setDuration] = useState('');
  const [tasks, setTasks] = useState([{ name: '', description: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddTask = () => {
    setTasks([...tasks, { name: '', description: '' }]);
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
        duration: parseInt(duration),
        startDate: new Date().toISOString(),
        tasks: validTasks.map((task, index) => ({
          id: (index + 1).toString(),
          name: task.name.trim(),
          description: task.description.trim()
        }))
      };

      const protocolDocRef = doc(db, 'users', currentUser.uid, 'protocol', 'current');
      await setDoc(protocolDocRef, protocol);
      onProtocolCreated();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-card p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-accent-primary mb-6">Create Your Monk Mode Protocol</h2>
      
      {error && (
        <div className="p-4 mb-6 bg-error/20 border border-error/30 rounded-md text-sm text-white">
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
            className="w-full px-4 py-2 bg-background-dark border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
          >
            <option value="">Select duration</option>
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
                  className="flex-1 px-4 py-2 bg-background-dark border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTask(index)}
                  className="px-3 py-2 bg-error/20 hover:bg-error/30 rounded-md transition-colors"
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
                className="w-full px-4 py-2 bg-background-dark border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleAddTask}
            className="px-4 py-2 bg-background-dark hover:bg-gray-800 rounded-md transition-colors"
          >
            Add Task
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-accent-primary hover:bg-accent-secondary rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Start Protocol'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProtocolSetup;