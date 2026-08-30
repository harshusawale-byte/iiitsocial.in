'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { AppState, Post, Discussion, Comment, User, Community, Poll, Event, Message, Conversation, Notification, Report, ModerationLog, DiscussionReply, Blog, CreateType, Story, Reel } from '../types';
import { emailNotifications } from '../lib/email/client';

const STORAGE_KEY = 'iiitsocial_state';

function getDefaultState(): AppState {
  return {
    currentUser: null,
    users: [],
    posts: [],
    discussions: [],
    blogs: [],
    polls: [],
    communities: [],
    clubs: [],
    events: [],
    messages: [],
    conversations: [],
    notifications: [],
    reports: [],
    moderationLogs: [],
    stories: [],
    reels: [],
    videos: [],
    trendingTopics: [],
    isOnboarded: false,
    isLoggedIn: false,
    activePage: 'home',
    createModalOpen: false,
    createModalType: null,
    storyViewerOpen: false,
    storyViewerAuthorId: null,
  };
}

function loadState(): AppState {
  if (typeof window === 'undefined') return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      const defaults = getDefaultState();
      return {
        ...defaults,
        ...parsed,
        users: parsed.users || defaults.users,
        posts: parsed.posts || defaults.posts,
        discussions: parsed.discussions || defaults.discussions,
        blogs: parsed.blogs || defaults.blogs,
        polls: parsed.polls || defaults.polls,
        communities: parsed.communities || defaults.communities,
        clubs: parsed.clubs || defaults.clubs,
        events: parsed.events || defaults.events,
        messages: parsed.messages || defaults.messages,
        conversations: parsed.conversations || defaults.conversations,
        notifications: parsed.notifications || defaults.notifications,
        reports: parsed.reports || defaults.reports,
        moderationLogs: parsed.moderationLogs || defaults.moderationLogs,
        videos: parsed.videos || defaults.videos,
        stories: parsed.stories || defaults.stories,
        reels: parsed.reels || defaults.reels,
        trendingTopics: parsed.trendingTopics || defaults.trendingTopics,
      };
    }
  } catch { /* ignore */ }
  return getDefaultState();
}

