'use client';

import { useStore } from '../../store/store';
import { useState, useRef } from 'react';

interface CreateStoryModalProps {
  onClose: () => void;
}

export default function CreateStoryModal({ onClose }: CreateStoryModalProps) {
  const { createStory } = useStore();
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('#e50914');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = ['#e50914', '#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560', '#1b1b2f', '#2d2d2d'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePost = () => {
    if (!text.trim() && !imagePreview) return;
    createStory(text, imagePreview || undefined, undefined, backgroundColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#141414] rounded-2xl w-full max-w-md overflow-hidden border border-[#262626]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <button onClick={onClose} className="text-[#666] hover:text-white transition-colors text-sm">
            Cancel
          </button>
          <h2 className="text-white font-semibold text-base">Create Story</h2>
          <button
            onClick={handlePost}
            disabled={!text.trim() && !imagePreview}
            className="text-[#e50914] hover:text-[#ff1a25] font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Share
          </button>
        </div>

        {/* Preview */}
        <div className="p-5">
          <div
            className="w-full aspect-[9/16] max-h-[400px] rounded-xl overflow-hidden flex items-center justify-center relative"
            style={{ backgroundColor }}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Story preview" className="w-full h-full object-cover" />
                {text && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                    <p className="text-white text-center font-medium">{text}</p>
                  </div>
                )}
              </>
            ) : text ? (
              <p className="text-white text-lg font-medium px-6 text-center leading-relaxed">{text}</p>
            ) : (
              <div className="text-center px-6">
                <span className="text-4xl mb-3 block">📸</span>
                <p className="text-white/60 text-sm">Add text or an image to your story</p>
              </div>
            )}
          </div>
        </div>

        {/* Text input */}
        <div className="px-5 pb-3">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add a caption..."
            maxLength={150}
            className="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg px-4 py-3 text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-[#e50914]/50 transition-colors"
          />
          <p className="text-[#555] text-xs text-right mt-1">{text.length}/150</p>
        </div>

        {/* Color picker */}
        <div className="px-5 pb-3">
          <p className="text-[#666] text-xs mb-2">Background color</p>
          <div className="flex gap-2 flex-wrap">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setBackgroundColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  backgroundColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1a1a1a] border border-[#262626] rounded-lg text-white text-sm font-medium hover:bg-[#222] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
            {imagePreview ? 'Change Image' : 'Add Image'}
          </button>
          {imagePreview && (
            <button
              onClick={() => setImagePreview(null)}
              className="px-4 py-2.5 bg-[#1a1a1a] border border-[#262626] rounded-lg text-[#e50914] text-sm font-medium hover:bg-[#222] transition-colors"
            >
              Remove
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
