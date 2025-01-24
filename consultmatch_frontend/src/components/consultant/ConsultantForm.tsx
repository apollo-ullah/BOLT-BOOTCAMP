import { useState } from 'react';
import type { IConsultant } from '../../types';

const ConsultantForm = () => {
  const [formData, setFormData] = useState<Partial<IConsultant>>({
    name: '',
    email: '',
    skills: [],
    experience: 0,
    availability: {
      startDate: new Date(),
      endDate: new Date(),
    },
    resume: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setFormData(prev => ({ ...prev, skills }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          required
        />
      </div>

      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
          Skills (comma-separated)
        </label>
        <input
          type="text"
          id="skills"
          value={formData.skills?.join(', ')}
          onChange={handleSkillsChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          required
        />
      </div>

      <div>
        <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
          Years of Experience
        </label>
        <input
          type="number"
          id="experience"
          value={formData.experience}
          onChange={e => setFormData(prev => ({ ...prev, experience: Number(e.target.value) }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          min="0"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Available From
          </label>
          <input
            type="date"
            id="startDate"
            value={formData.availability?.startDate.toISOString().split('T')[0]}
            onChange={e => setFormData(prev => ({
              ...prev,
              availability: {
                ...prev.availability!,
                startDate: new Date(e.target.value)
              }
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            Available Until
          </label>
          <input
            type="date"
            id="endDate"
            value={formData.availability?.endDate.toISOString().split('T')[0]}
            onChange={e => setFormData(prev => ({
              ...prev,
              availability: {
                ...prev.availability!,
                endDate: new Date(e.target.value)
              }
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
          Resume Link
        </label>
        <input
          type="url"
          id="resume"
          value={formData.resume}
          onChange={e => setFormData(prev => ({ ...prev, resume: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition"
      >
        Submit Profile
      </button>
    </form>
  );
};

export default ConsultantForm; 