'use client';

import { useRouter } from 'next/navigation';
import ClickableAvatar from '../ui/ClickableAvatar';
import VerifiedBadge from './VerifiedBadge';
import type { RequestWithProfile } from './types';

const statusConfig = {
  pending: { label: 'Pending', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  accepted: { label: 'Accepted', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
};

export default function RequestCard({
  request,
  isIncoming,
  onAccept,
  onReject,
  onWithdraw,
  loadingAction,
}: {
  request: RequestWithProfile;
  isIncoming: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onWithdraw: (id: string) => void;
  loadingAction: string | null;
}) {
  const router = useRouter();
  const partnerId = isIncoming ? request.sender_id : request.receiver_id;
  const sc = statusConfig[request.status];
  const isLoading = loadingAction === request.id;

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <button onClick={() => router.push(`/profile?userId=${partnerId}`)} className="flex-shrink-0">
          <ClickableAvatar
            src={request.other_user_avatar}
            alt={request.other_user_name}
            className="w-11 h-11 rounded-full bg-[#1a1a1a]"
            userId={partnerId}
          />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => router.push(`/profile?userId=${partnerId}`)}
              className="text-white font-semibold text-sm hover:underline text-left"
            >
              {request.other_user_name}
            </button>
            {request.other_user_is_verified && <VerifiedBadge />}
          </div>
          <p className="text-[#666] text-xs mt-0.5">
            {request.other_user_branch} · {request.other_user_academic_year}
          </p>
          {request.message && (
            <p className="text-[#a0a0a0] text-xs mt-1.5 italic">&ldquo;{request.message}&rdquo;</p>
          )}
          {request.partner_project_title && (
            <div className="mt-2 p-2 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
              <p className="text-[#666] text-[10px] uppercase tracking-wider mb-0.5">Their Project</p>
              <p className="text-white text-xs font-medium">{request.partner_project_title}</p>
              {request.partner_project_description && (
                <p className="text-[#a0a0a0] text-[10px] mt-0.5 line-clamp-1">{request.partner_project_description}</p>
              )}
            </div>
          )}
          <p className="text-[#555] text-[10px] mt-1">
            {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color} ${sc.border}`}>
          {sc.label}
        </span>

        <div className="flex gap-2">
          {isIncoming && request.status === 'pending' && (
            <>
              <button
                onClick={() => onReject(request.id)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#333] text-[#a0a0a0] hover:text-red-400 hover:border-red-400 transition-all disabled:opacity-50"
              >
                {isLoading ? '...' : 'Reject'}
              </button>
              <button
                onClick={() => onAccept(request.id)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#e50914] text-white hover:bg-[#ff1a25] transition-all disabled:opacity-50"
              >
                {isLoading ? '...' : 'Accept'}
              </button>
            </>
          )}
          {isIncoming && request.status === 'accepted' && (
            <button
              onClick={() => router.push('/messages')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#262626] text-[#a0a0a0] hover:text-white hover:border-white transition-all"
            >
              💬 Message
            </button>
          )}
          {!isIncoming && request.status === 'pending' && (
            <button
              onClick={() => onWithdraw(request.id)}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#333] text-[#a0a0a0] hover:text-red-400 hover:border-red-400 transition-all disabled:opacity-50"
            >
              {isLoading ? '...' : 'Withdraw'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
