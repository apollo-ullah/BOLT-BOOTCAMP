import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user, userProfile, signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-primary-dark bg-opacity-20' : '';
  };

  return (
    <nav className="nav-gradient text-white p-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold">
              ConsultMatch
            </Link>
            {user && userProfile && (
              <div className="ml-8 space-x-4">
                {userProfile.role === 'consultant' && (
                  <>
                    <Link
                      to="/consultant-portal"
                      className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark hover:bg-opacity-20 ${isActive('/consultant-portal')}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/projects"
                      className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark hover:bg-opacity-20 ${isActive('/projects')}`}
                    >
                      Projects
                    </Link>
                  </>
                )}
                {userProfile.role === 'partner' && (
                  <>
                    <Link
                      to="/partner-portal"
                      className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark hover:bg-opacity-20 ${isActive('/partner-portal')}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/projects"
                      className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark hover:bg-opacity-20 ${isActive('/projects')}`}
                    >
                      Projects
                    </Link>
                  </>
                )}
                {userProfile.role === 'pm' && (
                  <>
                    <Link
                      to="/pm-portal"
                      className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark hover:bg-opacity-20 ${isActive('/pm-portal')}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/projects"
                      className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark hover:bg-opacity-20 ${isActive('/projects')}`}
                    >
                      Projects
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm">{userProfile?.email}</span>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm font-medium bg-white text-primary rounded-md hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium bg-white text-primary rounded-md hover:bg-gray-100"
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