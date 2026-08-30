'use client';

import { useStore } from '../../../store/store';
import { useState } from 'react';
import PostCard from '../../../components/feed/PostCard';
import EmptyState from '../../../components/ui/EmptyState';
import StoriesBar from '../../../components/stories/StoriesBar';
import CreateStoryModal from '../../../components/stories/CreateStoryModal';

type FeedTab = 'foryou' | 'following' | 'campus';

export default function HomePage() {
  const { state, dispatch } = useStore();
  const [activeTab, setActiveTab] = useState<FeedTab>('foryou');
  const [showCreateStory, setShowCreateStory] = useState(false);

  if (!state.currentUser) return null;

  const firstName = state.currentUser.name?.split(' ')[0] || 'Student';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFilteredPosts = () => {
    switch (activeTab) {
      case 'following':
        return state.posts.filter(p =>
          state.currentUser?.following.includes(p.authorId) ||
          (p.communityId && state.currentUser?.joinedCommunities.includes(p.communityId))
        );
      case 'campus':
        return state.posts;
      case 'foryou':
      default:
        return [...state.posts].sort((a, b) => b.engagementScore - a.engagementScore);
    }
  };

  // Filter out posts whose authors no longer exist
  const filteredPosts = getFilteredPosts().filter(p => state.users.some(u => u.id === p.authorId));

  const tabs: { id: FeedTab; label: string }[] = [
    { id: 'foryou', label: 'For You' },
    { id: 'following', label: 'Following' },
    { id: 'campus', label: 'Campus' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-[#1a1a1a]">
        <div className="hidden lg:block px-5 pt-5 pb-3">
          <h1 className="text-2xl font-bold">
            {getGreeting()}, <span className="text-[#e50914]">{firstName}</span>
          </h1>
          <p className="text-[#666] text-sm mt-0.5">What&apos;s happening at IIIT Pune?</p>
        </div>
        <div className="flex px-5 gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-[#666] hover:text-[#a0a0a0]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#e50914] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stories bar */}
      <div className="border-b border-[#1a1a1a]">
        <StoriesBar onCreateStory={() => setShowCreateStory(true)} />
      </div>

      {/* Create prompt for new users */}
      {state.posts.length === 0 && (
        <div className="px-4 pt-4">
          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5 mb-4">
            <p className="text-white text-sm font-medium mb-2">
              Welcome to IIITSocial! 👋
            </p>
            <p className="text-[#666] text-xs mb-4">
              Your IIIT network is just getting started. Share your first post to kick things off!
            </p>
            <button
              onClick={() => dispatch({ type: 'SET_CREATE_MODAL', open: true, createType: 'post' })}
              className="px-4 py-2 bg-[#e50914] hover:bg-[#ff1a25] text-white text-xs font-semibold rounded-lg transition-all active:scale-95"
            >
              Create your first post
            </button>
          </div>
        </div>
      )}

      {/* Feed */}
      <div>
        {filteredPosts.length === 0 ? (
          <EmptyState
            icon={activeTab === 'following' ? '👥' : '📝'}
            title={activeTab === 'following'
              ? "Your feed is empty"
              : "Nothing here yet"}
            description={activeTab === 'following'
              ? "Follow some students to see their posts here."
              : activeTab === 'campus'
                ? "No campus posts yet. Be the first to share something!"
                : "Your IIIT network is just getting started."}
            action={state.posts.length === 0 ? {
              label: 'Create a post',
              onClick: () => dispatch({ type: 'SET_CREATE_MODAL', open: true, createType: 'post' })
            } : undefined}
          />
        ) : (
          filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
      {/* Create Story Modal */}
      {showCreateStory && <CreateStoryModal onClose={() => setShowCreateStory(false)} />}
    </div>
  );
}
