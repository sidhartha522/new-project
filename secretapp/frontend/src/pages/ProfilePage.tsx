import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MapPinIcon, 
  BriefcaseIcon, 
  AcademicCapIcon,
  PencilIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { User, Post } from '../types';

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isConnectionRequestSent, setIsConnectionRequestSent] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Determine if this is the current user's profile
  const isOwnProfile = !userId || userId === currentUser?._id;
  const profileUser = isOwnProfile ? currentUser : user;

  useEffect(() => {
    if (isOwnProfile && currentUser) {
      setUser(currentUser);
      setIsLoading(false);
    } else if (userId) {
      // Fetch user profile data
      fetchUserProfile(userId);
    }
  }, [userId, currentUser, isOwnProfile]);

  const fetchUserProfile = async (id: string) => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch(`/api/users/${id}`);
      const userData = await response.json();
      setUser(userData);
      
      // Check connection status
      checkConnectionStatus(id);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkConnectionStatus = (id: string) => {
    // TODO: Check if users are connected
    setIsConnected(false);
    setIsConnectionRequestSent(false);
  };

  const handleConnectionRequest = async () => {
    try {
      // TODO: Send connection request API call
      setIsConnectionRequestSent(true);
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleMessage = () => {
    // TODO: Navigate to messages with this user
    navigate(`/messages?user=${userId}`);
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
      </div>
    );
  }

  const tabs = [
    { id: 'posts', name: 'Posts', count: posts.length },
    { id: 'about', name: 'About' },
    { id: 'experience', name: 'Experience', count: profileUser.experience?.length || 0 },
    { id: 'education', name: 'Education', count: profileUser.education?.length || 0 },
    { id: 'skills', name: 'Skills', count: profileUser.skills?.length || 0 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-linkedin-blue to-blue-600 rounded-t-lg relative">
          {profileUser.coverPhoto && (
            <img
              src={profileUser.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover rounded-t-lg"
            />
          )}
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="relative">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-0">
              <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white overflow-hidden">
                {profileUser.profilePicture ? (
                  <img
                    src={profileUser.profilePicture}
                    alt={`${profileUser.firstName} ${profileUser.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-linkedin-blue flex items-center justify-center text-white text-3xl font-bold">
                    {profileUser.firstName[0]}{profileUser.lastName[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-4 space-x-3">
              {isOwnProfile ? (
                <button
                  onClick={handleEditProfile}
                  className="btn-secondary flex items-center"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <>
                  {isConnected ? (
                    <button className="btn-secondary flex items-center">
                      <CheckIconSolid className="w-4 h-4 mr-2 text-green-600" />
                      Connected
                    </button>
                  ) : isConnectionRequestSent ? (
                    <button className="btn-secondary flex items-center" disabled>
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Request Sent
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectionRequest}
                      className="btn-primary flex items-center"
                    >
                      <UserPlusIcon className="w-4 h-4 mr-2" />
                      Connect
                    </button>
                  )}
                  <button
                    onClick={handleMessage}
                    className="btn-secondary flex items-center"
                  >
                    <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                    Message
                  </button>
                  <button className="btn-secondary">
                    <EllipsisHorizontalIcon className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="mt-16">
            <h1 className="text-3xl font-bold text-gray-900">
              {profileUser.firstName} {profileUser.lastName}
              {profileUser.isVerified && (
                <CheckIconSolid className="w-6 h-6 text-blue-500 inline ml-2" />
              )}
            </h1>
            
            {profileUser.headline && (
              <p className="text-lg text-gray-700 mt-2">{profileUser.headline}</p>
            )}

            <div className="flex flex-wrap items-center text-gray-600 mt-4 space-x-6">
              {profileUser.location && (
                <div className="flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {profileUser.location.city}, {profileUser.location.state}
                  </span>
                </div>
              )}
              
              <div className="flex items-center">
                <span className="text-sm font-medium text-linkedin-blue">
                  {profileUser.connections?.length || 0} connections
                </span>
              </div>

              {profileUser.profileTypes && profileUser.profileTypes.length > 0 && (
                <div className="flex items-center">
                  <BriefcaseIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm">{profileUser.profileTypes.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Profile Completion */}
            {isOwnProfile && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-blue-900">Profile Strength</h3>
                    <p className="text-xs text-blue-700">Complete your profile to get better opportunities</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">75%</div>
                </div>
                <div className="mt-2 bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-linkedin-blue text-linkedin-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count !== undefined && (
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'posts' && (
            <div>
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600">
                    {isOwnProfile ? "Share your first post to get started!" : "This user hasn't posted anything yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Posts will be rendered here */}
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
              {profileUser.about ? (
                <p className="text-gray-700 whitespace-pre-wrap">{profileUser.about}</p>
              ) : (
                <p className="text-gray-500 italic">
                  {isOwnProfile ? "Add a description about yourself" : "No description available"}
                </p>
              )}
            </div>
          )}

          {activeTab === 'experience' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
              {profileUser.experience && profileUser.experience.length > 0 ? (
                <div className="space-y-6">
                  {profileUser.experience.map((exp, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0">
                        <BriefcaseIcon className="w-12 h-12 text-gray-400 bg-gray-100 p-3 rounded" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">{exp.position}</h4>
                        <p className="text-gray-700">{exp.company}</p>
                        <p className="text-sm text-gray-500">
                          {exp.startDate} - {exp.endDate || 'Present'} • {exp.location}
                        </p>
                        {exp.description && (
                          <p className="mt-2 text-gray-700">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  {isOwnProfile ? "Add your work experience" : "No experience listed"}
                </p>
              )}
            </div>
          )}

          {activeTab === 'education' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
              {profileUser.education && profileUser.education.length > 0 ? (
                <div className="space-y-6">
                  {profileUser.education.map((edu, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0">
                        <AcademicCapIcon className="w-12 h-12 text-gray-400 bg-gray-100 p-3 rounded" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">{edu.institution}</h4>
                        <p className="text-gray-700">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                        <p className="text-sm text-gray-500">
                          {edu.startYear} - {edu.endYear || 'Present'}
                        </p>
                        {edu.description && (
                          <p className="mt-2 text-gray-700">{edu.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  {isOwnProfile ? "Add your education" : "No education listed"}
                </p>
              )}
            </div>
          )}

          {activeTab === 'skills' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
              {profileUser.skills && profileUser.skills.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {profileUser.skills.map((skill, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{skill.name}</h4>
                          {skill.endorsements && skill.endorsements.length > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              {skill.endorsements.length} endorsement{skill.endorsements.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        {!isOwnProfile && (
                          <button className="btn-secondary text-sm">
                            Endorse
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  {isOwnProfile ? "Add your skills" : "No skills listed"}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
