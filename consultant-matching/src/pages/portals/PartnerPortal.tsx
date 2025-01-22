import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const PartnerPortal = () => {
  const { userProfile } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-4">
          {userProfile?.photoURL ? (
            <img 
              src={userProfile.photoURL} 
              alt="Profile" 
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
              {userProfile?.email?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {userProfile?.displayName || userProfile?.email}</h1>
            <p className="text-gray-600">Partner Dashboard</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Projects</h3>
          <p className="text-3xl font-bold text-primary">0</p>
          <p className="text-sm text-gray-600 mt-1">Projects in progress</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Available Consultants</h3>
          <p className="text-3xl font-bold text-primary">0</p>
          <p className="text-sm text-gray-600 mt-1">Matching your criteria</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Project Success Rate</h3>
          <p className="text-3xl font-bold text-primary">0%</p>
          <p className="text-sm text-gray-600 mt-1">Based on completed projects</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Project</h2>
          <p className="text-gray-600 mb-4">
            Define project requirements and find the perfect consultant match.
          </p>
          <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition">
            Create Project
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Projects</h2>
          <p className="text-gray-600 mb-4">
            View and manage all your active and completed projects.
          </p>
          <Link 
            to="/projects"
            className="inline-block bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
          >
            View Projects
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-gray-600 text-center py-8">
          <p>No recent activity to show.</p>
          <p className="text-sm mt-2">Project updates and consultant matches will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default PartnerPortal; 