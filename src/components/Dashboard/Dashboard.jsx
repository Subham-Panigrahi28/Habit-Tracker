import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../firebase/config';
import { useAuth } from '../Auth/AuthProvider';
import TaskList from './TaskList';
import StreakCounter from './StreakCounter';
import ProtocolSetup from './ProtocolSetup';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasProtocol, setHasProtocol] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (currentUser) {
          const protocolDocRef = doc(db, 'users', currentUser.uid, 'protocol', 'current');
          const protocolDoc = await getDoc(protocolDocRef);
          setHasProtocol(protocolDoc.exists());
          
          const streakDocRef = doc(db, 'users', currentUser.uid, 'stats', 'streak');
          const streakDoc = await getDoc(streakDocRef);
          
          if (streakDoc.exists()) {
            setStreak(streakDoc.data().currentStreak || 0);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleStreakUpdate = (newStreak) => {
    setStreak(newStreak);
  };

  const handleProtocolCreated = () => {
    setHasProtocol(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark text-text-primary py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-accent-primary">Monk Mode Tracker</h1>
          <button
            onClick={handleLogout}
            className="py-2 px-4 bg-background-card hover:bg-gray-800 rounded-md text-sm transition-colors duration-300"
          >
            Log Out
          </button>
        </div>

        {hasProtocol ? (
          <>
            <div className="mb-8 flex justify-center">
              <StreakCounter streak={streak} />
            </div>
            <TaskList onStreakUpdate={handleStreakUpdate} />
          </>
        ) : (
          <ProtocolSetup onProtocolCreated={handleProtocolCreated} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;