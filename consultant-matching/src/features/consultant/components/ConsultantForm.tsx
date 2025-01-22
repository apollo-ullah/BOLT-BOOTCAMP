import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

interface ConsultantFormData {
  skills: string[];
  experience: string;
  availability: string;
  ratePerHour: number;
}

const ConsultantForm = () => {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState<ConsultantFormData>({
    skills: [],
    experience: '',
    availability: 'full-time',
    ratePerHour: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Complete Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Skills</label>
          <input
            type="text"
            placeholder="Add skills (comma separated)"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            onChange={(e) => setFormData({
              ...formData,
              skills: e.target.value.split(',').map(s => s.trim())
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Experience</label>
          <textarea
            rows={4}
            placeholder="Describe your relevant experience"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            onChange={(e) => setFormData({
              ...formData,
              experience: e.target.value
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Availability</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            onChange={(e) => setFormData({
              ...formData,
              availability: e.target.value
            })}
          >
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Rate per Hour (USD)</label>
          <input
            type="number"
            min="0"
            step="10"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            onChange={(e) => setFormData({
              ...formData,
              ratePerHour: parseInt(e.target.value)
            })}
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConsultantForm; 