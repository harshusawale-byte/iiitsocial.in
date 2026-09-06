'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import ClickableAvatar from '../ui/ClickableAvatar';
import type { TeamFinderProfileWithUser } from './types';

export default function SendRequestModal({
  targetUser,
  onClose,
  onSent,
}: {
  targetUser: TeamFinderProfileWithUser;
  onClose: () => void;
  onSent: () => void;
}) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setSending(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Not authenticated.');
      setSending(false);
      return;
    }

    if (user.id === targetUser.id) {
      setError('You cannot send a request to yourself.');
      setSending(false);
      return;
    }

    const { data: existing } = await supabase
      .from('team_requests')
      .select('id')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUser.id}),and(sender_id.eq.${targetUser.id},receiver_id.eq.${user.id})`)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      setError('A pending request already exists with this student.');
      setSending(false);
      return;
    }

    const { error: insertError } = await supabase.from('team_requests').insert({
      sender_id: user.id,
      receiver_id: targetUser.id,
      message: message.trim() || null,
      status: 'pending',
    });

    setSending(false);
    if (insertError) {
      setError('Failed to send request. Please try again.');
    } else {
      onSent();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-[#141414] border border-[#262626] rounded-2xl w-full max-w-md p-5 animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-base">🤝 Send Team Request</h3>
          <button onClick={onClose} className="text-[#666] hover:text-white text-lg leading-none">×</button>
        </div>

        <div className="flex items-center gap-3 mb-4 p-3 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a]">
          <ClickableAvatar
            src={targetUser.user_avatar}
            alt={targetUser.user_name}
            className="w-10 h-10 rounded-full bg-[#1a1a1a]"
            userId={targetUser.id}
          />
          <div>
            <p className="text-white text-sm font-medium">{targetUser.user_name}</p>
            <p className="text-[#666] text-xs">@{targetUser.user_username}</p>
          </div>
        </div>

        {targetUser.project_title && (
          <div className="mb-4 p-3 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a]">
            <p className="text-[#666] text-[10px] uppercase tracking-wider mb-1">Their Project</p>
            <p className="text-white text-sm font-medium">{targetUser.project_title}</p>
            {targetUser.project_description && (
              <p className="text-[#a0a0a0] text-xs mt-1 line-clamp-2">{targetUser.project_description}</p>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="text-[#666] text-xs mb-1 block">Message (optional)</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            placeholder="Hi! I'd like to join your team..."
            className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-[#262626] text-[#a0a0a0] text-sm font-medium rounded-xl hover:text-white hover:border-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex-1 px-4 py-2.5 bg-[#e50914] hover:bg-[#ff1a25] text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
