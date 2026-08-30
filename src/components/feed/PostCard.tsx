'use client';

import { useStore } from '../../store/store';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import type { Post } from '../../types';
import ClickableAvatar from '../ui/ClickableAvatar';
import ClickableImage from '../ui/ClickableImage';

interface PostCardProps {
  post: Post;
  compact?: boolean;
}

export default function PostCard({ post, compact = false }: PostCardProps) {
  const { state, dispatch, toggleLikePost, toggleSavePost, addComment, likeComment, removePost, reportContent } = useStore();
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const author = state.users.find(u => u.id === post.authorId);
  if (!author) return null;

  const isLiked = state.currentUser ? post.likes.includes(state.currentUser.id) : false;
  const isSaved = state.currentUser ? post.saves.includes(state.currentUser.id) : false;
  const isReposted = state.currentUser ? post.reposts.includes(state.currentUser.id) : false;

  const handleComment = () => {
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  const formatNumber = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n.toString();

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}w`;
  };

  return (
    <div className="bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 py-4 animate-fade-in">
      {/* Author row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative">
          {post.isAnonymous ? (
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-lg">
              👻
            </div>
          ) : (
            <ClickableAvatar src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full bg-[#1a1a1a]" userId={author.id} showStoryRing />
          )}
          {!post.isAnonymous && author.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0a]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {!post.isAnonymous ? (
              <button
                onClick={() => router.push(`/profile?userId=${author.id}`)}
                className="text-white text-sm font-semibold truncate hover:underline text-left"
              >
                {author.name}
              </button>
            ) : (
              <span className="text-white text-sm font-semibold truncate">
                Anonymous IIIT Pune Student
              </span>
            )}
            {!post.isAnonymous && author.isVerified && (
              <svg className="w-3.5 h-3.5 text-[#e50914] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0c.49.401 1.003.703 1.545.857a3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {!post.isAnonymous && author.status !== 'NOVA' && (
              <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-[#a0a0a0] rounded font-medium">
                {author.status}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[#666] text-xs">
            {!post.isAnonymous && <span>{author.academicYear}</span>}
            {!post.isAnonymous && <span>·</span>}
            <span>{timeAgo(post.createdAt)}</span>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-[#666] hover:text-white rounded-full hover:bg-[#141414] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-[#1a1a1a] border border-[#262626] rounded-xl py-1 w-44 z-10 shadow-xl">
              <button onClick={() => { setShowMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-[#a0a0a0] hover:bg-[#262626] hover:text-white transition-colors">
                Not Interested
              </button>
              <button onClick={() => { setShowMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-[#a0a0a0] hover:bg-[#262626] hover:text-white transition-colors">
                Mute User
              </button>
              <button onClick={() => {
                reportContent(post.id, 'post', 'other');
                setShowMenu(false);
              }} className="w-full text-left px-3 py-2 text-sm text-[#e50914] hover:bg-[#262626] transition-colors">
                Report
              </button>
              <button onClick={() => { setShowMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-[#e50914] hover:bg-[#262626] transition-colors">
                Block
              </button>
              {state.currentUser && state.currentUser.id === post.authorId && (
                <>
                  <div className="border-t border-[#262626] my-1" />
                  <button onClick={() => {
                    removePost(post.id);
                    setShowMenu(false);
                  }} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-[#262626] transition-colors">
                    Delete Post
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-3">
          {post.images.length === 1 ? (
            <div className="rounded-xl overflow-hidden">
              <ClickableImage src={post.images[0]} alt="" className="w-full object-cover max-h-[400px]" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
              {post.images.slice(0, 4).map((img, i) => (
                <ClickableImage key={i} src={img} alt="" className="w-full h-40 object-cover" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 -ml-2">
        {/* Like */}
        <button
          onClick={() => toggleLikePost(post.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
            isLiked ? 'text-[#e50914]' : 'text-[#666] hover:text-[#e50914] hover:bg-[#e50914]/5'
          }`}
        >
          {isLiked ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          )}
          <span>{formatNumber(post.likes.length)}</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#666] hover:text-white hover:bg-white/5 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
          </svg>
          <span>{formatNumber(post.comments.length)}</span>
        </button>

        {/* Repost */}
        <button
          onClick={() => {
            if (state.currentUser) {
              dispatch({ type: 'REPOST', postId: post.id, userId: state.currentUser.id });
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
            isReposted ? 'text-green-500' : 'text-[#666] hover:text-green-500 hover:bg-green-500/5'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
          </svg>
          <span>{formatNumber(post.reposts.length)}</span>
        </button>

        {/* Save */}
        <button
          onClick={() => toggleSavePost(post.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ml-auto ${
            isSaved ? 'text-[#f59e0b]' : 'text-[#666] hover:text-[#f59e0b] hover:bg-[#f59e0b]/5'
          }`}
        >
          {isSaved ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M6.32 2.577a49.979 49.979 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-[#1a1a1a] animate-slide-up">
          {/* Comment input */}
          <div className="flex items-center gap-2 mb-3 lg:static sticky bottom-0 z-50 bg-[#0a0a0a] py-2 -mx-4 px-4">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="Write a comment..."
              className="flex-1 bg-[#141414] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors"
            />
            <button
              onClick={handleComment}
              disabled={!commentText.trim()}
              className="text-[#e50914] disabled:text-[#333] text-sm font-medium transition-colors"
            >
              Post
            </button>
          </div>

          {/* Comments */}
          <div className="space-y-3">
            {post.comments.map((comment) => {
              const commentAuthor = state.users.find(u => u.id === comment.authorId);
              return (
                <div key={comment.id} className="flex gap-2">
                  {comment.isAnonymous || !commentAuthor?.avatar ? (
                    <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center text-xs">👤</div>
                  ) : (
                    <ClickableAvatar src={commentAuthor.avatar} alt={commentAuthor?.name} className="w-7 h-7 rounded-full bg-[#1a1a1a]" />
                  )}
                  <div className="flex-1">
                    <div className="bg-[#141414] rounded-lg px-3 py-2">
                      {comment.isAnonymous || !commentAuthor ? (
                        <span className="text-white text-xs font-semibold mr-1.5">
                          {comment.isAnonymous ? 'Anonymous' : 'Unknown'}
                        </span>
                      ) : (
                        <button
                          onClick={() => router.push(`/profile?userId=${comment.authorId}`)}
                          className="text-white text-xs font-semibold mr-1.5 hover:underline text-left"
                        >
                          {commentAuthor.name}
                        </button>
                      )}
                      <span className="text-[#a0a0a0] text-xs">{comment.content}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 px-1">
                      <button
                        onClick={() => likeComment(post.id, comment.id)}
                        className={`${state.currentUser && comment.likes.includes(state.currentUser.id) ? 'text-[#e50914]' : 'text-[#666]'} text-[10px] hover:text-white transition-colors`}
                      >
                        {comment.likes.length > 0 ? `${comment.likes.length} likes · ` : ''}Like
                      </button>
                      <button className="text-[#666] text-[10px] hover:text-white transition-colors">Reply</button>
                      <span className="text-[#333] text-[10px]">{timeAgo(comment.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
