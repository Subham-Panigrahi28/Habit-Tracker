import { useEffect, useState } from 'react';
import { collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { formatISO, startOfDay, isSameDay } from 'date-fns';
import { db } from '../../firebase/config';
import TaskItem from './TaskItem';
import { useAuth } from '../Auth/AuthProvider';

const TaskList = ({ onStreakUpdate }) => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastCompletedDate, setLastCompletedDate] = useState(null);
  
  useEffect(() => {
    const loadTaskData = async () => {
      try {
        setIsLoading(true);
        
        // Load user's protocol
        const protocolDocRef = doc(db, 'users', currentUser.uid, 'protocol', 'current');
        const protocolDoc = await getDoc(protocolDocRef);
        
        if (protocolDoc.exists()) {
          setTasks(protocolDoc.data().tasks || []);
        }
        
        // Get today's date (start of day)
        const today = startOfDay(new Date());
        const todayISO = formatISO(today);
        
        // Reference to user's task document for today
        const taskDocRef = doc(db, 'users', currentUser.uid, 'dailyTasks', todayISO);
        const taskDoc = await getDoc(taskDocRef);
        
        // Get user streak info
        const streakDocRef = doc(db, 'users', currentUser.uid, 'stats', 'streak');
        const streakDoc = await getDoc(streakDocRef);
        
        if (taskDoc.exists()) {
          // We have tasks for today
          const taskData = taskDoc.data();
          setCompletedTasks(taskData.completedTasks || {});
        } else {
          // Check if we need to reset streak
          if (streakDoc.exists()) {
            const { lastCompleted, currentStreak } = streakDoc.data();
            
            if (lastCompleted) {
              const lastCompletedDate = new Date(lastCompleted);
              setLastCompletedDate(lastCompletedDate);
              
              // If last completed date is not yesterday, reset streak
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              
              if (!isSameDay(lastCompletedDate, yesterday) && currentStreak > 0) {
                // Reset streak
                await setDoc(streakDocRef, {
                  currentStreak: 0,
                  lastCompleted: null,
                  highestStreak: streakDoc.data().highestStreak || 0
                });
                
                // Update parent component
                onStreakUpdate(0);
              }
            }
          }
          
          // Create new task document for today
          await setDoc(taskDocRef, {
            date: todayISO,
            completedTasks: {}
          });
          
          setCompletedTasks({});
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentUser) {
      loadTaskData();
    }
  }, [currentUser, onStreakUpdate]);

  const handleToggleTask = async (taskId) => {
    try {
      // Get today's date
      const today = startOfDay(new Date());
      const todayISO = formatISO(today);
      
      // Toggle the task completion status
      const updatedCompletedTasks = {
        ...completedTasks,
        [taskId]: !completedTasks[taskId]
      };
      
      setCompletedTasks(updatedCompletedTasks);
      
      // Update Firestore
      const taskDocRef = doc(db, 'users', currentUser.uid, 'dailyTasks', todayISO);
      await setDoc(taskDocRef, {
        date: todayISO,
        completedTasks: updatedCompletedTasks
      }, { merge: true });
      
      // Check if all tasks are completed
      const allCompleted = tasks.every(task => updatedCompletedTasks[task.id]);
      
      if (allCompleted) {
        // Update streak
        const streakDocRef = doc(db, 'users', currentUser.uid, 'stats', 'streak');
        const streakDoc = await getDoc(streakDocRef);
        
        let currentStreak = 1;
        let highestStreak = 1;
        
        if (streakDoc.exists()) {
          const streakData = streakDoc.data();
          highestStreak = streakData.highestStreak || 0;
          
          if (streakData.lastCompleted) {
            const lastCompleted = new Date(streakData.lastCompleted);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (isSameDay(lastCompleted, yesterday)) {
              // Continue streak
              currentStreak = (streakData.currentStreak || 0) + 1;
            }
          }
          
          if (currentStreak > highestStreak) {
            highestStreak = currentStreak;
          }
        }
        
        // Update streak document
        await setDoc(streakDocRef, {
          currentStreak,
          highestStreak,
          lastCompleted: todayISO
        }, { merge: true });
        
        // Update parent component
        onStreakUpdate(currentStreak);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4 text-text-primary">Today's Tasks</h2>
      <div>
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            completed={!!completedTasks[task.id]}
            onToggle={handleToggleTask}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;