'use client';

import { useStore } from '../../../store/store';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PostCard from '../../../components/feed/PostCard';
import EditProfileModal from '../../../components/modals/EditProfileModal';
import ClickableAvatar from '../../../components/ui/ClickableAvatar';

type ProfileTab = 'posts' | 'discuss' | 'blogs' | 'communities';

export default function ProfilePage() {
  const { state, logout, toggleFollow, toggleConnect, sendMessage } = useStore();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const searchParams = useSearchParams();
  const viewedUserId = searchParams.get('userId');

  if (!state.currentUser) return null;

  // Determine which user to show
  const user = viewedUserId
    ? state.users.find(u => u.id === viewedUserId) || state.currentUser
    : state.currentUser;
  const isOwnProfile = user.id === state.currentUser.id;
  const isFollowing = state.currentUser.following.includes(user.id);
  const isConnected = state.currentUser.connections.includes(user.id);

  const userPosts = state.posts.filter(p => p.authorId === user.id);
  const userDiscussions = state.discussions.filter(d => d.authorId === user.id);
  const userBlogs = state.blogs.filter(b => b.authorId === user.id);
  const userCommunities = state.communities.filter(c => user.joinedCommunities.includes(c.id));

  const statusColors: Record<string, string> = {
    NOVA: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
    CORE: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
    PRIME: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
    LEGACY: 'from-red-500/20 to-red-600/5 border-red-500/30',
  };

  const statusLabels: Record<string, string> = {
    NOVA: 'New member · Growing presence',
    CORE: 'Active contributor · Trusted member',
    PRIME: 'Top contributor · Community leader',
    LEGACY: 'Platform veteran · Respected elder',
  };

  const tabs: { id: ProfileTab; label: string; count: number }[] = [
    { id: 'posts', label: 'Posts', count: userPosts.length },
    { id: 'discuss', label: 'Discussions', count: userDiscussions.length },
    { id: 'blogs', label: 'Blogs', count: userBlogs.length },
    { id: 'communities', label: 'Communities', count: userCommunities.length },
  ];

  return (
    <div className="min-h-screen">
      {/* Cover image */}
      <div className="h-32 md:h-44 bg-gradient-to-br from-[#e50914]/20 via-[#141414] to-[#0a0a0a] relative">
        {user.coverImage && (
          <img src={user.coverImage} alt="" className="w-full h-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </div>

      {/* Profile info */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="flex items-end gap-4 mb-4">
          <ClickableAvatar
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-[#0a0a0a] bg-[#1a1a1a]"
            userId={user.id}
            showStoryRing
          />
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-1.5">
              {user.name}
              {user.isVerified && (
                <svg className="w-5 h-5 text-[#e50914]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0c.49.401 1.003.703 1.545.857a3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </h1>
            <p className="text-[#666] text-sm">@{user.username}</p>
          </div>
        </div>

        <div className="text-[#a0a0a0] text-sm mb-1 flex items-center gap-2">
          <span>✓ IIIT Pune</span>
          <span>·</span>
          <span>{user.branch} · {user.academicYear}</span>
          <span>·</span>
          <span>Class of {user.graduationYear}</span>
        </div>

        {user.bio && <p className="text-[#a0a0a0] text-sm mt-2 mb-3">{user.bio}</p>}

        {/* Stats */}
        <div className="flex gap-6 mt-3 mb-4">
          <div className="text-center">
            <div className="text-white font-bold text-lg">{user.followers.length}</div>
            <div className="text-[#666] text-xs">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-lg">{user.following.length}</div>
            <div className="text-[#666] text-xs">Following</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-lg">{user.connections.length}</div>
            <div className="text-[#666] text-xs">Connections</div>
          </div>
        </div>

        {/* Platform Status */}
        <div className={`bg-gradient-to-r ${statusColors[user.status]} border rounded-xl p-3 mb-4`}>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">◆ {user.status}</span>
            <span className="text-[#a0a0a0] text-xs">·</span>
            <span className="text-[#a0a0a0] text-xs">{statusLabels[user.status]}</span>
          </div>
        </div>

        {/* Interests */}
        {user.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {user.interests.map(interest => (
              <span key={interest} className="text-xs px-2.5 py-1 bg-[#141414] border border-[#262626] text-[#a0a0a0] rounded-full">
                {interest}
              </span>
            ))}
          </div>
        )}

        {/* Looking For */}
        {user.lookingFor.length > 0 && (
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-3 mb-4">
            <h3 className="text-white text-xs font-semibold mb-2">🔎 Looking For</h3>
            <div className="flex flex-wrap gap-1.5">
              {user.lookingFor.map(item => (
                <span key={item} className="text-[10px] px-2 py-1 bg-[#e50914]/10 text-[#e50914] rounded-full font-medium">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mb-4">
          {isOwnProfile ? (
            <>
              <button
                onClick={() => setShowEditProfile(true)}
                className="flex-1 px-4 py-2 border border-[#262626] text-[#a0a0a0] text-xs rounded-lg hover:text-white hover:border-white transition-colors"
              >
                ✏️ Edit Profile
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 border border-[#262626] text-[#666] text-xs rounded-lg hover:text-[#e50914] hover:border-[#e50914] transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => toggleFollow(user.id)}
                className={`flex-1 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  isFollowing
                    ? 'bg-[#262626] text-white border border-[#333]'
                    : 'bg-[#e50914] text-white hover:bg-[#ff1a25]'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button
                onClick={() => toggleConnect(user.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  isConnected
                    ? 'border-[#333] text-white bg-[#262626]'
                    : 'border-[#262626] text-[#a0a0a0] hover:text-white hover:border-white'
                }`}
              >
                {isConnected ? 'Connected' : 'Connect'}
              </button>
              <button
                onClick={() => {
                  // Navigate to messages with this user
                  const conv = state.conversations.find(c =>
                    c.participants.includes(state.currentUser!.id) && c.participants.includes(user.id)
                  );
                  if (conv) {
                    window.location.href = '/messages';
                  } else {
                    sendMessage(user.id, '');
                    window.location.href = '/messages';
                  }
                }}
                className="px-4 py-2 border border-[#262626] text-[#a0a0a0] text-xs rounded-lg hover:text-white hover:border-white transition-colors"
              >
                💬
              </button>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1a1a1a] gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'text-white' : 'text-[#666] hover:text-[#a0a0a0]'
              }`}
            >
              {tab.label} ({tab.count})
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#e50914] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-2">
        {activeTab === 'posts' && userPosts.map(post => <PostCard key={post.id} post={post} />)}
        {activeTab === 'discuss' && userDiscussions.map(disc => (
          <div key={disc.id} className="px-4 py-3 border-b border-[#1a1a1a]">
            <h3 className="text-white text-sm font-semibold">{disc.title}</h3>
            <p className="text-[#666] text-xs mt-1 line-clamp-2">{disc.content.slice(0, 150)}</p>
            <div className="flex gap-3 mt-2 text-[#444] text-xs">
              <span>▲ {disc.upvotes.length}</span>
              <span>💬 {disc.replies.length}</span>
              <span>👁 {disc.viewCount}</span>
            </div>
          </div>
        ))}
        {activeTab === 'blogs' && userBlogs.map(blog => (
          <div key={blog.id} className="px-4 py-3 border-b border-[#1a1a1a]">
            <h3 className="text-white text-sm font-semibold">{blog.title}</h3>
            <div className="flex gap-3 mt-1 text-[#666] text-xs">
              <span>{blog.readingTime} min read</span>
              <span>❤️ {blog.likes.length}</span>
            </div>
          </div>
        ))}
        {activeTab === 'communities' && (
          <div className="px-4 py-3 space-y-2">
            {userCommunities.map(community => (
              <div key={community.id} className="flex items-center gap-3 p-3 bg-[#141414] border border-[#262626] rounded-xl">
                <span className="text-2xl">{community.icon}</span>
                <div>
                  <span className="text-white text-sm font-medium">{community.name}</span>
                  <span className="text-[#666] text-xs block">{community.members.length} members</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Edit Profile Modal */}
      {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}
    </div>
  );
}
