'use client';

import { useStore } from '../../store/store';
import { useState, useRef } from 'react';
import type { Branch, AcademicYear } from '../../types';

const allInterests = [
  '💻 Coding', '🤖 AI', '🎮 Gaming', '🎵 Music', '🏏 Sports', '🎬 Movies',
  '📸 Photography', '🏆 Hackathons', '😂 Memes', '🧠 Academics', '🎨 Design',
  '🚀 Startups', '📚 Reading', '🏃 Fitness', '🌐 Web Dev', '📱 Mobile Dev',
  '🔐 Security', '☁️ Cloud', '🎸 Guitar', '♟️ Chess', '✈️ Travel', '🍳 Cooking',
];

const lookingForOptions = [
  'Hackathon teammate', 'Web dev partner', 'Senior mentor', 'Gaming teammate',
  'Study group', 'Project teammate', 'Research collaborator', 'Startup co-founder',
];

interface EditProfileModalProps {
  onClose: () => void;
}

export default function EditProfileModal({ onClose }: EditProfileModalProps) {
  const { state, dispatch } = useStore();
  const [name, setName] = useState(state.currentUser?.name || '');
  const [username, setUsername] = useState(state.currentUser?.username || '');
  const [bio, setBio] = useState(state.currentUser?.bio || '');
  const [branch, setBranch] = useState<Branch>(state.currentUser?.branch || 'CSE');
  const [academicYear, setAcademicYear] = useState<AcademicYear>(state.currentUser?.academicYear || '1st Year');
  const [graduationYear, setGraduationYear] = useState(state.currentUser?.graduationYear || 2029);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(state.currentUser?.interests || []);
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>(state.currentUser?.lookingFor || []);
  const [avatarPreview, setAvatarPreview] = useState(state.currentUser?.avatar || '');
  const [coverPreview, setCoverPreview] = useState(state.currentUser?.coverImage || '');
  const [saving, setSaving] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Username validation
  const normalizedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  const usernameChanged = normalizedUsername !== (state.currentUser?.username || '');
  const usernameError = normalizedUsername.length === 0
    ? 'Username is required'
    : normalizedUsername.length < 3 && usernameChanged
      ? 'Username must be at least 3 characters'
      : normalizedUsername.length > 20
        ? 'Username must be 20 characters or less'
        : null;
  const isUsernameValid = !usernameError;

  if (!state.currentUser) return null;

  const handleClose = () => {
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);

    const updates = {
      name: name.trim(),
      username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
      bio: bio.trim(),
      branch,
      academicYear,
      graduationYear,
      interests: selectedInterests,
      lookingFor: selectedLookingFor,
      avatar: avatarPreview,
      coverImage: coverPreview || undefined,
    };

    // Persist to Supabase
    const { updateProfile } = await import('../../lib/supabase/auth');
    await updateProfile(state.currentUser!.id, updates);

    // Update local state
    dispatch({ type: 'UPDATE_USER', userId: state.currentUser!.id, updates });
    setSaving(false);
    onClose();
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleLookingFor = (item: string) => {
    setSelectedLookingFor(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const SIZE = 256;
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const min = Math.min(img.width, img.height);
          const sx = (img.width - min) / 2;
          const sy = (img.height - min) / 2;
          ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE);
          setAvatarPreview(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_W = 1200;
        const MAX_H = 400;
        let w = img.width;
        let h = img.height;
        if (w > MAX_W) { h = (h * MAX_W) / w; w = MAX_W; }
        if (h > MAX_H) { w = (w * MAX_H) / h; h = MAX_H; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          setCoverPreview(canvas.toDataURL('image/jpeg', 0.8));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-[#141414] border border-[#262626] rounded-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626] flex-shrink-0">
          <h2 className="text-white font-semibold">Edit Profile</h2>
          <button onClick={handleClose} className="text-[#666] hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Cover image */}
          <div>
            <label className="block text-[#a0a0a0] text-xs font-medium mb-2">Cover Photo</label>
            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            <div
              onClick={() => coverInputRef.current?.click()}
              className="relative w-full h-28 rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#262626] cursor-pointer group"
            >
              {coverPreview ? (
                <img src={coverPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#444] text-sm">
                  Click to upload cover photo
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-lg">Change cover</span>
              </div>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex items-end gap-4">
            <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <img
                src={avatarPreview}
                alt=""
                className="w-20 h-20 rounded-full border-4 border-[#0a0a0a] bg-[#1a1a1a] object-cover"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            <div>
              <div className="text-white text-sm font-medium">{state.currentUser.name}</div>
              <div className="text-[#666] text-xs">@{state.currentUser.username}</div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[#a0a0a0] text-xs font-medium mb-1.5">Display Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-[#a0a0a0] text-xs font-medium mb-1.5">Username</label>
            <div className="flex items-center bg-[#1a1a1a] border border-[#262626] rounded-xl px-4 py-2.5 focus-within:border-[#e50914] transition-colors">
              <span className="text-[#444] text-sm">@</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="username"
                maxLength={20}
                className="flex-1 bg-transparent text-white text-sm placeholder-[#444] focus:outline-none ml-1"
              />
            </div>
            {usernameError && <p className="text-red-400 text-xs mt-1">{usernameError}</p>}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[#a0a0a0] text-xs font-medium mb-1.5">
              Bio <span className="text-[#444]">({bio.length}/160)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 160))}
              placeholder="Tell people about yourself..."
              rows={3}
              className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Branch & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#a0a0a0] text-xs font-medium mb-1.5">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value as Branch)}
                className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl px-4 py-2.5 text-white text-sm focus:border-[#e50914] focus:outline-none transition-colors"
              >
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="IT">IT</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Data Science">Data Science</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-xs font-medium mb-1.5">Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value as AcademicYear)}
                className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl px-4 py-2.5 text-white text-sm focus:border-[#e50914] focus:outline-none transition-colors"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>
          </div>

          {/* Graduation Year */}
          <div>
            <label className="block text-[#a0a0a0] text-xs font-medium mb-1.5">Graduation Year</label>
            <select
              value={graduationYear}
              onChange={(e) => setGraduationYear(Number(e.target.value))}
              className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl px-4 py-2.5 text-white text-sm focus:border-[#e50914] focus:outline-none transition-colors"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
              <option value={2028}>2028</option>
              <option value={2029}>2029</option>
              <option value={2030}>2030</option>
            </select>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-[#a0a0a0] text-xs font-medium mb-2">
              Interests <span className="text-[#444]">({selectedInterests.length} selected)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allInterests.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                    selectedInterests.includes(interest)
                      ? 'bg-[#e50914] text-white'
                      : 'bg-[#1a1a1a] border border-[#262626] text-[#666] hover:text-white hover:border-[#444]'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Looking For */}
          <div>
            <label className="block text-[#a0a0a0] text-xs font-medium mb-2">Looking For</label>
            <div className="flex flex-wrap gap-1.5">
              {lookingForOptions.map(item => (
                <button
                  key={item}
                  onClick={() => toggleLookingFor(item)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                    selectedLookingFor.includes(item)
                      ? 'bg-[#e50914]/15 text-[#e50914] border border-[#e50914]/30'
                      : 'bg-[#1a1a1a] border border-[#262626] text-[#666] hover:text-white hover:border-[#444]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[#262626] flex-shrink-0">
          <button onClick={handleClose} className="px-4 py-2 text-[#666] text-sm hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !isUsernameValid || saving}
            className="px-6 py-2 bg-[#e50914] hover:bg-[#ff1a25] disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all active:scale-95"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" />
                Saving...
              </span>
            ) : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
