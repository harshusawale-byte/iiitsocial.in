'use client';

import { useStore } from '../../store/store';
import { useState } from 'react';
import type { Story } from '../../types';

interface StoriesBarProps {
  onCreateStory: () => void;
}

export default function StoriesBar({ onCreateStory }: StoriesBarProps) {
  const { state, dispatch } = useStore();

  if (!state.currentUser) return null;

  const activeStories = state.stories.filter(s => new Date(s.expiresAt) > new Date());

  const storyAuthors = new Map<string, Story[]>();
  activeStories.forEach(story => {
    const existing = storyAuthors.get(story.authorId) || [];
    existing.push(story);
    storyAuthors.set(story.authorId, existing);
  });

  const viewedAuthorIds = new Set(
    activeStories.filter(s => s.viewers.includes(state.currentUser!.id)).map(s => s.authorId)
  );

  const getStoriesForAuthor = (authorId: string) => storyAuthors.get(authorId) || [];

  return (
    <>
      <div className="flex gap-4 overflow-x-auto py-4 px-4 scrollbar-hide">
        <button onClick={onCreateStory} className="flex flex-col items-center gap-1.5 min-w-[76px]">
          <div className="relative">
            <div className="w-[72px] h-[72px] rounded-full bg-[#141414] border-2 border-[#262626] flex items-center justify-center overflow-hidden">
              {state.currentUser.avatar ? (
                <img src={state.currentUser.avatar} alt={state.currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-[#e50914] rounded-full flex items-center justify-center border-[3px] border-[#0a0a0a]">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
          </div>
          <span className="text-[11px] text-[#888] truncate w-[76px] text-center">Your story</span>
        </button>

        {Array.from(storyAuthors.entries())
          .filter(([authorId]) => authorId !== state.currentUser?.id)
          .map(([authorId, stories]) => {
            const author = state.users.find(u => u.id === authorId);
            if (!author) return null;
            const isViewed = viewedAuthorIds.has(authorId);

            return (
              <button key={authorId}                onClick={() => dispatch({ type: 'SET_STORY_VIEWER', open: true, authorId })} className="flex flex-col items-center gap-1.5 min-w-[76px]">
                <div className={`w-[72px] h-[72px] rounded-full p-[2.5px] transition-all ${isViewed ? 'bg-[#333]' : 'bg-gradient-to-tr from-[#e50914] via-[#ff6b6b] to-[#ff4d58]'}`}>
                  <div className="w-full h-full rounded-full border-[3px] border-[#0a0a0a] overflow-hidden">
                    {author.avatar ? (
                      <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#141414] flex items-center justify-center"><span className="text-2xl">👤</span></div>
                    )}
                  </div>
                </div>
                <span className={`text-[11px] truncate w-[76px] text-center ${isViewed ? 'text-[#555]' : 'text-[#aaa]'}`}>
                  {author.name?.split(' ')[0] || 'User'}
                </span>
              </button>
            );
          })}

        {storyAuthors.size === 0 && (
          <div className="flex items-center justify-center w-full py-2">
            <p className="text-[#555] text-xs">No stories yet. Be the first to share!</p>
          </div>
        )}
      </div>


    </>
  );
}


