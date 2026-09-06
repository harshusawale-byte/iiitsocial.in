'use client';

export default function SkeletonGrid() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-[#141414] border border-[#262626] rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 bg-[#262626] rounded-full w-16" />
            <div className="h-4 bg-[#262626] rounded-full w-12" />
          </div>
          <div className="h-4 bg-[#262626] rounded w-3/4 mb-2" />
          <div className="h-3 bg-[#262626] rounded w-1/3 mb-2" />
          <div className="h-3 bg-[#262626] rounded w-full mb-1" />
          <div className="h-3 bg-[#262626] rounded w-2/3 mb-3" />
          <div className="flex gap-1.5">
            <div className="h-4 bg-[#262626] rounded-full w-14" />
            <div className="h-4 bg-[#262626] rounded-full w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
