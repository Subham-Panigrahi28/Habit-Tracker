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
  
  const completionPercentage = tasks.length > 0
    ? (Object.values(completedTasks).filter(Boolean).length / tasks.length) * 100
    : 0;

  useEffect(() => {
    const loadTaskData = async () => {
      try {
        setIsLoading(true);
        
        const protocolDocRef = doc(db, 'users', currentUser.uid, 'protocol', 'current');
        const protocolDoc = await getDoc(protocolDocRef);
        
        if (protocolDoc.exists()) {
          setTasks(protocolDoc.data().tasks || []);
        }
        
        const today = startOfDay(new Date());
        const todayISO = formatISO(today);
        
        const taskDocRef = doc(db, 'users', currentUser.uid, 'dailyTasks', todayISO);
        const taskDoc = await getDoc(taskDocRef);
        
        const streakDocRef = doc(db, 'users', currentUser.uid, 'stats', 'streak');
        const streakDoc = await getDoc(streakDocRef);
        
        if (taskDoc.exists()) {
          const taskData = taskDoc.data();
          setCompletedTasks(taskData.completedTasks || {});
        } else {
          if (streakDoc.exists()) {
            const { lastCompleted, currentStreak } = streakDoc.data();
            
            if (lastCompleted) {
              const lastCompletedDate = new Date(lastCompleted);
              setLastCompletedDate(lastCompletedDate);
              
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              
              if (!isSameDay(lastCompletedDate, yesterday) && currentStreak > 0) {
                await setDoc(streakDocRef, {
                  currentStreak: 0,
                  lastCompleted: null,
                  highestStreak: streakDoc.data().highestStreak || 0
                });
                
                onStreakUpdate(0);
              }
            }
          }
          
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
      const today = startOfDay(new Date());
      const todayISO = formatISO(today);
      
      const updatedCompletedTasks = {
        ...completedTasks,
        [taskId]: !completedTasks[taskId]
      };
      
      setCompletedTasks(updatedCompletedTasks);
      
      const taskDocRef = doc(db, 'users', currentUser.uid, 'dailyTasks', todayISO);
      await setDoc(taskDocRef, {
        date: todayISO,
        completedTasks: updatedCompletedTasks
      }, { merge: true });
      
      const allCompleted = tasks.every(task => updatedCompletedTasks[task.id]);
      
      if (allCompleted) {
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
              currentStreak = (streakData.currentStreak || 0) + 1;
            }
          }
          
          if (currentStreak > highestStreak) {
            highestStreak = currentStreak;
          }
        }
        
        await setDoc(streakDocRef, {
          currentStreak,
          highestStreak,
          lastCompleted: todayISO
        }, { merge: true });
        
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Today's Tasks</h2>
        <span className="text-sm text-text-secondary">
          {Math.round(completionPercentage)}% Complete
        </span>
      </div>
      
      <div className="h-2 bg-background-dark rounded-full mb-8 overflow-hidden">
        <div 
          className="progress-bar h-full rounded-full"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      <div className="space-y-4">
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
