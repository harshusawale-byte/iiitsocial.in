// ============================================
// DEV ONLY — Test seed data for local development
// NEVER use this in production.
// Toggle with DEV_SEED_ENABLED flag in the store.
// ============================================

import { User, Post, Discussion, Blog, Poll, Community, Club, Event, Message, Conversation, Notification, Video, TrendingTopic } from '../types';

const avatar = (id: number) => `https://api.dicebear.com/9.x/notionists/svg?seed=dev${id}&backgroundColor=0a0a0a`;

export const DEV_SEED_USERS: User[] = [
  { id: 'dev_u1', name: 'Dev User 1', username: 'devuser1', email: 'dev1@test.local', avatar: avatar(1), university: 'IIIT Pune', branch: 'CSE', academicYear: '2nd Year', graduationYear: 2028, interests: ['Coding'], skills: ['JavaScript'], status: 'NOVA', isVerified: true, isClub: false, followers: [], following: [], connections: [], joinedCommunities: [], lookingFor: [], createdAt: '2025-08-29', isOnline: true, lastSeen: '2025-08-29' },
  { id: 'dev_u2', name: 'Dev User 2', username: 'devuser2', email: 'dev2@test.local', avatar: avatar(2), university: 'IIIT Pune', branch: 'CSE', academicYear: '3rd Year', graduationYear: 2027, interests: ['AI'], skills: ['Python'], status: 'NOVA', isVerified: true, isClub: false, followers: [], following: [], connections: [], joinedCommunities: [], lookingFor: [], createdAt: '2025-08-29', isOnline: true, lastSeen: '2025-08-29' },
  { id: 'dev_u3', name: 'Dev User 3', username: 'devuser3', email: 'dev3@test.local', avatar: avatar(3), university: 'IIIT Pune', branch: 'IT', academicYear: '1st Year', graduationYear: 2029, interests: ['Gaming'], skills: [], status: 'NOVA', isVerified: true, isClub: false, followers: [], following: [], connections: [], joinedCommunities: [], lookingFor: [], createdAt: '2025-08-29', isOnline: false, lastSeen: '2025-08-29' },
];

export const DEV_SEED_POSTS: Post[] = [
  { id: 'dev_p1', authorId: 'dev_u1', type: 'text', content: 'This is a dev test post. Only visible when dev seed mode is enabled.', images: [], likes: [], comments: [], shares: 0, reposts: [], saves: [], isAnonymous: false, createdAt: new Date().toISOString(), engagementScore: 1 },
];

export const DEV_SEED_DISCUSSIONS: Discussion[] = [];
export const DEV_SEED_BLOGS: Blog[] = [];
export const DEV_SEED_POLLS: Poll[] = [];
export const DEV_SEED_COMMUNITIES: Community[] = [];
export const DEV_SEED_CLUBS: Club[] = [];
export const DEV_SEED_EVENTS: Event[] = [];
export const DEV_SEED_MESSAGES: Message[] = [];
export const DEV_SEED_CONVERSATIONS: Conversation[] = [];
export const DEV_SEED_NOTIFICATIONS: Notification[] = [];
export const DEV_SEED_VIDEOS: Video[] = [];
export const DEV_SEED_TRENDING: TrendingTopic[] = [];
