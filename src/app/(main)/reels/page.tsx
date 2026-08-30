'use client';

import { useStore } from '../../../store/store';
import { useState, useEffect, useRef } from 'react';
import EmptyState from '../../../components/ui/EmptyState';
import ClickableAvatar from '../../../components/ui/ClickableAvatar';

export default function ReelsPage() {
  const { state, likeReel, saveReel, toggleFollow, dispatch } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!state.currentUser) return null;

  // Filter out expired stories, get reels sorted by newest first
  const activeReels = [...state.reels].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const currentReel = activeReels[currentIndex];
  const currentAuthor = currentReel ? state.users.find(u => u.id === currentReel.authorId) : null;

  // View tracking
  useEffect(() => {
    if (currentReel) {
      const timer = setTimeout(() => {
        dispatch({ type: 'VIEW_REEL', reelId: currentReel.id });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentReel, dispatch]);

  // Scroll to next/prev reel
  const goNext = () => {
    if (currentIndex < activeReels.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') goNext();
      if (e.key === 'ArrowUp' || e.key === 'k') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  // Touch swipe
  const touchStart = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStart.current - e.changedTouches[0].clientY;
    if (delta > 50) goNext();
    if (delta < -50) goPrev();
  };

  if (activeReels.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-[#1a1a1a]">
          <div className="px-5 pt-5 pb-3">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-[#e50914]">🎬</span> Reels
            </h1>
            <p className="text-[#666] text-sm mt-0.5">15-second short videos from your campus</p>
          </div>
        </div>
        <EmptyState
          icon="🎬"
          title="No reels yet"
          description="Be the first to share a 15-second reel with IIIT Pune!"
          action={{
            label: 'Create a reel',
            onClick: () => dispatch({ type: 'SET_CREATE_MODAL', open: true, createType: 'reel' })
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="px-5 pt-5 pb-8 pointer-events-auto">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-[#e50914]">🎬</span> Reels
          </h1>
        </div>
      </div>

      {/* Reel viewer */}
      <div
        ref={containerRef}
        className="h-screen snap-y snap-mandatory overflow-y-scroll"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {activeReels.map((reel, index) => {
          const author = state.users.find(u => u.id === reel.authorId);
          const isLiked = reel.likes.includes(state.currentUser!.id);
          const isSaved = reel.saves.includes(state.currentUser!.id);
          const isFollowing = state.currentUser!.following.includes(reel.authorId);
          const isOwn = reel.authorId === state.currentUser!.id;

          return (
            <div
              key={reel.id}
              className="h-screen snap-start flex items-center justify-center relative"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Video background (simulated with gradient since we use base64 or placeholder) */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
                {reel.videoUrl && reel.videoUrl.startsWith('data:') ? (
                  <video
                    src={reel.videoUrl}
                    className="w-full h-full object-cover"
                    autoPlay={index === currentIndex}
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-6xl block mb-4">🎬</span>
                      <p className="text-[#555] text-sm">15s Reel</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

              {/* Reel info - bottom left */}
              <div className="absolute bottom-24 left-4 right-20 z-10">
                <div className="flex items-center gap-3 mb-3">
                  <ClickableAvatar src={author?.avatar || ''} alt={author?.name || ''} className="w-10 h-10 rounded-full border-2 border-white" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">{author?.name || 'User'}</span>
                      {author?.isVerified && (
                        <span className="text-[#e50914] text-xs">✓</span>
                      )}
                    </div>
                    <span className="text-[#aaa] text-xs">{reel.duration}s · {reel.views} views</span>
                  </div>
                  {!isOwn && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFollow(reel.authorId); }}
                      className={`ml-2 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isFollowing
                          ? 'bg-[#333] text-white'
                          : 'bg-white text-black hover:bg-gray-200'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
                <p className="text-white text-sm mb-1">{reel.caption}</p>
                {reel.hashtags && reel.hashtags.length > 0 && (
                  <p className="text-[#e50914] text-xs">
                    {reel.hashtags.map(h => `#${h}`).join(' ')}
                  </p>
                )}
              </div>

              {/* Action buttons - right side */}
              <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
                {/* Like */}
                <button
                  onClick={(e) => { e.stopPropagation(); likeReel(reel.id); }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isLiked ? 'bg-[#e50914]/20' : 'bg-white/10'
                  }`}>
                    <svg className={`w-6 h-6 ${isLiked ? 'text-[#e50914] fill-[#e50914]' : 'text-white'}`} viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </div>
                  <span className="text-white text-xs font-medium">{reel.likes.length}</span>
                </button>

                {/* Save */}
                <button
                  onClick={(e) => { e.stopPropagation(); saveReel(reel.id); }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isSaved ? 'bg-yellow-500/20' : 'bg-white/10'
                  }`}>
                    <svg className={`w-6 h-6 ${isSaved ? 'text-yellow-500 fill-yellow-500' : 'text-white'}`} viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                  </div>
                  <span className="text-white text-xs font-medium">{reel.saves.length}</span>
                </button>

                {/* Comments count */}
                <button className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                    </svg>
                  </div>
                  <span className="text-white text-xs font-medium">{reel.comments.length}</span>
                </button>

                {/* Share */}
                <button className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                    </svg>
                  </div>
                  <span className="text-white text-xs font-medium">{reel.shares}</span>
                </button>
              </div>

              {/* Navigation hints */}
              {index > 0 && (
                <button
                  onClick={goPrev}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+60px)] z-10 text-white/30 hover:text-white/60 transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </button>
              )}
              {index < activeReels.length - 1 && (
                <button
                  onClick={goNext}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[calc(50%+20px)] z-10 text-white/30 hover:text-white/60 transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