type Action =
  | { type: 'SET_USER'; user: User | null }
  | { type: 'SET_LOGGED_IN'; value: boolean }
  | { type: 'SET_ONBOARDED'; value: boolean }
  | { type: 'UPDATE_USER'; userId: string; updates: Partial<User> }
  | { type: 'ADD_POST'; post: Post }
  | { type: 'LIKE_POST'; postId: string; userId: string }
  | { type: 'SAVE_POST'; postId: string; userId: string }
  | { type: 'REPOST'; postId: string; userId: string }
  | { type: 'ADD_COMMENT'; postId: string; comment: Comment }
  | { type: 'LIKE_COMMENT'; postId: string; commentId: string; userId: string }
  | { type: 'FOLLOW_USER'; targetId: string; currentId: string }
  | { type: 'UNFOLLOW_USER'; targetId: string; currentId: string }
  | { type: 'CONNECT_USER'; targetId: string; currentId: string }
  | { type: 'DISCONNECT_USER'; targetId: string; currentId: string }
  | { type: 'ADD_COMMUNITY'; community: Community }
  | { type: 'JOIN_COMMUNITY'; communityId: string; userId: string }
  | { type: 'LEAVE_COMMUNITY'; communityId: string; userId: string }
  | { type: 'ADD_DISCUSSION'; discussion: Discussion }
  | { type: 'UPVOTE_DISCUSSION'; discussionId: string; userId: string }
  | { type: 'DOWNVOTE_DISCUSSION'; discussionId: string; userId: string }
  | { type: 'ADD_DISCUSSION_REPLY'; discussionId: string; reply: DiscussionReply }
  | { type: 'ADD_BLOG'; blog: Blog }
  | { type: 'LIKE_BLOG'; blogId: string; userId: string }
  | { type: 'VOTE_POLL'; pollId: string; optionId: string; userId: string }
  | { type: 'ADD_POLL'; poll: Poll }
  | { type: 'ADD_EVENT'; event: Event }
  | { type: 'INTEREST_EVENT'; eventId: string; userId: string }
  | { type: 'SEND_MESSAGE'; message: Message }
  | { type: 'MARK_MESSAGES_READ'; conversationId: string; userId: string }
  | { type: 'ADD_NOTIFICATION'; notification: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; notificationId: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'ADD_REPORT'; report: Report }
  | { type: 'RESOLVE_REPORT'; reportId: string; action: ModerationLog }
  | { type: 'ADD_STORY'; story: Story }
  | { type: 'VIEW_STORY'; storyId: string; userId: string }
  | { type: 'REMOVE_STORY'; storyId: string }
  | { type: 'ADD_REEL'; reel: Reel }
  | { type: 'LIKE_REEL'; reelId: string; userId: string }
  | { type: 'SAVE_REEL'; reelId: string; userId: string }
  | { type: 'VIEW_REEL'; reelId: string }
  | { type: 'REMOVE_POST'; postId: string }
  | { type: 'REMOVE_DISCUSSION'; discussionId: string }
  | { type: 'SUSPEND_USER'; userId: string }
  | { type: 'SET_ACTIVE_PAGE'; page: string }
  | { type: 'SET_CREATE_MODAL'; open: boolean; createType?: CreateType | null }
  | { type: 'SET_STORY_VIEWER'; open: boolean; authorId?: string | null }
  | { type: 'LOAD_DEV_SEED' }
  | { type: 'RESET_STATE' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.user, isLoggedIn: !!action.user };
    case 'SET_LOGGED_IN':
      return { ...state, isLoggedIn: action.value };
    case 'SET_ONBOARDED':
      return { ...state, isOnboarded: action.value };
    case 'UPDATE_USER': {
      const users = state.users.map(u => u.id === action.userId ? { ...u, ...action.updates } : u);
      const currentUser = state.currentUser?.id === action.userId ? { ...state.currentUser, ...action.updates } : state.currentUser;
      // If user doesn't exist in users array yet, add them
      const userExists = users.some(u => u.id === action.userId);
      if (!userExists && action.updates.id) {
        users.push(action.updates as User);
      }
      return { ...state, users, currentUser };
    }
    case 'ADD_POST':
      return { ...state, posts: [action.post, ...state.posts] };
    case 'LIKE_POST': {
      const posts = state.posts.map(p => {
        if (p.id !== action.postId) return p;
        const likes = p.likes.includes(action.userId)
          ? p.likes.filter(id => id !== action.userId)
          : [...p.likes, action.userId];
        return { ...p, likes, engagementScore: p.engagementScore + (p.likes.includes(action.userId) ? -2 : 2) };
      });
      return { ...state, posts };
    }
    case 'SAVE_POST': {
      const posts = state.posts.map(p => {
        if (p.id !== action.postId) return p;
        const saves = p.saves.includes(action.userId)
          ? p.saves.filter(id => id !== action.userId)
          : [...p.saves, action.userId];
        return { ...p, saves };
      });
      return { ...state, posts };
    }
    case 'REPOST': {
      const posts = state.posts.map(p => {
        if (p.id !== action.postId) return p;
        const reposts = p.reposts.includes(action.userId) ? p.reposts : [...p.reposts, action.userId];
        return { ...p, reposts, shares: p.shares + (p.reposts.includes(action.userId) ? 0 : 1) };
      });
      return { ...state, posts };
    }
    case 'ADD_COMMENT': {
      const posts = state.posts.map(p => {
        if (p.id !== action.postId) return p;
        return { ...p, comments: [...p.comments, action.comment], engagementScore: p.engagementScore + 3 };
      });
      return { ...state, posts };
    }
    case 'LIKE_COMMENT': {
      const posts = state.posts.map(p => {
        if (p.id !== action.postId) return p;
        const comments = p.comments.map(c => {
          if (c.id !== action.commentId) return c;
          const likes = c.likes.includes(action.userId)
            ? c.likes.filter(id => id !== action.userId)
            : [...c.likes, action.userId];
          return { ...c, likes };
        });
        return { ...p, comments };
      });
      return { ...state, posts };
    }
    case 'FOLLOW_USER': {
      const users = state.users.map(u => {
        if (u.id === action.currentId) return { ...u, following: [...u.following, action.targetId] };
        if (u.id === action.targetId) return { ...u, followers: [...u.followers, action.currentId] };
        return u;
      });
      const currentUser = state.currentUser?.id === action.currentId
        ? { ...state.currentUser, following: [...state.currentUser.following, action.targetId] }
        : state.currentUser;
      return { ...state, users, currentUser };
    }
    case 'UNFOLLOW_USER': {
      const users = state.users.map(u => {
        if (u.id === action.currentId) return { ...u, following: u.following.filter(id => id !== action.targetId) };
        if (u.id === action.targetId) return { ...u, followers: u.followers.filter(id => id !== action.currentId) };
        return u;
      });
      const currentUser = state.currentUser?.id === action.currentId
        ? { ...state.currentUser, following: state.currentUser.following.filter(id => id !== action.targetId) }
        : state.currentUser;
      return { ...state, users, currentUser };
    }
    case 'CONNECT_USER': {
      const users = state.users.map(u => {
        if (u.id === action.currentId) return { ...u, connections: [...u.connections, action.targetId] };
        if (u.id === action.targetId) return { ...u, connections: [...u.connections, action.currentId] };
        return u;
      });
      const currentUser = state.currentUser?.id === action.currentId
        ? { ...state.currentUser, connections: [...state.currentUser.connections, action.targetId] }
        : state.currentUser;
      return { ...state, users, currentUser };
    }
    case 'DISCONNECT_USER': {
      const users = state.users.map(u => {
        if (u.id === action.currentId) return { ...u, connections: u.connections.filter(id => id !== action.targetId) };
        if (u.id === action.targetId) return { ...u, connections: u.connections.filter(id => id !== action.currentId) };
        return u;
      });
      const currentUser = state.currentUser?.id === action.currentId
        ? { ...state.currentUser, connections: state.currentUser.connections.filter(id => id !== action.targetId) }
        : state.currentUser;
      return { ...state, users, currentUser };
    }
    case 'ADD_COMMUNITY':
      return { ...state, communities: [action.community, ...state.communities] };
    case 'JOIN_COMMUNITY': {
      const communities = state.communities.map(c =>
        c.id === action.communityId ? { ...c, members: [...c.members, action.userId] } : c
      );
      const currentUser = state.currentUser?.id === action.userId
        ? { ...state.currentUser, joinedCommunities: [...state.currentUser.joinedCommunities, action.communityId] }
        : state.currentUser;
      const users = state.users.map(u =>
        u.id === action.userId ? { ...u, joinedCommunities: [...u.joinedCommunities, action.communityId] } : u
      );
      return { ...state, communities, currentUser, users };
    }
    case 'LEAVE_COMMUNITY': {
      const communities = state.communities.map(c =>
        c.id === action.communityId ? { ...c, members: c.members.filter(id => id !== action.userId) } : c
      );
      const currentUser = state.currentUser?.id === action.userId
        ? { ...state.currentUser, joinedCommunities: state.currentUser.joinedCommunities.filter(id => id !== action.communityId) }
        : state.currentUser;
      const users = state.users.map(u =>
        u.id === action.userId ? { ...u, joinedCommunities: u.joinedCommunities.filter(id => id !== action.communityId) } : u
      );
      return { ...state, communities, currentUser, users };
    }
    case 'ADD_DISCUSSION':
      return { ...state, discussions: [action.discussion, ...state.discussions] };
    case 'UPVOTE_DISCUSSION': {
      const discussions = state.discussions.map(d => {
        if (d.id !== action.discussionId) return d;
        const upvotes = d.upvotes.includes(action.userId)
          ? d.upvotes.filter(id => id !== action.userId)
          : [...d.upvotes, action.userId];
        const downvotes = d.downvotes.filter(id => id !== action.userId);
        return { ...d, upvotes, downvotes };
      });
      return { ...state, discussions };
    }
    case 'DOWNVOTE_DISCUSSION': {
      const discussions = state.discussions.map(d => {
        if (d.id !== action.discussionId) return d;
        const downvotes = d.downvotes.includes(action.userId)
          ? d.downvotes.filter(id => id !== action.userId)
          : [...d.downvotes, action.userId];
        const upvotes = d.upvotes.filter(id => id !== action.userId);
        return { ...d, upvotes, downvotes };
      });
      return { ...state, discussions };
    }
    case 'ADD_DISCUSSION_REPLY': {
      const discussions = state.discussions.map(d => {
        if (d.id !== action.discussionId) return d;
        return { ...d, replies: [...d.replies, action.reply] };
      });
      return { ...state, discussions };
    }
    case 'ADD_BLOG':
      return { ...state, blogs: [action.blog, ...state.blogs] };
    case 'LIKE_BLOG': {
      const blogs = state.blogs.map(b => {
        if (b.id !== action.blogId) return b;
        const likes = b.likes.includes(action.userId)
          ? b.likes.filter(id => id !== action.userId)
          : [...b.likes, action.userId];
        return { ...b, likes };
      });
      return { ...state, blogs };
    }
    case 'VOTE_POLL': {
      const polls = state.polls.map(p => {
        if (p.id !== action.pollId) return p;
        const hasVoted = p.options.some(o => o.votes.includes(action.userId));
        if (hasVoted) return p;
        const options = p.options.map(o =>
          o.id === action.optionId ? { ...o, votes: [...o.votes, action.userId] } : o
        );
        return { ...p, options, totalVotes: p.totalVotes + 1 };
      });
      return { ...state, polls };
    }
    case 'ADD_POLL':
      return { ...state, polls: [action.poll, ...state.polls] };
    case 'ADD_EVENT':
      return { ...state, events: [action.event, ...state.events] };
    case 'INTEREST_EVENT': {
      const events = state.events.map(e => {
        if (e.id !== action.eventId) return e;
        const interested = e.interested.includes(action.userId)
          ? e.interested.filter(id => id !== action.userId)
          : [...e.interested, action.userId];
        return { ...e, interested };
      });
      return { ...state, events };
    }
    case 'SEND_MESSAGE': {
      const messages = [...state.messages, action.message];
      const conversations = state.conversations.map(c => {
        if (c.participants.includes(action.message.senderId) && c.participants.includes(action.message.receiverId)) {
          return { ...c, lastMessage: action.message, updatedAt: action.message.createdAt };
        }
        return c;
      });
      const exists = state.conversations.some(c =>
        c.participants.includes(action.message.senderId) && c.participants.includes(action.message.receiverId)
      );
      if (!exists) {
        conversations.push({
          id: `${action.message.senderId}-${action.message.receiverId}`,
          participants: [action.message.senderId, action.message.receiverId],
          lastMessage: action.message,
          updatedAt: action.message.createdAt,
        });
      }
      return { ...state, messages, conversations };
    }
    case 'MARK_MESSAGES_READ': {
      const messages = state.messages.map(m =>
        m.senderId !== action.userId && m.receiverId === action.userId
          ? { ...m, isRead: true }
          : m
      );
      return { ...state, messages };
    }
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.notification, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ': {
      const notifications = state.notifications.map(n =>
        n.id === action.notificationId ? { ...n, isRead: true } : n
      );
      return { ...state, notifications };
    }
    case 'MARK_ALL_NOTIFICATIONS_READ': {
      const notifications = state.notifications.map(n => ({ ...n, isRead: true }));
      return { ...state, notifications };
    }
    case 'ADD_REPORT':
      return { ...state, reports: [action.report, ...state.reports] };
    case 'RESOLVE_REPORT': {
      const reports = state.reports.map(r =>
        r.id === action.reportId ? { ...r, status: 'resolved' as const, resolvedAt: new Date().toISOString() } : r
      );
      return { ...state, reports, moderationLogs: [...state.moderationLogs, action.action] };
    }
    case 'ADD_STORY':
      return { ...state, stories: [action.story, ...state.stories] };
    case 'VIEW_STORY': {
      const stories = state.stories.map(s =>
        s.id === action.storyId && !s.viewers.includes(action.userId)
          ? { ...s, viewers: [...s.viewers, action.userId] }
          : s
      );
      return { ...state, stories };
    }
    case 'REMOVE_STORY': {
      const stories = state.stories.filter(s => s.id !== action.storyId);
      return { ...state, stories };
    }
    case 'ADD_REEL':
      return { ...state, reels: [action.reel, ...state.reels] };
    case 'LIKE_REEL': {
      const reels = state.reels.map(r => {
        if (r.id !== action.reelId) return r;
        const likes = r.likes.includes(action.userId)
          ? r.likes.filter(id => id !== action.userId)
          : [...r.likes, action.userId];
        return { ...r, likes };
      });
      return { ...state, reels };
    }
    case 'SAVE_REEL': {
      const reels = state.reels.map(r => {
        if (r.id !== action.reelId) return r;
        const saves = r.saves.includes(action.userId)
          ? r.saves.filter(id => id !== action.userId)
          : [...r.saves, action.userId];
        return { ...r, saves };
      });
      return { ...state, reels };
    }
    case 'VIEW_REEL': {
      const reels = state.reels.map(r =>
        r.id === action.reelId ? { ...r, views: r.views + 1 } : r
      );
      return { ...state, reels };
    }
    case 'REMOVE_POST': {
      const posts = state.posts.filter(p => p.id !== action.postId);
      return { ...state, posts };
    }
    case 'REMOVE_DISCUSSION': {
      const discussions = state.discussions.filter(d => d.id !== action.discussionId);
      return { ...state, discussions };
    }
    case 'SUSPEND_USER': {
      const users = state.users.map(u =>
        u.id === action.userId ? { ...u, bio: '[SUSPENDED] ' + (u.bio || '') } : u
      );
      return { ...state, users };
    }
    case 'SET_ACTIVE_PAGE':
      return { ...state, activePage: action.page };
    case 'SET_CREATE_MODAL':
      return { ...state, createModalOpen: action.open, createModalType: action.createType ?? null };
    case 'SET_STORY_VIEWER':
      return { ...state, storyViewerOpen: action.open, storyViewerAuthorId: action.authorId ?? null };
    case 'LOAD_DEV_SEED': {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const devSeed = require('../data/dev-seed');
      return {
        ...state,
        users: [...state.users, ...devSeed.DEV_SEED_USERS],
        posts: [...state.posts, ...devSeed.DEV_SEED_POSTS],
        discussions: [...state.discussions, ...devSeed.DEV_SEED_DISCUSSIONS],
        blogs: [...state.blogs, ...devSeed.DEV_SEED_BLOGS],
        polls: [...state.polls, ...devSeed.DEV_SEED_POLLS],
        communities: [...state.communities, ...devSeed.DEV_SEED_COMMUNITIES],
        clubs: [...state.clubs, ...devSeed.DEV_SEED_CLUBS],
        events: [...state.events, ...devSeed.DEV_SEED_EVENTS],
        messages: [...state.messages, ...devSeed.DEV_SEED_MESSAGES],
        conversations: [...state.conversations, ...devSeed.DEV_SEED_CONVERSATIONS],
        notifications: [...state.notifications, ...devSeed.DEV_SEED_NOTIFICATIONS],
        videos: [...state.videos, ...devSeed.DEV_SEED_VIDEOS],
        stories: [...(state.stories || []), ...(devSeed.DEV_SEED_STORIES || [])],
        reels: [...(state.reels || []), ...(devSeed.DEV_SEED_REELS || [])],
        trendingTopics: [...state.trendingTopics, ...devSeed.DEV_SEED_TRENDING],
      };
    }
    case 'RESET_STATE':
      return getDefaultState();
    default:
      return state;
  }
}

