'use client';

import { useState } from 'react';
import type { Opportunity } from '../../types';

const CATEGORY_ICONS: Record<string, string> = {
  internships: '💼', hackathons: '🏆', scholarships: '🎓', research: '🔬',
  competitions: '🎯', workshops: '📚', other: '📌',
};

export default function OpportunityDetailModal({
  opportunity,
  isSaved,
  savingId,
  hasApplied,
  onToggleSave,
  onApply,
  onClose,
}: {
  opportunity: Opportunity;
  isSaved: boolean;
  savingId: string | null;
  hasApplied: boolean;
  onToggleSave: (id: string) => void;
  onApply: (opportunityId: string, message?: string) => Promise<{ error: string | null }>;
  onClose: () => void;
}) {
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const catIcon = CATEGORY_ICONS[opportunity.category] || CATEGORY_ICONS.other;
  const deadline = opportunity.deadline ? new Date(opportunity.deadline) : null;
  const isExternal = opportunity.application_method === 'external';

  const handleApply = async () => {
    setApplying(true);
    setApplyError(null);

    if (isExternal) {
      if (opportunity.application_url) window.open(opportunity.application_url, '_blank', 'noopener,noreferrer');
      setApplying(false);
      return;
    }

    // Internal application
    const result = await onApply(opportunity.id, applyMessage);
    setApplying(false);

    if (result.error) {
      setApplyError(result.error);
    } else {
      setApplySuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-[#141414] border border-[#262626] rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-[#262626] flex-shrink-0">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{catIcon}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#666] border border-[#262626]">
                {opportunity.category.charAt(0).toUpperCase() + opportunity.category.slice(1)}
              </span>
              {isExternal && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#666] border border-[#262626]">🔗 External</span>
              )}
            </div>
            <h3 className="text-white font-semibold text-base">{opportunity.title}</h3>
            <p className="text-[#a0a0a0] text-xs mt-1">by {opportunity.organizer}</p>
          </div>
          <button onClick={onClose} className="text-[#666] hover:text-white text-lg leading-none flex-shrink-0">×</button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Description */}
          <div>
            <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{opportunity.description}</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {deadline && (
              <div className="bg-[#0a0a0a] rounded-xl p-3 border border-[#1a1a1a]">
                <p className="text-[#666] text-[10px] uppercase tracking-wider mb-1">Deadline</p>
                <p className="text-white text-sm">{deadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            )}
            {opportunity.location && (
              <div className="bg-[#0a0a0a] rounded-xl p-3 border border-[#1a1a1a]">
                <p className="text-[#666] text-[10px] uppercase tracking-wider mb-1">Location</p>
                <p className="text-white text-sm">{opportunity.location}</p>
              </div>
            )}
            {opportunity.eligibility && (
              <div className="bg-[#0a0a0a] rounded-xl p-3 border border-[#1a1a1a] col-span-2">
                <p className="text-[#666] text-[10px] uppercase tracking-wider mb-1">Eligibility</p>
                <p className="text-white text-sm">{opportunity.eligibility}</p>
              </div>
            )}
          </div>

          {/* Skills */}
          {opportunity.required_skills.length > 0 && (
            <div>
              <p className="text-[#666] text-[10px] uppercase tracking-wider mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.required_skills.map(skill => (
                  <span key={skill} className="text-[11px] px-2.5 py-1 bg-[#e50914]/10 text-[#e50914] rounded-full font-medium">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Internal application form */}
          {!isExternal && !hasApplied && !applySuccess && (
            <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#1a1a1a]">
              <p className="text-[#666] text-[10px] uppercase tracking-wider mb-2">Application Message (optional)</p>
              <textarea
                value={applyMessage}
                onChange={e => setApplyMessage(e.target.value)}
                rows={3}
                placeholder="Tell them why you're a great fit..."
                className="w-full bg-[#141414] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors resize-none"
              />
            </div>
          )}

          {/* Apply success */}
          {applySuccess && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
              <p className="text-green-400 text-sm font-medium">✅ Application submitted!</p>
              <p className="text-green-400/60 text-xs mt-1">You can track it in My Applications.</p>
            </div>
          )}

          {/* Apply error */}
          {applyError && (
            <p className="text-red-400 text-xs">{applyError}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-[#262626] flex-shrink-0">
          <button
            onClick={() => onToggleSave(opportunity.id)}
            disabled={savingId === opportunity.id}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              isSaved
                ? 'border-[#e50914]/30 bg-[#e50914]/10 text-[#e50914]'
                : 'border-[#262626] text-[#666] hover:text-white hover:border-[#444]'
            }`}
          >
            {isSaved ? '★ Saved' : '☆ Save'}
          </button>

          {hasApplied ? (
            <div className="flex-1 px-4 py-2.5 text-center text-sm font-medium text-green-400 bg-green-500/10 border border-green-500/30 rounded-xl">
              ✅ Applied
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying || applySuccess}
              className="flex-1 px-4 py-2.5 bg-[#e50914] hover:bg-[#ff1a25] text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {applying ? 'Applying...' : isExternal ? '🔗 Apply Now' : '📝 Apply on IIITSocial'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
