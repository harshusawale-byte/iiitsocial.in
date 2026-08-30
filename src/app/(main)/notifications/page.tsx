'use client';

import { useStore } from '../../../store/store';
import EmptyState from '../../../components/ui/EmptyState';

export default function NotificationsPage() {
  const { state, dispatch } = useStore();
  const markAllRead = () => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return '❤️'; case 'comment': return '💬'; case 'follow': return '👤';
      case 'connection': return '🤝'; case 'mention': return '@'; case 'trending': return '🔥';
      case 'community': return '👥'; case 'event': return '📅'; case 'message': return '✉️';
      case 'moderation': return '🛡️'; default: return '📌';
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-[#1a1a1a] px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Notifications</h1>
        {state.notifications.some(n => !n.isRead) && (
          <button onClick={markAllRead} className="text-[#e50914] text-xs font-medium hover:underline">Mark all read</button>
        )}
      </div>
      {state.notifications.length === 0 ? (
        <EmptyState icon="🔔" title="You're all caught up" description="No new notifications right now. When someone interacts with you, you'll see it here." />
      ) : (
        <div>
          {state.notifications.map(notification => (
            <button key={notification.id}
              onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', notificationId: notification.id })}
              className={`w-full flex items-start gap-3 px-4 py-3 border-b border-[#1a1a1a] transition-colors text-left ${notification.isRead ? 'bg-transparent' : 'bg-[#e50914]/[0.03]'} hover:bg-[#141414]`}>
              <span className="text-lg mt-0.5">{getNotificationIcon(notification.type)}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notification.isRead ? 'text-[#a0a0a0]' : 'text-white'}`}>{notification.content}</p>
                <span className="text-[#444] text-xs mt-0.5 block">{timeAgo(notification.createdAt)}</span>
              </div>
              {!notification.isRead && <div className="w-2 h-2 bg-[#e50914] rounded-full mt-2 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
