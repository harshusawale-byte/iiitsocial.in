'use client';

import { useStore } from '../../../store/store';
import { useState } from 'react';
import EmptyState from '../../../components/ui/EmptyState';
import ClickableAvatar from '../../../components/ui/ClickableAvatar';

export default function ExplorePage() {
  const { state } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const trendingTopics = state.trendingTopics;
  const trendingPosts = [...state.posts].sort((a, b) => b.engagementScore - a.engagementScore).slice(0, 6);
  const popularCommunities = [...state.communities].sort((a, b) => b.members.length - a.members.length).slice(0, 6);
  const trendingDiscussions = [...state.discussions].sort((a, b) => b.upvotes.length - a.upvotes.length).slice(0, 4);

  const formatNumber = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n.toString();

  const filteredPosts = searchQuery
    ? state.posts.filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const hasContent = state.posts.length > 0 || state.discussions.length > 0 || state.communities.length > 0;

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-[#1a1a1a] px-4 py-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts, people, communities..."
            className="w-full bg-[#141414] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {searchQuery && (
        <div className="px-4 py-3">
          <h3 className="text-white text-sm font-semibold mb-3">
            {filteredPosts.length} results for &quot;{searchQuery}&quot;
          </h3>
          {filteredPosts.length === 0 && (
            <p className="text-[#666] text-sm">No results found</p>
          )}
        </div>
      )}

      {!searchQuery && !hasContent && (
        <EmptyState
          icon="🔍"
          title="Nothing is trending yet"
          description="When students start posting, trending topics and popular content will appear here."
        />
      )}

      {!searchQuery && hasContent && (
        <>
          {trendingTopics.length > 0 && (
            <section className="px-4 pt-5 pb-2">
              <h2 className="text-white text-lg font-bold mb-3">🔥 Trending at IIIT Pune</h2>
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map(topic => (
                  <div key={topic.id} className="bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 hover:border-[#444] transition-colors cursor-pointer">
                    <div className="text-white text-sm font-medium">{topic.tag}</div>
                    <div className="text-[#666] text-xs">{topic.postCount} posts · {formatNumber(topic.engagementScore)} engagement</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {trendingPosts.length > 0 && (
            <section className="mt-4">
              <div className="px-4 mb-3"><h2 className="text-white text-lg font-bold">🔥 Trending Now</h2></div>
              <div className="scroll-row px-4">
                {trendingPosts.map(post => {
                  const author = state.users.find(u => u.id === post.authorId);
                  if (!author) return null;
                  return (
                    <div key={post.id} className="w-[300px] flex-shrink-0 bg-[#141414] border border-[#262626] rounded-xl overflow-hidden card-hover">
                      {post.images?.[0] && <img src={post.images[0]} alt="" className="w-full h-[160px] object-cover" />}
                      {!post.images?.[0] && (
                        <div className="w-full h-[160px] bg-gradient-to-br from-[#e50914]/10 to-[#1a1a1a] flex items-center justify-center">
                          <span className="text-4xl">🔥</span>
                        </div>
                      )}
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <ClickableAvatar src={author.avatar} alt={author.name} className="w-6 h-6 rounded-full bg-[#1a1a1a]" />
                          <span className="text-[#a0a0a0] text-xs">{author.name}</span>
                        </div>
                        <p className="text-white text-sm line-clamp-2">{post.content.slice(0, 120)}</p>
                        <div className="flex items-center gap-3 mt-2 text-[#666] text-xs">
                          <span>❤️ {post.likes.length}</span>
                          <span>💬 {post.comments.length}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {popularCommunities.length > 0 && (
            <section className="mt-6">
              <div className="px-4 mb-3"><h2 className="text-white text-lg font-bold">👥 Popular Communities</h2></div>
              <div className="scroll-row px-4">
                {popularCommunities.map(community => (
                  <div key={community.id} className="w-[200px] flex-shrink-0 bg-[#141414] border border-[#262626] rounded-xl p-4 card-hover text-center">
                    <div className="text-3xl mb-2">{community.icon}</div>
                    <h3 className="text-white text-sm font-semibold">{community.name}</h3>
                    <p className="text-[#666] text-xs mt-1">{community.members.length} members</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {trendingDiscussions.length > 0 && (
            <section className="mt-6 px-4">
              <h2 className="text-white text-lg font-bold mb-3">🗣️ Active Discussions</h2>
              <div className="space-y-2">
                {trendingDiscussions.map(disc => (
                  <div key={disc.id} className="bg-[#141414] border border-[#262626] rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col items-center gap-0.5 pt-1">
                        <span className="text-[#a0a0a0] text-xs font-bold">{disc.upvotes.length}</span>
                        <span className="text-[#666] text-[10px]">votes</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-sm font-semibold">{disc.title}</h3>
                        <div className="text-[#666] text-xs mt-1">{disc.replies.length} replies · {disc.viewCount} views</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
