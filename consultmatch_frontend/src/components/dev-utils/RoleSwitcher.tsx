import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const RoleSwitcher = () => {
  const { userProfile, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRoleChange = async (newRole: 'consultant' | 'pm' | 'partner') => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { role: newRole }, { merge: true });
      window.location.reload(); // Reload to update the UI
    } catch (error) {
      console.error('Error changing role:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
      <h3 className="text-sm font-semibold mb-2">Test Role Switcher</h3>
      <div className="space-y-2">
        <button
          onClick={() => handleRoleChange('consultant')}
          disabled={loading || userProfile.role === 'consultant'}
          className={`w-full px-3 py-1 rounded text-sm ${
            userProfile.role === 'consultant' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Consultant
        </button>
        <button
          onClick={() => handleRoleChange('pm')}
          disabled={loading || userProfile.role === 'pm'}
          className={`w-full px-3 py-1 rounded text-sm ${
            userProfile.role === 'pm' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Project Manager
        </button>
        <button
          onClick={() => handleRoleChange('partner')}
          disabled={loading || userProfile.role === 'partner'}
          className={`w-full px-3 py-1 rounded text-sm ${
            userProfile.role === 'partner' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Partner
        </button>
      </div>
    </div>
  );
};

export default RoleSwitcher; 