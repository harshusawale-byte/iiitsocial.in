'use client';

import { useState } from 'react';
import ImageViewer from './ImageViewer';
import { useStore } from '../../store/store';
import type { Story } from '../../types';

interface ClickableAvatarProps {
  src: string;
  alt?: string;
  className?: string;
  userId?: string;
  showStoryRing?: boolean;
}

export default function ClickableAvatar({ src, alt, className, userId, showStoryRing = false }: ClickableAvatarProps) {
  const [zoomed, setZoomed] = useState(false);
  const { state, dispatch } = useStore();

  const activeStories: Story[] = userId
    ? state.stories.filter(s => s.authorId === userId && new Date(s.expiresAt) > new Date())
    : [];

  const hasStory = activeStories.length > 0;
  const isViewed = hasStory && state.currentUser
    ? activeStories.every(s => s.viewers.includes(state.currentUser!.id))
    : false;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasStory && userId) {
      dispatch({ type: 'SET_STORY_VIEWER', open: true, authorId: userId });
    } else {
      setZoomed(true);
    }
  };

  return (
    <>
      <div className="relative inline-block" onClick={handleClick}>
        {hasStory && showStoryRing ? (
          <div className={`rounded-full p-[2.5px] ${isViewed ? 'bg-[#333]' : 'bg-gradient-to-tr from-[#e50914] via-[#ff6b6b] to-[#ff4d58]'}`}>
            <div className="rounded-full border-2 border-[#0a0a0a] overflow-hidden">
              <img src={src} alt={alt || ''} className={`${className} cursor-pointer hover:opacity-90 transition-opacity`} />
            </div>
          </div>
        ) : (
          <img src={src} alt={alt || ''} className={`${className} cursor-pointer hover:opacity-90 transition-opacity`} />
        )}
      </div>

      {zoomed && <ImageViewer src={src} alt={alt} onClose={() => setZoomed(false)} />}


    </>
  );
}
