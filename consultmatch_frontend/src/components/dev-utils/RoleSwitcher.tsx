import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const RoleSwitcher = () => {
  const { userProfile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

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
    <div className="fixed bottom-4 right-4 z-50">
      {isVisible ? (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold">Test Role Switcher</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 text-sm px-2"
            >
              Hide
            </button>
          </div>
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
      ) : (
        <button
          onClick={() => setIsVisible(true)}
          className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50"
        >
          <span className="text-xs">🔄</span>
        </button>
      )}
    </div>
  );
};

export default RoleSwitcher; 