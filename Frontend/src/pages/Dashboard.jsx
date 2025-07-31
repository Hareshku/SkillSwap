import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.full_name}! Here's your learning overview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📚</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Skills Learning</h3>
                <p className="text-2xl font-bold text-primary-600">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🎓</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Skills Teaching</h3>
                <p className="text-2xl font-bold text-secondary-600">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🤝</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Connections</h3>
                <p className="text-2xl font-bold text-green-600">0</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-600">No recent activity yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Start by creating a post or connecting with other learners
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Meetings</h2>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📅</div>
              <p className="text-gray-600">No upcoming meetings</p>
              <p className="text-sm text-gray-500 mt-2">
                Schedule meetings with your learning partners
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            🚧 Dashboard functionality will be enhanced as other features are implemented.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
