'use client';

import type { Opportunity } from '../../types';

const CATEGORY_COLORS: Record<string, string> = {
  internships: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  hackathons: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  scholarships: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  research: 'bg-green-500/10 text-green-400 border-green-500/30',
  competitions: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  workshops: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  other: 'bg-[#666]/10 text-[#888] border-[#666]/30',
};

const CATEGORY_ICONS: Record<string, string> = {
  internships: '💼',
  hackathons: '🏆',
  scholarships: '🎓',
  research: '🔬',
  competitions: '🎯',
  workshops: '📚',
  other: '📌',
};

export default function OpportunityCard({
  opportunity,
  isSaved,
  savingId,
  onToggleSave,
  onClick,
}: {
  opportunity: Opportunity;
  isSaved: boolean;
  savingId: string | null;
  onToggleSave: (id: string) => void;
  onClick: () => void;
}) {
  const catColor = CATEGORY_COLORS[opportunity.category] || CATEGORY_COLORS.other;
  const catIcon = CATEGORY_ICONS[opportunity.category] || CATEGORY_ICONS.other;
  const deadline = opportunity.deadline ? new Date(opportunity.deadline) : null;
  const isDeadlineSoon = deadline && deadline.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 && deadline.getTime() > Date.now();

  return (
    <div
      className="bg-[#141414] border border-[#262626] rounded-xl p-4 animate-fade-in cursor-pointer hover:border-[#333] transition-colors"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${catColor}`}>
              {catIcon} {opportunity.category.charAt(0).toUpperCase() + opportunity.category.slice(1)}
            </span>
            {opportunity.application_method === 'external' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#666] border border-[#262626]">🔗 External</span>
            )}
          </div>
          <h3 className="text-white font-semibold text-sm line-clamp-2">{opportunity.title}</h3>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSave(opportunity.id); }}
          disabled={savingId === opportunity.id}
          className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
            isSaved
              ? 'text-[#e50914] bg-[#e50914]/10'
              : 'text-[#666] hover:text-white hover:bg-[#1a1a1a]'
          } ${savingId === opportunity.id ? 'opacity-50' : ''}`}
          title={isSaved ? 'Unsave' : 'Save'}
        >
          <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </button>
      </div>

      {/* Organizer */}
      <p className="text-[#a0a0a0] text-xs mt-2">by {opportunity.organizer}</p>

      {/* Description */}
      <p className="text-[#666] text-xs mt-1.5 line-clamp-2">{opportunity.description}</p>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] text-[#666]">
        {deadline && (
          <span className={`flex items-center gap-1 ${isDeadlineSoon ? 'text-yellow-400' : ''}`}>
            📅 {deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {isDeadlineSoon && <span className="text-yellow-400 font-medium">• Soon</span>}
          </span>
        )}
        {opportunity.location && (
          <span className="flex items-center gap-1">📍 {opportunity.location}</span>
        )}
      </div>

      {/* Skills */}
      {opportunity.required_skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {opportunity.required_skills.slice(0, 4).map(skill => (
            <span key={skill} className="text-[10px] px-2 py-0.5 bg-[#e50914]/10 text-[#e50914] rounded-full font-medium">{skill}</span>
          ))}
          {opportunity.required_skills.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 bg-white/5 text-[#666] rounded-full">+{opportunity.required_skills.length - 4}</span>
          )}
        </div>
      )}
    </div>
  );
}
