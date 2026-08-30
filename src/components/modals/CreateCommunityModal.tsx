'use client';

import { useStore } from '../../store/store';
import { useState } from 'react';

const iconOptions = ['💻', '🤖', '🎮', '🎵', '🏏', '🎬', '📸', '🏆', '😂', '🧠', '🎨', '🚀', '📚', '🏃', '🌐', '📱', '🔐', '☁️', '🎸', '♟️', '✈️', '🍳', '💡', '🔧', '🎯', '⚽', '🏀', '🎪', '🎭', '🌍'];
const categoryOptions = ['Academic', 'Interest', 'Club', 'Fun'];

interface CreateCommunityModalProps {
  onClose: () => void;
}

export default function CreateCommunityModal({ onClose }: CreateCommunityModalProps) {
  const { state, createCommunity } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('💻');
  const [category, setCategory] = useState('Interest');
  const [isVerified, setIsVerified] = useState(false);

  if (!state.currentUser) return null;

  const handleCreate = () => {
    if (!name.trim() || !description.trim()) return;
    createCommunity({
      name: name.trim(),
      description: description.trim(),
      icon,
      category,
      isVerified,
      createdBy: state.currentUser!.id,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-[#141414] border border-[#262626] rounded-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626] flex-shrink-0">
          <h2 className="text-white font-semibold">Create Community</h2>
          <button onClick={onClose} className="text-[#666] hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Icon picker */}
          <div>
            <label className="block text-[#a0a0a0] text-xs font-medium mb-2">Community Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {iconOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => setIcon(opt)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                    icon === opt
                      ? 'bg-[#e50914]/15 border border-[#e50914]/40 scale-110'
                      : 'bg-[#1a1a1a] border border-[#262626] hover:border-[#444]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#262626] rounded-xl p-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#e50914]/10 to-[#1a1a1a] rounded-xl flex items-center justify-center text-3xl border border-[#262626]">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm truncate">{name || 'Community Name'}</div>
              <div className="text-[#666] text-xs truncate">{description || 'Community description'}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[#444] text-[10px]">{category}</span>
                <span className="text-[#444] text-[10px]">·</span>
                <span className="text-[#444] text-[10px]">1 member</span>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[#a0a0a0] text-xs font-medium mb-1.5">Community Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 50))}
              placeholder="e.g., AI/ML Study Group"
              className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[#a0a0a0] text-xs font-medium mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 200))}
              placeholder="What is this community about?"
              rows={3}
              className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[#a0a0a0] text-xs font-medium mb-2">Category</label>
            <div className="flex gap-2">
              {categoryOptions.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    category === cat
                      ? 'bg-[#e50914]/15 text-[#e50914] border border-[#e50914]/30'
                      : 'bg-[#1a1a1a] text-[#666] border border-[#262626] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Verified toggle */}
          <div className="flex items-center justify-between bg-[#1a1a1a] border border-[#262626] rounded-xl px-4 py-3">
            <div>
              <div className="text-white text-sm font-medium">Verified Community</div>
              <div className="text-[#666] text-xs">Mark as an official student organization</div>
            </div>
            <button
              onClick={() => setIsVerified(!isVerified)}
              className={`w-10 h-6 rounded-full transition-colors ${isVerified ? 'bg-[#e50914]' : 'bg-[#333]'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${isVerified ? 'translate-x-4' : ''}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[#262626] flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-[#666] text-sm hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || !description.trim()}
            className="px-6 py-2 bg-[#e50914] hover:bg-[#ff1a25] disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all active:scale-95"
          >
            Create Community
          </button>
        </div>
      </div>
    </div>
  );
}
