'use client';

export default function SkeletonGrid() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-[#141414] border border-[#262626] rounded-xl p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-[#1a1a1a] rounded" />
              <div className="h-3 w-48 bg-[#1a1a1a] rounded" />
              <div className="h-3 w-64 bg-[#1a1a1a] rounded" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full bg-[#1a1a1a] rounded" />
            <div className="h-3 w-3/4 bg-[#1a1a1a] rounded" />
          </div>
          <div className="flex gap-2 mt-3">
            <div className="h-8 w-20 bg-[#1a1a1a] rounded-lg" />
            <div className="h-8 w-16 bg-[#1a1a1a] rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
