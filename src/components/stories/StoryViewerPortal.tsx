'use client';

import { createPortal } from 'react-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../store/store';
import type { Story } from '../../types';

interface StoryViewerPortalProps {
  stories: Story[];
  onClose: () => void;
}

export default function StoryViewerPortal({ stories, onClose }: StoryViewerPortalProps) {
  const { state, viewStory } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const story = stories[currentIndex];
  const author = state.users.find(u => u.id === story?.authorId);

  const STORY_DURATION = 5000;

  // Mount portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const closeViewer = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onClose(), 200);
  }, [onClose]);

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      closeViewer();
    }
  }, [currentIndex, stories.length, closeViewer]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isPaused && story) {
      timerRef.current = setTimeout(goNext, STORY_DURATION);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, isPaused, story, goNext]);

  useEffect(() => {
    if (story) viewStory(story.id);
  }, [story, viewStory]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (!story || !author || !mounted) return null;

  const handleTap = (e: React.MouseEvent) => {
    if (showReply) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) goPrev();
    else if (x > (rect.width / 3) * 2) goNext();
  };

  const handlePointerDown = () => {
    longPressTimer.current = setTimeout(() => setIsPaused(true), 200);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    if (isPaused) setIsPaused(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (deltaY > 100) closeViewer();
    touchStartRef.current = null;
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        backgroundColor: '#000',
        opacity: isExiting ? 0 : 1,
        transition: 'opacity 200ms ease',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Progress bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30, padding: '12px 12px 0', display: 'flex', gap: '4px' }}>
        {stories.map((_, i) => (
          <div key={i} style={{ flex: 1, height: '2px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '1px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                backgroundColor: '#fff',
                borderRadius: '1px',
                width: i < currentIndex ? '100%' : i === currentIndex ? '100%' : '0%',
                transition: i === currentIndex && !isPaused ? `width ${STORY_DURATION}ms linear` : 'none',
                animation: i === currentIndex && !isPaused ? `storyProgress ${STORY_DURATION}ms linear forwards` : 'none',
              }}
            />
          </div>
        ))}
      </div>

      {/* Author header */}
      <div style={{ position: 'absolute', top: '24px', left: 0, right: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={author.avatar} alt={author.name} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', objectFit: 'cover' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{author.name}</span>
            {author.isVerified && (
              <svg style={{ width: '14px', height: '14px', color: '#e50914' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0c.49.401 1.003.703 1.545.857a3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{getTimeAgo(story.createdAt)}</span>
          </div>
        </div>
        <button onClick={closeViewer} style={{ color: 'rgba(255,255,255,0.8)', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg style={{ width: '28px', height: '28px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Story content — FULLSCREEN */}
      <div
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer', userSelect: 'none' }}
        onClick={handleTap}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: story.backgroundColor || '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {story.imageUrl ? (
            <img src={story.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : story.videoUrl ? (
            <video src={story.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop playsInline />
          ) : (
            <p style={{ color: '#fff', fontSize: '24px', fontWeight: 600, padding: '0 40px', textAlign: 'center', lineHeight: 1.5 }}>{story.content}</p>
          )}
        </div>

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 20%, transparent 80%, rgba(0,0,0,0.6))', pointerEvents: 'none' }} />

        {story.imageUrl && story.content && (
          <div style={{ position: 'absolute', bottom: '80px', left: 0, right: 0, padding: '0 20px', pointerEvents: 'none' }}>
            <p style={{ color: '#fff', fontSize: '14px', fontWeight: 500, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center' }}>{story.content}</p>
          </div>
        )}

        {isPaused && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '32px', height: '32px', color: '#fff', marginLeft: '4px' }} fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Reply bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30, padding: '12px 16px 24px' }}>
        {showReply ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: '9999px', padding: '10px 16px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <input
              type="text"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder={`Reply to ${author.name?.split(' ')[0]}...`}
              style={{ flex: 1, backgroundColor: 'transparent', color: '#fff', fontSize: '14px', border: 'none', outline: 'none' }}
              autoFocus
              onBlur={() => { if (!replyText) setShowReply(false); }}
            />
            {replyText && (
              <button onClick={() => { setReplyText(''); setShowReply(false); }} style={{ color: '#e50914', fontSize: '14px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Send</button>
            )}
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setShowReply(true); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: '9999px', padding: '10px 16px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
          >
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Send message...</span>
          </button>
        )}
      </div>

      {/* Viewers count */}
      <div style={{ position: 'absolute', bottom: '72px', left: 0, right: 0, zIndex: 25, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', borderRadius: '9999px', padding: '4px 12px' }}>
          <svg style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.6)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 500 }}>
            {story.viewers.length} view{story.viewers.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
