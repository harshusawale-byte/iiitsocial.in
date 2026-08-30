'use client';

import { useStore } from '../../store/store';
import { useState, useRef } from 'react';
import type { CreateType } from '../../types';

const createOptions: { type: CreateType; icon: string; label: string; description: string }[] = [
  { type: 'post', icon: '📸', label: 'Post', description: 'Share a photo or thought' },
  { type: 'story', icon: '⭕', label: 'Story', description: '24hr story' },
  { type: 'reel', icon: '🎬', label: 'Reel', description: '15s video' },
  { type: 'discussion', icon: '🗣️', label: 'Discuss', description: 'Start a conversation' },
  { type: 'poll', icon: '🗳️', label: 'Poll', description: 'Ask the community' },
  { type: 'anonymous', icon: '👻', label: 'Anonymous', description: 'Post anonymously' },
  { type: 'blog', icon: '📝', label: 'Blog', description: 'Write a long-form post' },
  { type: 'event', icon: '📅', label: 'Event', description: 'Create an event' },
];

export default function CreateModal() {
  const { state, dispatch, createPost, createDiscussion, createStory } = useStore();
  const [selectedType, setSelectedType] = useState<CreateType>(state.createModalType || 'post');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!state.currentUser) return null;

  const handleClose = () => {
    dispatch({ type: 'SET_CREATE_MODAL', open: false });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) { setUploading(false); return; }
    const results: (string | null)[] = new Array(fileArray.length).fill(null);
    let done = 0;

    fileArray.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) { height = (height * MAX_WIDTH) / width; width = MAX_WIDTH; }
          if (height > MAX_HEIGHT) { width = (width * MAX_HEIGHT) / height; height = MAX_HEIGHT; }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            results[index] = canvas.toDataURL('image/jpeg', 0.8);
          }
          done++;
          if (done === fileArray.length) {
            setImages(prev => [...prev, ...results.filter((r): r is string => r !== null)]);
            setUploading(false);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!content.trim() && images.length === 0) return;

    if (selectedType === 'poll') {
      const validOptions = pollOptions.filter(o => o.trim());
      if (validOptions.length < 2) return;
      const poll = {
        id: 'pol_' + Date.now(),
        authorId: state.currentUser!.id,
        question: content,
        options: validOptions.map((text, i) => ({ id: 'po_' + Date.now() + i, text, votes: [] })),
        totalVotes: 0,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_POLL', poll });
      dispatch({ type: 'SET_CREATE_MODAL', open: false });
      resetForm();
      return;
    }

    if (selectedType === 'discussion') {
      createDiscussion({
        authorId: state.currentUser!.id,
        type: 'DISCUSSION',
        title: title || 'New Discussion',
        content,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        upvotes: [],
        downvotes: [],
        replies: [],
        isAnonymous: false,
        isPinned: false,
      });
      resetForm();
      return;
    }

    if (selectedType === 'event') {
      const event = {
        id: 'ev_' + Date.now(),
        title: title || 'New Event',
        description: content,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        location: 'IIIT Pune',
        interested: [],
        createdBy: state.currentUser!.id,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_EVENT', event });
      dispatch({ type: 'SET_CREATE_MODAL', open: false });
      resetForm();
      return;
    }

    if (selectedType === 'anonymous') {
      createPost({
        authorId: state.currentUser!.id,
        type: 'anonymous',
        content,
        images: images.length > 0 ? images : [],
        likes: [],
        comments: [],
        shares: 0,
        reposts: [],
        saves: [],
        isAnonymous: true,
      });
      resetForm();
      return;
    }

    if (selectedType === 'blog') {
      const blog = {
        id: 'b_' + Date.now(),
        authorId: state.currentUser!.id,
        title: title || 'Untitled Blog',
        content,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        readingTime: Math.max(1, Math.ceil(content.split(' ').length / 200)),
        likes: [],
        comments: [],
        saves: [],
        createdAt: new Date().toISOString(),
        published: true,
      };
      dispatch({ type: 'ADD_BLOG', blog });
      dispatch({ type: 'SET_CREATE_MODAL', open: false });
      resetForm();
      return;
    }

    if (selectedType === 'story') {
      createStory(content, images[0] || undefined);
      resetForm();
      return;
    }

    if (selectedType === 'reel') {
      // Redirect to reel modal
      dispatch({ type: 'SET_CREATE_MODAL', open: true, createType: 'reel' });
      return;
    }

    // Default: post (with optional images)
    createPost({
      authorId: state.currentUser!.id,
      type: images.length > 0 ? 'image' : 'text',
      content,
      images: images.length > 0 ? images : [],
      hashtags: tags.split(',').map(t => t.trim()).filter(Boolean),
      likes: [],
      comments: [],
      shares: 0,
      reposts: [],
      saves: [],
      isAnonymous: false,
    });
    resetForm();
  };

  const resetForm = () => {
    setContent('');
    setTitle('');
    setTags('');
    setPollOptions(['', '']);
    setImages([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-[#141414] border border-[#262626] rounded-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626] flex-shrink-0">
          <h2 className="text-white font-semibold">Create</h2>
          <button onClick={handleClose} className="text-[#666] hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Type selector */}
        <div className="flex gap-2 px-5 py-3 overflow-x-auto border-b border-[#262626] flex-shrink-0">
          {createOptions.map(opt => (
            <button
              key={opt.type}
              onClick={() => {
                setSelectedType(opt.type);
                setIsAnonymous(opt.type === 'anonymous');
                if (opt.type !== 'post' && opt.type !== 'anonymous') {
                  setImages([]);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedType === opt.type
                  ? 'bg-[#e50914]/15 text-[#e50914] border border-[#e50914]/30'
                  : 'bg-[#1a1a1a] text-[#666] border border-[#262626] hover:text-white'
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          {/* User info */}
          <div className="flex items-center gap-3 px-5 pt-4">
            {isAnonymous ? (
              <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-lg">👻</div>
            ) : (
              <img src={state.currentUser.avatar} alt="" className="w-10 h-10 rounded-full bg-[#1a1a1a]" />
            )}
            <div>
              <div className="text-white text-sm font-medium flex items-center gap-1">
                {isAnonymous ? '👻 Anonymous' : state.currentUser.name}
                {!isAnonymous && state.currentUser.isVerified && (
                  <svg className="w-3.5 h-3.5 text-[#e50914]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0c.49.401 1.003.703 1.545.857a3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="text-[#666] text-xs">{isAnonymous ? 'Anonymous IIIT Pune Student' : `✓ IIIT Pune · ${state.currentUser.academicYear}`}</div>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-3">
            {selectedType === 'discussion' && (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Discussion title..."
                className="w-full bg-transparent text-white text-lg font-semibold placeholder-[#444] focus:outline-none mb-2"
              />
            )}
            {selectedType === 'blog' && (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Blog title..."
                className="w-full bg-transparent text-white text-lg font-semibold placeholder-[#444] focus:outline-none mb-2"
              />
            )}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isAnonymous ? 'Share your thoughts anonymously...' : `What's on your mind, ${state.currentUser.name?.split(' ')[0]}?`}
              className="w-full bg-transparent text-white placeholder-[#444] focus:outline-none resize-none min-h-[100px] text-sm leading-relaxed"
              rows={4}
            />

            {/* Image previews */}
            {images.length > 0 && (
              <div className={`grid gap-2 mt-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {images.map((img, index) => (
                  <div key={index} className="relative rounded-xl overflow-hidden group">
                    <img
                      src={img}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-40 object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <span className="text-white text-[10px]">Image {index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload progress */}
            {uploading && (
              <div className="flex items-center gap-2 mt-2 text-[#666] text-xs">
                <div className="animate-spin h-3 w-3 border border-[#666] border-t-transparent rounded-full" />
                Processing image...
              </div>
            )}

            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma separated)"
              className="w-full bg-transparent text-[#666] placeholder-[#333] focus:outline-none text-xs mt-3"
            />
          </div>

          {/* Poll options */}
          {selectedType === 'poll' && (
            <div className="px-5 pb-3 space-y-2">
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...pollOptions];
                      newOpts[i] = e.target.value;
                      setPollOptions(newOpts);
                    }}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 bg-[#1a1a1a] border border-[#262626] rounded-lg px-3 py-2 text-white text-sm placeholder-[#444] focus:border-[#e50914] focus:outline-none"
                  />
                  {i >= 2 && (
                    <button
                      onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}
                      className="text-[#666] hover:text-[#e50914] p-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 6 && (
                <button
                  onClick={() => setPollOptions([...pollOptions, ''])}
                  className="text-[#e50914] text-xs hover:underline"
                >
                  + Add option
                </button>
              )}
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#262626] flex-shrink-0">
          <div className="flex gap-3 text-[#666]">
            {/* Image upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="hover:text-[#e50914] transition-colors relative"
              title="Add image"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {images.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#e50914] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {images.length}
                </span>
              )}
            </button>
            <button
              className="hover:text-[#444] cursor-not-allowed transition-colors opacity-30"
              title="Video coming soon"
              disabled
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125" />
              </svg>
            </button>
            {selectedType === 'poll' && (
              <button className="text-[#e50914]" title="Poll active">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={(!content.trim() && images.length === 0) || uploading}
            className="px-5 py-2 bg-[#e50914] hover:bg-[#ff1a25] disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all active:scale-95"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
