'use client';

import { useStore } from '../../store/store';
import { useRouter } from 'next/navigation';
import ClickableAvatar from '../ui/ClickableAvatar';

export default function RightPanel() {
  const { state } = useStore();
  const router = useRouter();

  const otherUsers = state.users.filter(u => u.id !== state.currentUser?.id && !state.currentUser?.following.includes(u.id)).slice(0, 4);
  const trending = state.trendingTopics.slice(0, 5);
  const upcomingEvents = state.events.slice(0, 3);
  const onlineCount = state.users.filter(u => u.isOnline).length;

  return (
    <aside className="fixed right-0 top-0 bottom-0 w-[320px] bg-[#0a0a0a] border-l border-[#1a1a1a] flex flex-col overflow-y-auto z-20 hidden xl:flex">
      <div className="p-5 space-y-6">
        {/* Campus Status */}
        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-4">
          <h3 className="text-white font-semibold text-sm mb-3">🏫 IIIT Pune</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#a0a0a0]">
              <span className="w-2 h-2 bg-[#666] rounded-full" />
              <span>{onlineCount > 0 ? `${onlineCount} student${onlineCount !== 1 ? 's' : ''} online` : 'No one online yet'}</span>
            </div>
            <div className="text-xs text-[#666]">{state.posts.length} post{state.posts.length !== 1 ? 's' : ''}</div>
            <div className="text-xs text-[#666]">{state.discussions.length} discussion{state.discussions.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Trending */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">🔥 Trending</h3>
            {trending.length > 0 && <button onClick={() => router.push('/explore')} className="text-[#e50914] text-xs hover:underline">See all</button>}
          </div>
          {trending.length === 0 ? (
            <p className="text-[#444] text-xs">Nothing is trending yet</p>
          ) : (
            <div className="space-y-2">
              {trending.map(topic => (
                <button key={topic.id} onClick={() => router.push('/explore')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#141414] transition-colors text-left">
                  <div>
                    <div className="text-white text-sm font-medium">{topic.tag}</div>
                    <div className="text-[#666] text-xs">{topic.postCount} posts</div>
                  </div>
                  {topic.isRising && <span className="text-[10px] px-1.5 py-0.5 bg-[#e50914]/10 text-[#e50914] rounded font-medium">RISING</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Suggested People */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">👥 People you may know</h3>
            {otherUsers.length > 0 && <button onClick={() => router.push('/people')} className="text-[#e50914] text-xs hover:underline">See all</button>}
          </div>
          {otherUsers.length === 0 ? (
            <p className="text-[#444] text-xs">No students to show yet. Invite your batchmates!</p>
          ) : (
            <div className="space-y-2">
              {otherUsers.map(user => (
                <div key={user.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#141414] transition-colors">
                  <ClickableAvatar src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full bg-[#1a1a1a]" />
                  <div className="flex-1 min-w-0">
                    <button onClick={() => router.push(`/profile?userId=${user.id}`)} className="text-white text-sm font-medium truncate flex items-center gap-1 hover:underline text-left">
                      {user.name}
                      {user.isVerified && <svg className="w-3.5 h-3.5 text-[#e50914] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0c.49.401 1.003.703 1.545.857a3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                    </button>
                    <div className="text-[#666] text-xs truncate">{user.branch} · {user.academicYear}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">📅 Upcoming</h3>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-[#444] text-xs">No upcoming events</p>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map(event => (
                <div key={event.id} className="p-2.5 rounded-xl hover:bg-[#141414] transition-colors cursor-pointer">
                  <div className="text-white text-sm font-medium mb-0.5">{event.title}</div>
                  <div className="text-[#666] text-xs">{event.date} · {event.interested.length} interested</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-[#333] text-xs space-y-1 pt-4 border-t border-[#1a1a1a]">
          <p>© 2025 IIITSocial</p>
          <p>Built by students, for students</p>
        </div>
      </div>
    </aside>
  );
}
