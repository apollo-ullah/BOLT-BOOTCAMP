import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Typography } from '@mui/material';

const Navbar = () => {
  const location = useLocation();
  const { user, userProfile, signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-primary-dark bg-opacity-20' : '';
  };

  return (
    <nav className="nav-gradient text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center -ml-4">
            <Typography 
              variant="h5" 
              component={Link} 
              to="/"
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.8px',
                textDecoration: 'none',
                textShadow: '0 0 20px rgba(255,255,255,0.1)',
                '&:hover': {
                  transform: 'scale(1.02)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              Wingman
            </Typography>
            {user && userProfile && (
              <div className="ml-12 space-x-6">
                {userProfile.role === 'consultant' && (
                  <>
                    <Link
                      to="/consultant-portal"
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary-dark hover:bg-opacity-30 ${isActive('/consultant-portal')}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/projects"
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary-dark hover:bg-opacity-30 ${isActive('/projects')}`}
                    >
                      Projects
                    </Link>
                  </>
                )}
                {userProfile.role === 'partner' && (
                  <>
                    <Link
                      to="/partner-portal"
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary-dark hover:bg-opacity-30 ${isActive('/partner-portal')}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/projects"
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary-dark hover:bg-opacity-30 ${isActive('/projects')}`}
                    >
                      Projects
                    </Link>
                  </>
                )}
                {userProfile.role === 'pm' && (
                  <>
                    <Link
                      to="/pm-portal"
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary-dark hover:bg-opacity-30 ${isActive('/pm-portal')}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/projects"
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary-dark hover:bg-opacity-30 ${isActive('/projects')}`}
                    >
                      Projects
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <span className="text-sm font-medium">{userProfile?.email}</span>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm font-medium bg-white text-primary rounded-md transition-all duration-200 hover:bg-gray-100 hover:shadow-md"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium bg-white text-primary rounded-md transition-all duration-200 hover:bg-gray-100 hover:shadow-md"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 