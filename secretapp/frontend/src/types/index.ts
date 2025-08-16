export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  phoneNumber: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  profilePicture?: string;
  coverPhoto?: string;
  headline?: string;
  about?: string;
  profileTypes: ProfileType[];
  profileTypeData: ProfileTypeData;
  skills: Skill[];
  education: Education[];
  experience: Experience[];
  connections: Connection[];
  followers: string[];
  following: string[];
  isVerified: boolean;
  isEmailVerified: boolean;
  privacySettings: PrivacySettings;
  lastActive: string;
  profileViews: ProfileViews;
  notifications: NotificationSettings;
  createdAt: string;
  updatedAt: string;
}

export type ProfileType = 
  | 'Manufacturer'
  | 'Retailer'
  | 'Distributor'
  | 'Contract Manufacturer'
  | 'Student'
  | 'Entrepreneur'
  | 'Service Provider';

export interface ProfileTypeData {
  manufacturer?: {
    productionCapacity?: string;
    certifications?: string[];
    productCategories?: string[];
    yearsInOperation?: number;
  };
  retailer?: {
    storeLocations?: string[];
    salesChannels?: string[];
    targetMarket?: string;
    annualRevenue?: string;
  };
  distributor?: {
    coverageArea?: string[];
    productCategories?: string[];
    clientTypes?: string[];
    logisticsCapability?: string;
  };
  contractManufacturer?: {
    manufacturingServices?: string[];
    minimumOrderQuantity?: string;
    leadTime?: string;
    qualityCertifications?: string[];
  };
  student?: {
    institution?: string;
    major?: string;
    graduationYear?: number;
    lookingFor?: string[];
    gpa?: number;
  };
  entrepreneur?: {
    companyName?: string;
    companyStage?: string;
    industry?: string;
    fundingStatus?: string;
    teamSize?: number;
  };
  serviceProvider?: {
    serviceCategories?: string[];
    pricingModel?: string;
    availability?: string;
    experienceYears?: number;
    certifications?: string[];
  };
}

export interface Skill {
  name: string;
  endorsements: Endorsement[];
}

export interface Endorsement {
  userId: string;
  endorsedAt: string;
}

export interface Education {
  _id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  grade?: string;
  activities?: string;
  description?: string;
}

export interface Experience {
  _id?: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  skills?: string[];
}

export interface Connection {
  _id: string;
  userId: string;
  status: 'pending' | 'accepted' | 'declined';
  connectedAt: string;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'connections' | 'private';
  contactInfoVisible: boolean;
  lastSeenVisible: boolean;
  allowMessagesFrom: 'everyone' | 'connections' | 'none';
}

export interface ProfileViews {
  count: number;
  viewers: ProfileViewer[];
}

export interface ProfileViewer {
  userId: string;
  viewedAt: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  connectionRequests: boolean;
  messages: boolean;
  postEngagement: boolean;
}

export interface Post {
  _id: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    headline?: string;
    profileTypes: ProfileType[];
  };
  content: string;
  media: {
    images?: MediaItem[];
    videos?: MediaItem[];
    documents?: MediaItem[];
  };
  hashtags: string[];
  mentions: Mention[];
  likes: Like[];
  comments: Comment[];
  shares: Share[];
  visibility: 'public' | 'connections' | 'private';
  allowComments: boolean;
  allowShares: boolean;
  postType: 'text' | 'image' | 'video' | 'article' | 'poll' | 'event';
  article?: Article;
  poll?: Poll;
  event?: Event;
  views: {
    count: number;
    viewers: PostViewer[];
  };
  moderationStatus: 'active' | 'under_review' | 'hidden' | 'removed';
  isLikedByUser?: boolean;
  isSharedByUser?: boolean;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  url: string;
  caption?: string;
  thumbnail?: string;
  duration?: number;
  filename?: string;
  fileType?: string;
  fileSize?: number;
  uploadedAt: string;
}

export interface Mention {
  userId: string;
  username: string;
}

export interface Like {
  userId: string;
  likedAt: string;
}

export interface Comment {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  content: string;
  likes: Like[];
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  content: string;
  createdAt: string;
}

export interface Share {
  userId: string;
  sharedAt: string;
  shareType: 'direct' | 'with_comment';
  shareComment?: string;
}

export interface Article {
  title: string;
  summary: string;
  readTime: number;
  coverImage?: string;
}

export interface Poll {
  question: string;
  options: PollOption[];
  expiresAt: string;
  allowMultipleChoices: boolean;
}

export interface PollOption {
  text: string;
  votes: Vote[];
}

export interface Vote {
  userId: string;
  votedAt: string;
}

export interface Event {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: {
    type: 'online' | 'offline' | 'hybrid';
    address?: string;
    city?: string;
    country?: string;
  };
  eventType: 'online' | 'offline' | 'hybrid';
  attendees: Attendee[];
  maxAttendees?: number;
}

export interface Attendee {
  userId: string;
  status: 'going' | 'interested' | 'not_going';
  respondedAt: string;
}

export interface PostViewer {
  userId: string;
  viewedAt: string;
}

export interface Message {
  _id: string;
  participants: string[];
  conversationType: 'direct' | 'group';
  groupInfo?: GroupInfo;
  messages: MessageItem[];
  lastMessage: LastMessage;
  isArchived: ArchivedInfo[];
  isPinned: PinnedInfo[];
  isMuted: MutedInfo[];
  totalMessages: number;
  createdAt: string;
  updatedAt: string;
}

// Simple conversation type for chat interface
export interface Conversation {
  _id: string;
  participants: string[];
  lastMessage?: MessageItem;
  unreadCount: number;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
}

// Simple message type for chat interface  
export interface ChatMessage {
  _id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  read: boolean;
  messageType: 'text' | 'image' | 'file' | 'voice' | 'video';
}

export interface GroupInfo {
  name: string;
  description?: string;
  avatar?: string;
  admins: string[];
  createdBy: string;
}

export interface MessageItem {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  content: string;
  messageType: 'text' | 'image' | 'file' | 'voice' | 'video';
  attachments: MessageAttachment[];
  timestamp: string;
  readBy: ReadInfo[];
  reactions: MessageReaction[];
  replyTo?: string;
  isEdited: boolean;
  editedAt?: string;
  originalContent?: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface MessageAttachment {
  type: 'image' | 'document' | 'video' | 'audio';
  url: string;
  filename?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface ReadInfo {
  userId: string;
  readAt: string;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  reactedAt: string;
}

export interface LastMessage {
  content: string;
  sender: string;
  timestamp: string;
  messageType: string;
}

export interface ArchivedInfo {
  userId: string;
  archivedAt: string;
}

export interface PinnedInfo {
  userId: string;
  pinnedAt: string;
}

export interface MutedInfo {
  userId: string;
  mutedAt: string;
  muteUntil?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  phoneNumber: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  profileTypes: ProfileType[];
  profileTypeData?: ProfileTypeData;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  errors?: ValidationError[];
}

export interface ValidationError {
  msg: string;
  param: string;
  location: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ValidationError[];
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  total: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
