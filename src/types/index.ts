// ============================================
// IIITSocial Types
// ============================================

export type University = 'IIIT Pune' | 'IIIT Hyderabad' | 'IIIT Delhi' | 'IIIT Bangalore';
export type Branch = 'CSE' | 'ECE' | 'IT' | 'AI/ML' | 'Data Science' | 'Other';
export type AcademicYear = '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Alumni';
export type PlatformStatus = 'NOVA' | 'CORE' | 'PRIME' | 'LEGACY';
export type PostType = 'text' | 'image' | 'video' | 'poll' | 'discussion' | 'anonymous' | 'blog' | 'event' | 'repost';
export type DiscussionType = 'SHORT_OPINION' | 'QUESTION' | 'DISCUSSION' | 'POLL' | 'ADVICE' | 'BLOG' | 'ANONYMOUS';
export type CreateType = 'post' | 'video' | 'discussion' | 'blog' | 'poll' | 'anonymous' | 'event';
export type NotificationType = 'like' | 'comment' | 'follow' | 'connection' | 'mention' | 'trending' | 'community' | 'event' | 'message' | 'moderation';
export type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
export type ModerationAction = 'warn' | 'remove_content' | 'suspend_user' | 'dismiss';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  coverImage?: string;
  bio?: string;
  university: University;
  branch: Branch;
  academicYear: AcademicYear;
  graduationYear: number;
  interests: string[];
  skills: string[];
  status: PlatformStatus;
  isVerified: boolean;
  isClub: boolean;
  followers: string[];
  following: string[];
  connections: string[];
  joinedCommunities: string[];
  lookingFor: string[];
  location?: string;
  website?: string;
  createdAt: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface Post {
  id: string;
  authorId: string;
  type: PostType;
  content: string;
  images?: string[];
  videoUrl?: string;
  hashtags?: string[];
  mentions?: string[];
  location?: string;
  likes: string[];
  comments: Comment[];
  shares: number;
  reposts: string[];
  saves: string[];
  communityId?: string;
  isAnonymous: boolean;
  repostOf?: string;
  createdAt: string;
  engagementScore: number;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  likes: string[];
  replies: Comment[];
  createdAt: string;
  isAnonymous: boolean;
}

export interface Discussion {
  id: string;
  authorId: string;
  type: DiscussionType;
  title: string;
  content: string;
  tags: string[];
  upvotes: string[];
  downvotes: string[];
  replies: DiscussionReply[];
  communityId?: string;
  isAnonymous: boolean;
  isPinned: boolean;
  createdAt: string;
  viewCount: number;
}

export interface DiscussionReply {
  id: string;
  authorId: string;
  content: string;
  upvotes: string[];
  downvotes: string[];
  replies: DiscussionReply[];
  createdAt: string;
  isAnonymous: boolean;
}

export interface Blog {
  id: string;
  authorId: string;
  title: string;
  content: string;
  coverImage?: string;
  tags: string[];
  readingTime: number;
  likes: string[];
  comments: Comment[];
  saves: string[];
  createdAt: string;
  published: boolean;
}

export interface Poll {
  id: string;
  authorId: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  endsAt?: string;
  createdAt: string;
  communityId?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[];
}

export interface Community {
  id: string;
  name: string;
  description: string;
  banner?: string;
  icon?: string;
  members: string[];
  posts: string[];
  createdBy: string;
  isVerified: boolean;
  createdAt: string;
  category: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  avatar: string;
  banner?: string;
  members: string[];
  events: string[];
  isVerified: boolean;
  createdBy: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  date: string;
  time: string;
  location: string;
  interested: string[];
  createdBy: string;
  clubId?: string;
  communityId?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'shared_post';
  sharedPostId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message | null;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  actorId?: string;
  targetId?: string;
  targetType?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  targetId: string;
  targetType: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  moderationAction?: ModerationAction;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ModerationLog {
  id: string;
  moderatorId: string;
  action: ModerationAction;
  targetUserId: string;
  targetId: string;
  targetType: string;
  reason: string;
  createdAt: string;
}

export interface Video {
  id: string;
  authorId: string;
  title?: string;
  videoUrl: string;
  thumbnailUrl: string;
  views: number;
  likes: string[];
  comments: Comment[];
  shares: number;
  saves: string[];
  duration: number;
  createdAt: string;
}

export interface TrendingTopic {
  id: string;
  tag: string;
  postCount: number;
  engagementScore: number;
  isRising: boolean;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  discussions: Discussion[];
  blogs: Blog[];
  polls: Poll[];
  communities: Community[];
  clubs: Club[];
  events: Event[];
  messages: Message[];
  conversations: Conversation[];
  notifications: Notification[];
  reports: Report[];
  moderationLogs: ModerationLog[];
  videos: Video[];
  trendingTopics: TrendingTopic[];
  isOnboarded: boolean;
  isLoggedIn: boolean;
  activePage: string;
  createModalOpen: boolean;
  createModalType: CreateType | null;
}
