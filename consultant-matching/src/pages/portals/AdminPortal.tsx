import MatchList from '../components/admin/MatchList';

const AdminPortal = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          <p className="mt-2 text-gray-600">
            Review and manage consultant matches
          </p>
        </div>
        <MatchList />
      </div>
    </div>
  );
};

export default AdminPortal; 