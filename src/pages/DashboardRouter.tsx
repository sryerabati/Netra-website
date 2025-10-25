import { useAuth } from '../contexts/DjangoAuthContext';
import { Navigate } from 'react-router-dom';
import PatientDashboard from './PatientDashboard';
import NurseDashboard from './NurseDashboard';
import DoctorDashboard from './DoctorDashboard';

export default function DashboardRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'patient':
      return <PatientDashboard />;
    case 'nurse':
      return <NurseDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}
