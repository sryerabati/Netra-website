import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PatientDashboard from './pages/PatientDashboard';
import NurseDashboard from './pages/NurseDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

function App() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    if (window.location.pathname === '/signup') {
      return <Signup />;
    }
    return <Login />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl p-8 text-center border border-gray-200/50 dark:border-gray-700/50">
          <p className="text-gray-900 dark:text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  switch (profile.role) {
    case 'patient':
      return <PatientDashboard />;
    case 'nurse':
      return <NurseDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl p-8 text-center border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-gray-900 dark:text-white">Invalid role</p>
          </div>
        </div>
      );
  }
}

export default App;
