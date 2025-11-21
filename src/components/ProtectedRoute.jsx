import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && profile && !allowedRoles.includes(profile.role_custom)) {
    // Rediriger vers le dashboard approprié selon le rôle
    let redirectTo = '/dashboardcrm';
    if (profile.role_custom === 'partenaire') {
      redirectTo = '/partenairesdashboard';
    } else if (profile.role_custom === 'acquereur') {
      redirectTo = '/acquereur-dashboard';
    }
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
