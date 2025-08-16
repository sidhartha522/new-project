import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { UserCircleIcon, EyeIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  if (!user) return null;

  const profileCompletion = 85; // This would come from the user object in real implementation

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="card p-6">
        <div className="text-center">
          {/* Cover Photo */}
          <div className="h-20 bg-gradient-to-r from-linkedin-blue to-linkedin-blue-dark rounded-lg mb-4 relative">
            {user.coverPhoto && (
              <img
                src={user.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover rounded-lg"
              />
            )}
            
            {/* Profile Picture */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-12 h-12 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <UserCircleIcon className="w-12 h-12 text-gray-400 bg-white rounded-full border-4 border-white" />
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="mt-8">
            <Link
              to={`/profile/${user._id}`}
              className="text-lg font-semibold text-gray-900 hover:text-linkedin-blue"
            >
              {user.firstName} {user.lastName}
            </Link>
            {user.headline && (
              <p className="text-sm text-gray-600 mt-1">{user.headline}</p>
            )}
            {user.location && (
              <p className="text-xs text-gray-500 mt-1">
                {user.location.city}, {user.location.country}
              </p>
            )}
          </div>

          {/* Profile Views */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <EyeIcon className="h-4 w-4 mr-1" />
                Profile views
              </div>
              <span className="text-linkedin-blue font-medium">
                {user.profileViews?.count || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Connections</span>
              <span className="text-linkedin-blue font-medium">
                {user.connections?.filter(c => c.status === 'accepted').length || 0}
              </span>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-left">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Profile completion</span>
                <span className="text-linkedin-blue font-medium">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-linkedin-blue h-2 rounded-full transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              {profileCompletion < 100 && (
                <p className="text-xs text-gray-500 mt-2">
                  Complete your profile to increase visibility
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <Link
              to={`/profile/${user._id}/edit`}
              className="block w-full text-center py-2 text-sm text-linkedin-blue hover:bg-gray-50 rounded"
            >
              Edit Profile
            </Link>
            <Link
              to="/premium"
              className="block w-full text-center py-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
            >
              Try Premium
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Types */}
      {user.profileTypes && user.profileTypes.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Profile Types</h3>
          <div className="space-y-2">
            {user.profileTypes.map((type, index) => (
              <div
                key={index}
                className="bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-700"
              >
                {type}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {user.skills && user.skills.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Skills</h3>
          <div className="space-y-2">
            {user.skills.slice(0, 5).map((skill, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{skill.name}</span>
                <span className="text-xs text-gray-500">
                  {skill.endorsements?.length || 0}
                </span>
              </div>
            ))}
            {user.skills.length > 5 && (
              <Link
                to={`/profile/${user._id}#skills`}
                className="text-sm text-linkedin-blue hover:underline"
              >
                See all skills ({user.skills.length})
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h3>
        <div className="space-y-3">
          <div className="text-sm">
            <p className="text-gray-700">
              You appeared in {Math.floor(Math.random() * 10) + 1} searches this week
            </p>
            <p className="text-xs text-gray-500 mt-1">See who found you</p>
          </div>
          <div className="text-sm">
            <p className="text-gray-700">
              {Math.floor(Math.random() * 5) + 1} people viewed your profile
            </p>
            <p className="text-xs text-gray-500 mt-1">See profile views</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
