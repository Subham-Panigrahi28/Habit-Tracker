import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../firebase/config';
import { useAuth } from '../Auth/AuthProvider';
import TaskList from './TaskList';
import StreakCounter from './StreakCounter';
import ProtocolSetup from './ProtocolSetup';
import QuoteRotator from './QuoteRotator';
import EditProtocol from './EditProtocol';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasProtocol, setHasProtocol] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProtocol, setCurrentProtocol] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (currentUser) {
          const protocolDocRef = doc(db, 'users', currentUser.uid, 'protocol', 'current');
          const protocolDoc = await getDoc(protocolDocRef);
          const hasExistingProtocol = protocolDoc.exists();
          setHasProtocol(hasExistingProtocol);
          
          if (hasExistingProtocol) {
            setCurrentProtocol(protocolDoc.data());
          }
          
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

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditComplete = () => {
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-dark to-background-darker py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="card-gradient rounded-2xl shadow-2xl p-8 backdrop-blur">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
              Monk Mode Tracker
            </h1>
            <div className="flex gap-4">
              {hasProtocol && !isEditing && (
                <button
                  onClick={handleEditClick}
                  className="py-2 px-6 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary rounded-lg text-sm transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  Edit Protocol
                </button>
              )}
              <button
                onClick={handleLogout}
                className="py-2 px-6 bg-background-card hover:bg-gray-800 rounded-lg text-sm transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                Log Out
              </button>
            </div>
          </div>

          {hasProtocol ? (
            isEditing ? (
              <EditProtocol 
                currentProtocol={currentProtocol}
                onEditComplete={handleEditComplete}
              />
            ) : (
              <>
                <QuoteRotator />
                <div className="mb-12 flex justify-center">
                  <StreakCounter streak={streak} />
                </div>
                <TaskList onStreakUpdate={handleStreakUpdate} />
              </>
            )
          ) : (
            <ProtocolSetup onProtocolCreated={handleProtocolCreated} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
