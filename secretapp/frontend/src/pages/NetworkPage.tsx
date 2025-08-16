import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MagnifyingGlassIcon,
  UserPlusIcon,
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { User } from '../types';

type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'connected';

interface NetworkUser extends User {
  connectionStatus: ConnectionStatus;
  mutualConnections: number;
}

const NetworkPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'suggestions' | 'requests' | 'connections'>('suggestions');
  const [searchQuery, setSearchQuery] = useState('');
  const [profileTypeFilter, setProfileTypeFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [suggestions, setSuggestions] = useState<NetworkUser[]>([]);
  const [requests, setRequests] = useState<NetworkUser[]>([]);
  const [connections, setConnections] = useState<NetworkUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for suggestions
      const mockSuggestions: NetworkUser[] = [
        {
          _id: 'user1',
          firstName: 'Emily',
          lastName: 'Rodriguez',
          email: 'emily@example.com',
          age: 28,
          gender: 'Female',
          phoneNumber: '+1234567890',
          location: { city: 'Los Angeles', state: 'CA', country: 'USA' },
          headline: 'Supply Chain Manager at TechCorp',
          profileTypes: ['Distributor'],
          profileTypeData: {},
          skills: [],
          education: [],
          experience: [],
          connections: [],
          followers: [],
          following: [],
          isVerified: true,
          isEmailVerified: true,
          privacySettings: {
            profileVisibility: 'public',
            contactInfoVisible: true,
            lastSeenVisible: true,
            allowMessagesFrom: 'everyone'
          },
          lastActive: new Date().toISOString(),
          profileViews: { count: 0, viewers: [] },
          notifications: {
            email: true,
            push: true,
            connectionRequests: true,
            messages: true,
            postEngagement: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          connectionStatus: 'none',
          mutualConnections: 5
        },
        {
          _id: 'user2',
          firstName: 'David',
          lastName: 'Kim',
          email: 'david@example.com',
          age: 35,
          gender: 'Male',
          phoneNumber: '+1234567891',
          location: { city: 'Seattle', state: 'WA', country: 'USA' },
          headline: 'Manufacturing Engineer at InnoTech',
          profileTypes: ['Manufacturer'],
          profileTypeData: {},
          skills: [],
          education: [],
          experience: [],
          connections: [],
          followers: [],
          following: [],
          isVerified: false,
          isEmailVerified: true,
          privacySettings: {
            profileVisibility: 'public',
            contactInfoVisible: true,
            lastSeenVisible: true,
            allowMessagesFrom: 'everyone'
          },
          lastActive: new Date(Date.now() - 3600000).toISOString(),
          profileViews: { count: 0, viewers: [] },
          notifications: {
            email: true,
            push: true,
            connectionRequests: true,
            messages: true,
            postEngagement: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          connectionStatus: 'none',
          mutualConnections: 3
        }
      ];

      // Mock data for connection requests
      const mockRequests: NetworkUser[] = [
        {
          _id: 'user3',
          firstName: 'Lisa',
          lastName: 'Chen',
          email: 'lisa@example.com',
          age: 31,
          gender: 'Female',
          phoneNumber: '+1234567892',
          location: { city: 'Chicago', state: 'IL', country: 'USA' },
          headline: 'Retail Operations Director',
          profileTypes: ['Retailer'],
          profileTypeData: {},
          skills: [],
          education: [],
          experience: [],
          connections: [],
          followers: [],
          following: [],
          isVerified: true,
          isEmailVerified: true,
          privacySettings: {
            profileVisibility: 'public',
            contactInfoVisible: true,
            lastSeenVisible: true,
            allowMessagesFrom: 'everyone'
          },
          lastActive: new Date(Date.now() - 1800000).toISOString(),
          profileViews: { count: 0, viewers: [] },
          notifications: {
            email: true,
            push: true,
            connectionRequests: true,
            messages: true,
            postEngagement: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          connectionStatus: 'pending_received',
          mutualConnections: 7
        }
      ];

      // Mock data for existing connections
      const mockConnections: NetworkUser[] = [
        {
          _id: 'user4',
          firstName: 'Robert',
          lastName: 'Wilson',
          email: 'robert@example.com',
          age: 42,
          gender: 'Male',
          phoneNumber: '+1234567893',
          location: { city: 'Boston', state: 'MA', country: 'USA' },
          headline: 'CEO at Manufacturing Solutions Inc.',
          profileTypes: ['Entrepreneur'],
          profileTypeData: {},
          skills: [],
          education: [],
          experience: [],
          connections: [],
          followers: [],
          following: [],
          isVerified: true,
          isEmailVerified: true,
          privacySettings: {
            profileVisibility: 'public',
            contactInfoVisible: true,
            lastSeenVisible: true,
            allowMessagesFrom: 'everyone'
          },
          lastActive: new Date(Date.now() - 900000).toISOString(),
          profileViews: { count: 0, viewers: [] },
          notifications: {
            email: true,
            push: true,
            connectionRequests: true,
            messages: true,
            postEngagement: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          connectionStatus: 'connected',
          mutualConnections: 12
        }
      ];

      setSuggestions(mockSuggestions);
      setRequests(mockRequests);
      setConnections(mockConnections);
    } catch (error) {
      console.error('Error fetching network data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendConnectionRequest = async (userId: string) => {
    setLoadingActions(prev => ({ ...prev, [userId]: true }));
    try {
      // TODO: Send API request
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setSuggestions(prev => 
        prev.map(user => 
          user._id === userId 
            ? { ...user, connectionStatus: 'pending_sent' as ConnectionStatus }
            : user
        )
      );
    } catch (error) {
      console.error('Error sending connection request:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleConnectionRequest = async (userId: string, action: 'accept' | 'decline') => {
    setLoadingActions(prev => ({ ...prev, [userId]: true }));
    try {
      // TODO: Send API request
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      if (action === 'accept') {
        const acceptedUser = requests.find(user => user._id === userId);
        if (acceptedUser) {
          setConnections(prev => [...prev, { ...acceptedUser, connectionStatus: 'connected' }]);
        }
      }
      
      setRequests(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error handling connection request:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [userId]: false }));
    }
  };

  const removeConnection = async (userId: string) => {
    setLoadingActions(prev => ({ ...prev, [userId]: true }));
    try {
      // TODO: Send API request
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setConnections(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error removing connection:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [userId]: false }));
    }
  };

  const getFilteredUsers = (users: NetworkUser[]) => {
    return users.filter(user => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.headline?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProfileType = 
        profileTypeFilter === 'all' || 
        user.profileTypes.includes(profileTypeFilter as any);
      
      const matchesLocation = 
        locationFilter === 'all' ||
        user.location.city.toLowerCase().includes(locationFilter.toLowerCase()) ||
        user.location.state.toLowerCase().includes(locationFilter.toLowerCase());
      
      return matchesSearch && matchesProfileType && matchesLocation;
    });
  };

  const UserCard: React.FC<{ user: NetworkUser }> = ({ user }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linkedin-blue flex items-center justify-center text-white font-bold text-lg">
              {user.firstName[0]}{user.lastName[0]}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <Link 
                to={`/profile/${user._id}`}
                className="text-lg font-medium text-gray-900 hover:text-linkedin-blue"
              >
                {user.firstName} {user.lastName}
                {user.isVerified && (
                  <CheckIcon className="inline w-4 h-4 text-blue-500 ml-1" />
                )}
              </Link>
              <p className="text-gray-600 text-sm mt-1">{user.headline}</p>
              <p className="text-gray-500 text-sm">
                {user.location.city}, {user.location.state}
              </p>
              {user.mutualConnections > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {user.mutualConnections} mutual connections
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              {user.connectionStatus === 'none' && (
                <button
                  onClick={() => sendConnectionRequest(user._id)}
                  disabled={loadingActions[user._id]}
                  className="btn-primary flex items-center justify-center min-w-[100px]"
                >
                  {loadingActions[user._id] ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <UserPlusIcon className="w-4 h-4 mr-2" />
                      Connect
                    </>
                  )}
                </button>
              )}

              {user.connectionStatus === 'pending_sent' && (
                <div className="btn-secondary cursor-not-allowed min-w-[100px] text-center">
                  Pending
                </div>
              )}

              {user.connectionStatus === 'pending_received' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleConnectionRequest(user._id, 'accept')}
                    disabled={loadingActions[user._id]}
                    className="btn-primary flex items-center justify-center"
                  >
                    {loadingActions[user._id] ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <CheckIcon className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleConnectionRequest(user._id, 'decline')}
                    disabled={loadingActions[user._id]}
                    className="btn-secondary flex items-center justify-center"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}

              {user.connectionStatus === 'connected' && (
                <div className="flex space-x-2">
                  <Link
                    to={`/messages?user=${user._id}`}
                    className="btn-secondary flex items-center justify-center"
                  >
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    Message
                  </Link>
                  <button
                    onClick={() => removeConnection(user._id)}
                    disabled={loadingActions[user._id]}
                    className="text-gray-500 hover:text-red-600 p-2"
                    title="Remove connection"
                  >
                    {loadingActions[user._id] ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <XMarkIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {user.profileTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Network</h1>
        <p className="text-gray-600">
          Manage your professional connections and discover new opportunities
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Filters:</span>
            </div>
            
            <select
              value={profileTypeFilter}
              onChange={(e) => setProfileTypeFilter(e.target.value)}
              className="input-field min-w-[140px]"
            >
              <option value="all">All Types</option>
              <option value="Manufacturer">Manufacturer</option>
              <option value="Retailer">Retailer</option>
              <option value="Distributor">Distributor</option>
              <option value="Contract Manufacturer">Contract Manufacturer</option>
              <option value="Student">Student</option>
              <option value="Entrepreneur">Entrepreneur</option>
              <option value="Service Provider">Service Provider</option>
            </select>

            <input
              type="text"
              placeholder="Location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="input-field min-w-[120px]"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'suggestions'
                ? 'border-linkedin-blue text-linkedin-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Suggestions ({suggestions.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-linkedin-blue text-linkedin-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Requests ({requests.length})
            {requests.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {requests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'connections'
                ? 'border-linkedin-blue text-linkedin-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Connections ({connections.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {getFilteredUsers(suggestions).length > 0 ? (
              getFilteredUsers(suggestions).map((user) => (
                <UserCard key={user._id} user={user} />
              ))
            ) : (
              <div className="text-center py-12">
                <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No suggestions found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria or check back later.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {getFilteredUsers(requests).length > 0 ? (
              getFilteredUsers(requests).map((user) => (
                <UserCard key={user._id} user={user} />
              ))
            ) : (
              <div className="text-center py-12">
                <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No connection requests</h3>
                <p className="mt-1 text-sm text-gray-500">
                  When someone sends you a connection request, it will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="space-y-4">
            {getFilteredUsers(connections).length > 0 ? (
              getFilteredUsers(connections).map((user) => (
                <UserCard key={user._id} user={user} />
              ))
            ) : (
              <div className="text-center py-12">
                <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No connections yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start building your network by connecting with professionals in your industry.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkPage;
