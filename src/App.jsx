import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './components/Auth/AuthProvider';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [appLoaded, setAppLoaded] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Add slight delay for smoother transition
      const timer = setTimeout(() => {
        setAppLoaded(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background-dark flex flex-col items-center justify-center transition-opacity duration-500 ${appLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {currentUser ? (
        <Dashboard />
      ) : (
        <Login />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;