import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  BellIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'My Network', href: '/network', icon: UserGroupIcon },
    { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
    { name: 'Messaging', href: '/messages', icon: ChatBubbleLeftRightIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon },
  ];

  const isActiveRoute = (href: string) => {
    return location.pathname === href || 
           (href !== '/' && location.pathname.startsWith(href));
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Search */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-linkedin-blue rounded text-white font-bold text-lg flex items-center justify-center">
                P
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                ProNetwork
              </span>
            </Link>
            
            {/* Search Bar */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for people, jobs, companies..."
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-blue focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item ${isActiveRoute(item.href) ? 'active' : ''}`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs mt-1">{item.name}</span>
                </Link>
              );
            })}
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className={`nav-item ${location.pathname.includes('/profile') ? 'active' : ''}`}
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="h-6 w-6" />
                )}
                <span className="text-xs mt-1">Me</span>
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-600">{user?.headline}</p>
                  </div>
                  
                  <Link
                    to={`/profile/${user?._id}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    View Profile
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-linkedin-blue"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-item ${isActiveRoute(item.href) ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs mt-1">{item.name}</span>
                  </Link>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                to={`/profile/${user?._id}`}
                className="block py-2 text-sm text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                View Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 text-sm text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dropdown Background Overlay */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;
