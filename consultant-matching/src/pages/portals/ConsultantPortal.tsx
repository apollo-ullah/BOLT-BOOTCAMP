import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ConsultantForm from '../../features/consultant/components/ConsultantForm';

const ConsultantPortal = () => {
  const { userProfile } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Consultant Portal</h1>
      <p className="mb-8">Welcome, {userProfile?.email}</p>
      <ConsultantForm />
    </div>
  );
};

export default ConsultantPortal; 