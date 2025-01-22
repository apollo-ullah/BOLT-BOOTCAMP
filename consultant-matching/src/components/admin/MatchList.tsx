import { useState } from 'react';
import type { IMatch, IConsultant, IProject } from '../../types';

// Mock data for demonstration
const mockMatches: (IMatch & { consultant: IConsultant; project: IProject })[] = [
  {
    consultantId: '1',
    projectId: '1',
    matchScore: 0.95,
    status: 'pending',
    consultant: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      skills: ['React', 'TypeScript', 'Node.js'],
      experience: 5,
      availability: {
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-06-30'),
      },
      resume: 'https://example.com/resume',
    },
    project: {
      id: '1',
      title: 'E-commerce Platform',
      description: 'Building a modern e-commerce platform using React and Node.js',
      requiredSkills: ['React', 'Node.js', 'TypeScript'],
      duration: 6,
      status: 'open',
    },
  },
  // Add more mock matches as needed
];

const MatchList = () => {
  const [matches] = useState(mockMatches);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Consultant Matches</h2>
      <div className="space-y-6">
        {matches.map(match => (
          <div
            key={`${match.consultantId}-${match.projectId}`}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{match.consultant.name}</h3>
                <p className="text-gray-600">{match.consultant.email}</p>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Skills:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {match.consultant.skills.map(skill => (
                      <span
                        key={skill}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block bg-primary text-white px-3 py-1 rounded-full">
                  {(match.matchScore * 100).toFixed(0)}% Match
                </span>
                <p className="mt-2 text-sm capitalize text-gray-600">
                  Status: {match.status}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <h4 className="font-semibold">Project Details</h4>
              <p className="text-gray-700 mt-1">{match.project.title}</p>
              <p className="text-sm text-gray-600 mt-1">
                {match.project.description}
              </p>
              <div className="mt-2">
                <p className="text-sm text-gray-500">Required Skills:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {match.project.requiredSkills.map(skill => (
                    <span
                      key={skill}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-4">
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition">
                Reject
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition">
                Accept
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchList; 