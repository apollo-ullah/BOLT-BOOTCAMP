import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import RoleSwitcher from './components/dev-utils/RoleSwitcher';
import LoadingSpinner from './components/ui/LoadingSpinner';
import MarketingHome from './pages/marketing/MarketingHome';
import Login from './pages/auth/Login';
import ConsultantPortal from './pages/portals/ConsultantPortal';
import PartnerPortal from './pages/portals/PartnerPortal';
import PMPortal from './pages/portals/PMPortal';
import ProjectGallery from './pages/portals/ProjectGallery';
import StaffProject from './pages/portals/StaffProject';
import AIEvaluation from './pages/portals/AIEvaluation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const App = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="lg" fullScreen />;
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route 
            path="/" 
            element={
              user && userProfile ? (
                <Navigate to={`/${userProfile.role}-portal`} />
              ) : (
                <MarketingHome />
              )
            } 
          />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route
            path="/consultant-portal"
            element={
              <ProtectedRoute allowedRoles={['consultant']}>
                <ConsultantPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner-portal"
            element={
              <ProtectedRoute allowedRoles={['partner']}>
                <PartnerPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pm-portal"
            element={
              <ProtectedRoute allowedRoles={['pm']}>
                <PMPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectGallery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff-project/:projectId"
            element={
              <ProtectedRoute>
                <StaffProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-evaluation"
            element={
              <ProtectedRoute>
                <AIEvaluation />
              </ProtectedRoute>
            }
          />
          {/* Catch-all route for unmatched paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {user && <RoleSwitcher />}
      </div>
    </Router>
  );
};

export default App;