interface StoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string) => boolean;
  logout: () => void;
  completeOnboarding: (profile: Partial<User>) => void;
  toggleLikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  toggleFollow: (userId: string) => void;
  toggleConnect: (userId: string) => void;
  toggleJoinCommunity: (communityId: string) => void;
  toggleVotePoll: (pollId: string, optionId: string) => void;
  toggleInterestEvent: (eventId: string) => void;
  sendMessage: (receiverId: string, content: string) => void;
  createPost: (post: Omit<Post, 'id' | 'createdAt' | 'engagementScore'>) => void;
  createDiscussion: (discussion: Omit<Discussion, 'id' | 'createdAt' | 'viewCount'>) => void;
  addComment: (postId: string, content: string) => void;
  likeComment: (postId: string, commentId: string) => void;
  addDiscussionReply: (discussionId: string, content: string) => void;
  upvoteDiscussion: (discussionId: string) => void;
  downvoteDiscussion: (discussionId: string) => void;
  reportContent: (targetId: string, targetType: string, reason: string, description?: string) => void;
  removePost: (postId: string) => void;
  removeDiscussion: (discussionId: string) => void;
  createCommunity: (community: Omit<Community, 'id' | 'createdAt' | 'members' | 'posts'>) => void;
  createStory: (content: string, imageUrl?: string, videoUrl?: string, backgroundColor?: string) => void;
  viewStory: (storyId: string) => void;
  createReel: (videoUrl: string, caption: string, hashtags?: string[], duration?: number) => void;
  likeReel: (reelId: string) => void;
  saveReel: (reelId: string) => void;
  getUser: (userId: string) => User | undefined;
  loadDevSeed: () => void;
  resetAllData: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const login = useCallback((email: string, _password: string): boolean => {
    const existingUser = state.users.find(u => u.email === email);
    if (existingUser) {
      dispatch({ type: 'SET_USER', user: existingUser });
      dispatch({ type: 'SET_ONBOARDED', value: true });
      return true;
    }
    const newUser: User = {
      id: 'u_' + Date.now(),
      name: email.split('@')[0],
      username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
      email,
      avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${Date.now()}&backgroundColor=0a0a0a`,
      university: 'IIIT Pune',
      branch: 'CSE',
      academicYear: '1st Year',
      graduationYear: 2029,
      interests: [],
      skills: [],
      status: 'NOVA',
      isVerified: true,
      isClub: false,
      followers: [],
      following: [],
      connections: [],
      joinedCommunities: [],
      lookingFor: [],
      createdAt: new Date().toISOString().split('T')[0],
      isOnline: true,
      lastSeen: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'SET_USER', user: newUser });
    dispatch({ type: 'UPDATE_USER', userId: newUser.id, updates: newUser });
    // Send login alert email for existing user login
    emailNotifications.loginAlert(newUser.email, newUser.name, {
      device: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    });
    return true;
  }, [state.users]);

  const register = useCallback((email: string, _password: string): boolean => {
    const newUser: User = {
      id: 'u_' + Date.now(),
      name: email.split('@')[0],
      username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
      email,
      avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${Date.now()}&backgroundColor=0a0a0a`,
      university: 'IIIT Pune',
      branch: 'CSE',
      academicYear: '1st Year',
      graduationYear: 2029,
      interests: [],
      skills: [],
      status: 'NOVA',
      isVerified: true,
      isClub: false,
      followers: [],
      following: [],
      connections: [],
      joinedCommunities: [],
      lookingFor: [],
      createdAt: new Date().toISOString().split('T')[0],
      isOnline: true,
      lastSeen: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'SET_USER', user: newUser });
    dispatch({ type: 'UPDATE_USER', userId: newUser.id, updates: newUser });
    // Send welcome email for new account
    emailNotifications.accountCreated(newUser.email, newUser.name);
    return true;
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'SET_USER', user: null });
    dispatch({ type: 'SET_ONBOARDED', value: false });
  }, []);

  const completeOnboarding = useCallback((profile: Partial<User>) => {
    if (!state.currentUser) return;
    const updates: Partial<User> = {
      name: profile.name || state.currentUser.name,
      branch: profile.branch || state.currentUser.branch,
      academicYear: profile.academicYear || state.currentUser.academicYear,
      graduationYear: profile.graduationYear || state.currentUser.graduationYear,
      interests: profile.interests || state.currentUser.interests,
      isVerified: true,
    };
    dispatch({ type: 'UPDATE_USER', userId: state.currentUser.id, updates });
    dispatch({ type: 'SET_ONBOARDED', value: true });
  }, [state.currentUser]);

  const toggleLikePost = useCallback((postId: string) => {
    if (!state.currentUser) return;
    dispatch({ type: 'LIKE_POST', postId, userId: state.currentUser.id });
  }, [state.currentUser]);

  const toggleSavePost = useCallback((postId: string) => {
    if (!state.currentUser) return;
    dispatch({ type: 'SAVE_POST', postId, userId: state.currentUser.id });
  }, [state.currentUser]);

  const toggleFollow = useCallback((userId: string) => {
    if (!state.currentUser) return;
    const isFollowing = state.currentUser.following.includes(userId);
    if (isFollowing) {
      dispatch({ type: 'UNFOLLOW_USER', targetId: userId, currentId: state.currentUser.id });
    } else {
      dispatch({ type: 'FOLLOW_USER', targetId: userId, currentId: state.currentUser.id });
      dispatch({
        type: 'ADD_NOTIFICATION',
        notification: {
          id: 'n_' + Date.now(),
          type: 'follow',
          actorId: state.currentUser.id,
          targetId: userId,
          targetType: 'user',
          content: `${state.currentUser.name} started following you`,
          isRead: false,
          createdAt: new Date().toISOString(),
        }
      });
    }
  }, [state.currentUser]);

  const toggleConnect = useCallback((userId: string) => {
    if (!state.currentUser) return;
    const isConnected = state.currentUser.connections.includes(userId);
    if (isConnected) {
      dispatch({ type: 'DISCONNECT_USER', targetId: userId, currentId: state.currentUser.id });
    } else {
      dispatch({ type: 'CONNECT_USER', targetId: userId, currentId: state.currentUser.id });
    }
  }, [state.currentUser]);

  const toggleJoinCommunity = useCallback((communityId: string) => {
    if (!state.currentUser) return;
    const isMember = state.currentUser.joinedCommunities.includes(communityId);
    if (isMember) {
      dispatch({ type: 'LEAVE_COMMUNITY', communityId, userId: state.currentUser.id });
    } else {
      dispatch({ type: 'JOIN_COMMUNITY', communityId, userId: state.currentUser.id });
    }
  }, [state.currentUser]);

  const toggleVotePoll = useCallback((pollId: string, optionId: string) => {
    if (!state.currentUser) return;
    dispatch({ type: 'VOTE_POLL', pollId, optionId, userId: state.currentUser.id });
  }, [state.currentUser]);

  const toggleInterestEvent = useCallback((eventId: string) => {
    if (!state.currentUser) return;
    dispatch({ type: 'INTEREST_EVENT', eventId, userId: state.currentUser.id });
  }, [state.currentUser]);

  const sendMessage = useCallback((receiverId: string, content: string) => {
    if (!state.currentUser) return;
    const message: Message = {
      id: 'm_' + Date.now(),
      senderId: state.currentUser.id,
      receiverId,
      content,
      type: 'text',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'SEND_MESSAGE', message });
  }, [state.currentUser]);

  const createPost = useCallback((post: Omit<Post, 'id' | 'createdAt' | 'engagementScore'>) => {
    const newPost: Post = {
      ...post,
      id: 'p_' + Date.now(),
      createdAt: new Date().toISOString(),
      engagementScore: 1,
    };
    dispatch({ type: 'ADD_POST', post: newPost });
    dispatch({ type: 'SET_CREATE_MODAL', open: false });
  }, []);

  const createDiscussion = useCallback((discussion: Omit<Discussion, 'id' | 'createdAt' | 'viewCount'>) => {
    const newDiscussion: Discussion = {
      ...discussion,
      id: 'd_' + Date.now(),
      createdAt: new Date().toISOString(),
      viewCount: 0,
    };
    dispatch({ type: 'ADD_DISCUSSION', discussion: newDiscussion });
    dispatch({ type: 'SET_CREATE_MODAL', open: false });
  }, []);

  const addComment = useCallback((postId: string, content: string) => {
    if (!state.currentUser) return;
    const comment: Comment = {
      id: 'cmt_' + Date.now(),
      authorId: state.currentUser.id,
      content,
      likes: [],
      replies: [],
      createdAt: new Date().toISOString(),
      isAnonymous: false,
    };
    dispatch({ type: 'ADD_COMMENT', postId, comment });
  }, [state.currentUser]);

  const likeComment = useCallback((postId: string, commentId: string) => {
    if (!state.currentUser) return;
    dispatch({ type: 'LIKE_COMMENT', postId, commentId, userId: state.currentUser.id });
  }, [state.currentUser]);

  const addDiscussionReply = useCallback((discussionId: string, content: string) => {
    if (!state.currentUser) return;
    const reply: DiscussionReply = {
      id: 'dr_' + Date.now(),
      authorId: state.currentUser.id,
      content,
      upvotes: [],
      downvotes: [],
      replies: [],
      createdAt: new Date().toISOString(),
      isAnonymous: false,
    };
    dispatch({ type: 'ADD_DISCUSSION_REPLY', discussionId, reply });
  }, [state.currentUser]);

  const upvoteDiscussion = useCallback((discussionId: string) => {
    if (!state.currentUser) return;
    dispatch({ type: 'UPVOTE_DISCUSSION', discussionId, userId: state.currentUser.id });
  }, [state.currentUser]);

  const downvoteDiscussion = useCallback((discussionId: string) => {
    if (!state.currentUser) return;
    dispatch({ type: 'DOWNVOTE_DISCUSSION', discussionId, userId: state.currentUser.id });
  }, [state.currentUser]);

  const removePost = useCallback((postId: string) => {
    dispatch({ type: 'REMOVE_POST', postId });
  }, []);

  const removeDiscussion = useCallback((discussionId: string) => {
    dispatch({ type: 'REMOVE_DISCUSSION', discussionId });
  }, []);

  const createStory = useCallback((content: string, imageUrl?: string, videoUrl?: string, backgroundColor?: string) => {
    if (!state.currentUser) return;
    const story: Story = {
      id: 'st_' + Date.now(),
      authorId: state.currentUser.id,
      content,
      imageUrl,
      videoUrl,
      backgroundColor: backgroundColor || '#e50914',
      viewers: [],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    dispatch({ type: 'ADD_STORY', story });
  }, [state.currentUser]);

  const viewStory = useCallback((storyId: string) => {
    if (!state.currentUser) return;
    dispatch({ type: 'VIEW_STORY', storyId, userId: state.currentUser.id });
  }, [state.currentUser]);

  const createReel = useCallback((videoUrl: string, caption: string, hashtags?: string[], duration?: number) => {
    if (!state.currentUser) return;
    const reel: Reel = {
      id: 'reel_' + Date.now(),
      authorId: state.currentUser.id,
      videoUrl,
      caption,
      hashtags: hashtags || [],
      duration: duration || 15,
      likes: [],
      comments: [],
      shares: 0,
      saves: [],
      views: 0,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_REEL', reel });
    dispatch({ type: 'SET_CREATE_MODAL', open: false });
  }, [state.currentUser]);

  const likeReel = useCallback((reelId: string) => {
    if (!state.currentUser) return;
    dispatch({ type: 'LIKE_REEL', reelId, userId: state.currentUser.id });
  }, [state.currentUser]);

  const saveReel = useCallback((reelId: string) => {
    if (!state.currentUser) return;
    dispatch({ type: 'SAVE_REEL', reelId, userId: state.currentUser.id });
  }, [state.currentUser]);

  const createCommunity = useCallback((community: Omit<Community, 'id' | 'createdAt' | 'members' | 'posts'>) => {
    if (!state.currentUser) return;
    const newCommunity: Community = {
      ...community,
      id: 'com_' + Date.now(),
      members: [state.currentUser.id],
      posts: [],
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_COMMUNITY', community: newCommunity });
    dispatch({ type: 'JOIN_COMMUNITY', communityId: newCommunity.id, userId: state.currentUser.id });
  }, [state.currentUser]);

  const reportContent = useCallback((targetId: string, targetType: string, reason: string, description?: string) => {
    if (!state.currentUser) return;
    const report: Report = {
      id: 'r_' + Date.now(),
      reporterId: state.currentUser.id,
      targetId,
      targetType,
      reason: reason as Report['reason'],
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_REPORT', report });
  }, [state.currentUser]);

  const getUser = useCallback((userId: string): User | undefined => {
    return state.users.find(u => u.id === userId);
  }, [state.users]);

  const loadDevSeed = useCallback(() => {
    dispatch({ type: 'LOAD_DEV_SEED' });
  }, []);

  const resetAllData = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: StoreContextValue = {
    state,
    dispatch,
    login,
    register,
    logout,
    completeOnboarding,
    toggleLikePost,
    toggleSavePost,
    toggleFollow,
    toggleConnect,
    toggleJoinCommunity,
    toggleVotePoll,
    toggleInterestEvent,
    sendMessage,
    createPost,
    createDiscussion,
    addComment,
    likeComment,
    addDiscussionReply,
    upvoteDiscussion,
    downvoteDiscussion,
    reportContent,
    removePost,
    removeDiscussion,
    createCommunity,
    createStory,
    viewStory,
    createReel,
    likeReel,
    saveReel,
    getUser,
    loadDevSeed,
    resetAllData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
