'use client';

import { useStore } from '../../../store/store';
import { useState } from 'react';
import EmptyState from '../../../components/ui/EmptyState';

type SortType = 'hot' | 'rising' | 'new' | 'top';

export default function DiscussPage() {
  const { state, upvoteDiscussion, downvoteDiscussion, addDiscussionReply, createDiscussion, removeDiscussion } = useStore();
  const [sortBy, setSortBy] = useState<SortType>('hot');
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const getSortedDiscussions = () => {
    const sorted = [...state.discussions];
    switch (sortBy) {
      case 'hot': return sorted.sort((a, b) => (b.upvotes.length - b.downvotes.length) - (a.upvotes.length - a.downvotes.length));
      case 'rising': return sorted.sort((a, b) => {
        const aAge = (Date.now() - new Date(a.createdAt).getTime()) / 3600000;
        const bAge = (Date.now() - new Date(b.createdAt).getTime()) / 3600000;
        return ((b.upvotes.length / (bAge + 1)) - (a.upvotes.length / (aAge + 1)));
      });
      case 'new': return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      default: return sorted.sort((a, b) => (b.upvotes.length - b.downvotes.length) - (a.upvotes.length - a.downvotes.length));
    }
  };

  const handleCreate = () => {
    if (!title.trim() || !content.trim() || !state.currentUser) return;
    createDiscussion({
      authorId: state.currentUser.id, type: 'DISCUSSION', title, content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      upvotes: [], downvotes: [], replies: [], isAnonymous: false, isPinned: false,
    });
    setTitle(''); setContent(''); setTags(''); setShowCreate(false);
  };

  const handleReply = (discussionId: string) => {
    if (!replyText.trim()) return;
    addDiscussionReply(discussionId, replyText);
    setReplyText(''); setReplyTo(null);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const discussions = getSortedDiscussions();
  const sortButtons: { id: SortType; label: string; icon: string }[] = [
    { id: 'hot', label: 'Hot', icon: '🔥' }, { id: 'rising', label: 'Rising', icon: '📈' },
    { id: 'new', label: 'New', icon: '🆕' }, { id: 'top', label: 'Top', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-[#1a1a1a]">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">Discuss</h1>
          <button onClick={() => setShowCreate(!showCreate)} className="px-3 py-1.5 bg-[#e50914] hover:bg-[#ff1a25] text-white text-xs font-semibold rounded-lg transition-all">
            + New
          </button>
        </div>
        <div className="flex gap-1 px-4 pb-3">
          {sortButtons.map(btn => (
            <button key={btn.id} onClick={() => setSortBy(btn.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${sortBy === btn.id ? 'bg-[#e50914]/15 text-[#e50914] border border-[#e50914]/30' : 'bg-[#141414] text-[#666] border border-[#262626] hover:text-white'}`}>
              <span>{btn.icon}</span><span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {showCreate && (
        <div className="px-4 py-4 border-b border-[#1a1a1a] bg-[#141414] animate-slide-up">
          <h3 className="text-white font-semibold text-sm mb-3">Start a Discussion</h3>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Discussion title..."
            className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-[#e50914] focus:outline-none mb-2" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share your thoughts..."
            className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-[#e50914] focus:outline-none resize-none mb-2" rows={3} />
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)"
            className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-white text-xs placeholder-[#444] focus:border-[#e50914] focus:outline-none mb-3" />
          <div className="flex gap-2">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-[#333] text-[#666] text-xs rounded-lg hover:text-white transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={!title.trim() || !content.trim()}
              className="px-4 py-2 bg-[#e50914] hover:bg-[#ff1a25] disabled:opacity-30 text-white text-xs font-semibold rounded-lg transition-all">Post Discussion</button>
          </div>
        </div>
      )}

      <div className="px-4 py-2">
        {discussions.length === 0 ? (
          <EmptyState
            icon="🗣️"
            title="No discussions yet"
            description="Start the first discussion! Ask a question, share an opinion, or start a conversation."
            action={{ label: 'Start a discussion', onClick: () => setShowCreate(true) }}
          />
        ) : (
          <div className="space-y-3">
            {discussions.map(disc => {
              const author = state.users.find(u => u.id === disc.authorId);
              const score = disc.upvotes.length - disc.downvotes.length;
              const hasUpvoted = state.currentUser && disc.upvotes.includes(state.currentUser.id);
              const hasDownvoted = state.currentUser && disc.downvotes.includes(state.currentUser.id);
              return (
                <div key={disc.id} className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden animate-fade-in">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-0.5">
                        <button onClick={() => upvoteDiscussion(disc.id)} className={`p-1 rounded transition-colors ${hasUpvoted ? 'text-[#e50914]' : 'text-[#666] hover:text-[#e50914]'}`}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                        </button>
                        <span className={`text-xs font-bold ${score > 0 ? 'text-[#e50914]' : score < 0 ? 'text-[#666]' : 'text-[#a0a0a0]'}`}>{score}</span>
                        <button onClick={() => downvoteDiscussion(disc.id)} className={`p-1 rounded transition-colors ${hasDownvoted ? 'text-[#3b82f6]' : 'text-[#666] hover:text-[#3b82f6]'}`}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[10px] px-1.5 py-0.5 bg-[#e50914]/10 text-[#e50914] rounded font-medium uppercase">{disc.type.replace('_', ' ')}</span>
                          {disc.isPinned && <span className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded font-medium">📌 Pinned</span>}
                          {disc.tags.slice(0, 3).map(tag => (<span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white/5 text-[#666] rounded">#{tag}</span>))}
                        </div>
                        <h3 className="text-white font-semibold text-sm mb-1">{disc.title}</h3>
                        <p className="text-[#a0a0a0] text-xs line-clamp-2 mb-3">{disc.content.slice(0, 200)}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            {disc.isAnonymous ? <div className="w-5 h-5 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[10px]">👻</div> : author && <img src={author.avatar} alt="" className="w-5 h-5 rounded-full bg-[#1a1a1a]" />}
                            <span className="text-[#666] text-xs">{disc.isAnonymous ? 'Anonymous' : author?.name}</span>
                          </div>
                          <span className="text-[#444] text-xs">· {timeAgo(disc.createdAt)} · {disc.replies.length} replies · {disc.viewCount} views</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <button onClick={() => setReplyTo(replyTo === disc.id ? null : disc.id)} className="text-[#e50914] text-xs hover:underline">💬 Reply</button>
                          {state.currentUser && state.currentUser.id === disc.authorId && (
                            <button onClick={() => removeDiscussion(disc.id)} className="text-red-500 text-xs hover:underline">🗑 Delete</button>
                          )}
                        </div>
                      </div>
                    </div>
                    {disc.replies.length > 0 && (
                      <div className="mt-3 ml-8 space-y-2 border-l-2 border-[#262626] pl-4">
                        {disc.replies.slice(0, 3).map(reply => {
                          const replyAuthor = state.users.find(u => u.id === reply.authorId);
                          return (
                            <div key={reply.id} className="text-xs">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-white font-medium">{reply.isAnonymous ? 'Anonymous' : replyAuthor?.name}</span>
                                <span className="text-[#444]">· {timeAgo(reply.createdAt)}</span>
                              </div>
                              <p className="text-[#a0a0a0]">{reply.content}</p>
                            </div>
                          );
                        })}
                        {disc.replies.length > 3 && <span className="text-[#e50914] text-xs">View all {disc.replies.length} replies</span>}
                      </div>
                    )}
                    {replyTo === disc.id && (
                      <div className="mt-3 ml-8 flex gap-2 animate-slide-up">
                        <input value={replyText} onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleReply(disc.id)}
                          placeholder="Write a reply..."
                          className="flex-1 bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-xs text-white placeholder-[#444] focus:border-[#e50914] focus:outline-none" />
                        <button onClick={() => handleReply(disc.id)} disabled={!replyText.trim()}
                          className="text-[#e50914] disabled:text-[#333] text-xs font-medium transition-colors">Reply</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
