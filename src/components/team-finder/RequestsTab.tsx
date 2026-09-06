'use client';

import RequestCard from './RequestCard';
import SkeletonGrid from './SkeletonGrid';
import type { RequestWithProfile } from './types';

export default function RequestsTab({
  incomingRequests, outgoingRequests, loading, error, loadingAction,
  onAccept, onReject, onWithdraw, onRetry,
}: {
  incomingRequests: RequestWithProfile[];
  outgoingRequests: RequestWithProfile[];
  loading: boolean;
  error: string | null;
  loadingAction: string | null;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onWithdraw: (id: string) => void;
  onRetry: () => void;
}) {
  if (loading) return <SkeletonGrid />;

  if (error) {
    return (
      <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 text-center">
        <p className="text-red-400 text-sm mb-2">{error}</p>
        <button onClick={onRetry} className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#e50914] text-white hover:bg-[#ff1a25] transition-all">Retry</button>
      </div>
    );
  }

  const pendingCount = incomingRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-4">
      {/* Incoming */}
      <div>
        <h3 className="text-white text-sm font-semibold mb-2 flex items-center gap-1.5">
          <span>📥</span> Incoming Requests
          {pendingCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-[#e50914] text-white rounded-full font-bold">{pendingCount}</span>
          )}
        </h3>
        {incomingRequests.length === 0 ? (
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 text-center">
            <p className="text-[#666] text-xs">No incoming requests yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {incomingRequests.map(req => (
              <RequestCard key={req.id} request={req} isIncoming={true}
                onAccept={onAccept} onReject={onReject} onWithdraw={onWithdraw} loadingAction={loadingAction} />
            ))}
          </div>
        )}
      </div>

      {/* Outgoing */}
      <div>
        <h3 className="text-white text-sm font-semibold mb-2 flex items-center gap-1.5">
          <span>📤</span> Sent Requests
        </h3>
        {outgoingRequests.length === 0 ? (
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 text-center">
            <p className="text-[#666] text-xs">You haven&apos;t sent any requests yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {outgoingRequests.map(req => (
              <RequestCard key={req.id} request={req} isIncoming={false}
                onAccept={onAccept} onReject={onReject} onWithdraw={onWithdraw} loadingAction={loadingAction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
