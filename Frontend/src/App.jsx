import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Discover from './pages/Discover';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import CommunityRegistration from './pages/CommunityRegistration';
import Dashboard from './pages/Dashboard';
import ConnectionRequests from './pages/ConnectionRequests';
import Messages from './pages/Messages';
import Meetings from './pages/Meetings';
import Badges from './pages/Badges';
import AdminDashboard from './pages/AdminDashboard';
import Recommendations from './pages/Recommendations';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/community-registration" element={
                <ProtectedRoute>
                  <CommunityRegistration />
                </ProtectedRoute>
              } />

              {/* Protected Routes */}
              <Route path="/discover" element={
                <ProtectedRoute>
                  <Discover />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/profile/:userId" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/connection-requests" element={
                <ProtectedRoute>
                  <ConnectionRequests />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              <Route path="/meetings" element={
                <ProtectedRoute>
                  <Meetings />
                </ProtectedRoute>
              } />
              <Route path="/badges" element={
                <ProtectedRoute>
                  <Badges />
                </ProtectedRoute>
              } />
              <Route path="/recommendations" element={
                <ProtectedRoute>
                  <Recommendations />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
