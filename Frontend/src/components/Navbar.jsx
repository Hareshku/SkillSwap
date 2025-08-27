import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: "Home", path: "/", public: true },
    { name: "About", path: "/about", public: true },
    { name: "Discover", path: "/discover", public: false },
    { name: "Contact", path: "/contact", public: true },
  ];

  const adminLinks = [
    { name: "Admin", path: "/admin", public: false, adminOnly: true },
  ];

  const userLinks = [
    // Recommendations moved to profile page
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="w-[100%] mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-[6rem]">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-[2.5rem] h-[2.5rem] bg-black rounded-full"></div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-end flex-1 mr-8">
            <div className="flex items-center space-x-8">
              {navLinks.map((link) => {
                if (!link.public && !isAuthenticated) return null;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2 text-2xl font-medium transition-colors duration-200 relative ${isActive(link.path)
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                      }`}
                  >
                    {link.name}
                    {isActive(link.path) && (
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-purple-600"></div>
                    )}
                  </Link>
                );
              })}

              {/* Admin links for authenticated admin users */}
              {isAuthenticated &&
                user?.role === "admin" &&
                adminLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2 text-2xl font-medium transition-colors duration-200 relative ${isActive(link.path)
                      ? "text-gray-500"
                      : "text-gray-500 hover:text-gray-900"
                      }`}
                  >
                    {link.name}
                    {isActive(link.path) && (
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-purple-600"></div>
                    )}
                  </Link>
                ))}

              {/* User links for authenticated non-admin users */}
              {isAuthenticated &&
                user?.role !== "admin" &&
                userLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2 text-2xl font-medium transition-colors duration-200 relative ${isActive(link.path)
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                      }`}
                  >
                    {link.name}
                    {isActive(link.path) && (
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-purple-600"></div>
                    )}
                  </Link>
                ))}
            </div>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors duration-200">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.full_name?.charAt(0)?.toUpperCase() || "H"}
                    </span>
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    {/* Show Dashboard, User Profile, and Settings only for non-admin users */}
                    {user?.role !== "admin" && (
                      <>
                        <Link
                          to="/dashboard"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                            </svg>
                          </div>
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-3 text-sm text-purple-600 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <svg
                              className="w-3 h-3 text-purple-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          User Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <svg
                              className="w-3 h-3 text-purple-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          Settings
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <svg
                          className="w-3 h-3 text-red-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-purple-600 px-3 py-2 text-2xl font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full text-2xl font-medium transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-100">
            {navLinks.map((link) => {
              if (!link.public && !isAuthenticated) return null;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive(link.path)
                    ? "text-purple-600 bg-purple-50"
                    : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Mobile admin links */}
            {isAuthenticated &&
              user?.role === "admin" &&
              adminLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive(link.path)
                    ? "text-purple-600 bg-purple-50"
                    : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                    }`}
                >
                  {link.name}
                </Link>
              ))}

            {/* Mobile user links */}
            {isAuthenticated &&
              user?.role !== "admin" &&
              userLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive(link.path)
                    ? "text-purple-600 bg-purple-50"
                    : "text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                    }`}
                >
                  {link.name}
                </Link>
              ))}

            {isAuthenticated ? (
              <div className="border-t border-gray-100 pt-4 mt-4">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-3 py-2 text-gray-700 hover:text-purple-600"
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-medium text-sm">
                      {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="text-base font-medium">
                    {user?.full_name}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-purple-600 text-base font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-4 mt-4 space-y-1">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-gray-700 hover:text-purple-600 text-base font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 bg-purple-600 text-white rounded-md text-base font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
