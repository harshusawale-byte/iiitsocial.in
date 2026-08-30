'use client';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-[#666] text-sm max-w-xs mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 bg-[#e50914] hover:bg-[#ff1a25] text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
