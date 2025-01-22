import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/formatting';
import { ROLES } from '../../config/constants';

interface Project {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'open' | 'in-progress' | 'completed';
  skills: string[];
}

// Mock project data
const projects: Project[] = [
  {
    id: '1',
    title: 'E-commerce Platform Development',
    description: 'Build a modern e-commerce platform using React and Node.js',
    startDate: '2024-02-01',
    endDate: '2024-05-01',
    budget: 50000,
    status: 'open',
    skills: ['React', 'Node.js', 'MongoDB', 'AWS']
  },
  {
    id: '2',
    title: 'Mobile App Development',
    description: 'Develop a cross-platform mobile app using React Native',
    startDate: '2024-03-01',
    endDate: '2024-06-01',
    budget: 40000,
    status: 'open',
    skills: ['React Native', 'Firebase', 'TypeScript']
  }
];

const ProjectGallery = () => {
  const { userProfile } = useAuth();

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderActionButton = (project: Project) => {
    if (!userProfile) return null;

    switch (userProfile.role) {
      case ROLES.CONSULTANT:
        return (
          <button className="btn btn-primary">
            Apply
          </button>
        );
      case ROLES.PARTNER:
        return (
          <button className="btn btn-primary">
            Edit Project
          </button>
        );
      case ROLES.PM:
        return (
          <button className="btn btn-primary">
            Manage Project
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Project Gallery</h1>
        {userProfile?.role === ROLES.PARTNER && (
          <button className="btn btn-primary">
            Create New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{project.title}</h2>
                <span
                  className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-500">
                  Start Date: {formatDate(project.startDate)}
                </p>
                <p className="text-sm text-gray-500">
                  End Date: {formatDate(project.endDate)}
                </p>
                <p className="text-sm font-medium">
                  Budget: ${project.budget.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              {renderActionButton(project)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectGallery; 