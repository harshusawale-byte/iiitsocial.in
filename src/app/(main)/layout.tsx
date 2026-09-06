'use client';

import { useStore } from '../../store/store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import RightPanel from '../../components/layout/RightPanel';
import MobileNav from '../../components/layout/MobileNav';
import CreateModal from '../../components/modals/CreateModal';
import CreateReelModal from '../../components/modals/CreateReelModal';
import StoryViewerPortal from '../../components/stories/StoryViewerPortal';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !state.isLoggedIn) {
      router.push('/login');
    } else if (mounted && !state.isOnboarded) {
      router.push('/onboarding');
    }
  }, [mounted, state.isLoggedIn, state.isOnboarded, router]);

  if (!mounted || !state.isLoggedIn || !state.isOnboarded) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-[#e50914] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[#666] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Get page title
  const pageTitle = (() => {
    if (pathname === '/home') return 'Home';
    if (pathname === '/explore') return 'Explore';
    if (pathname === '/discuss') return 'Discuss';
    if (pathname === '/people') return 'People';
    if (pathname === '/team-finder') return 'Team Finder';
    if (pathname === '/opportunity-hub') return 'Opportunity Hub';
    if (pathname === '/communities') return 'Communities';
    if (pathname === '/messages') return 'Messages';
    if (pathname === '/notifications') return 'Notifications';
    if (pathname === '/profile') return 'Profile';
    if (pathname === '/admin') return 'Moderation';
    if (pathname === '/reels') return 'Reels';
    if (pathname.startsWith('/blog')) return 'Blog';
    if (pathname.startsWith('/events')) return 'Events';
    return 'IIITSocial';
  })();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <RightPanel />
      <MobileNav />

      {/* Main content area */}
      <main className="lg:ml-[260px] xl:mr-[320px] pb-24 lg:pb-0 min-h-screen relative z-20">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-[#1a1a1a] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e50914] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">II</span>
            </div>
            <span className="text-white font-bold text-base">IIITSocial</span>
          </div>
          <button
            onClick={() => router.push('/notifications')}
            className="relative p-2 text-[#666] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {state.notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#e50914] rounded-full" />
            )}
          </button>
        </div>

        <div className="max-w-[680px] mx-auto">
          {children}
        </div>
      </main>

      {/* Create Modal */}
      {state.createModalOpen && state.createModalType === 'reel' ? (
        <CreateReelModal onClose={() => dispatch({ type: 'SET_CREATE_MODAL', open: false })} />
      ) : state.createModalOpen ? (
        <CreateModal />
      ) : null}

      {/* Story Viewer (portal renders at body level) */}
      {state.storyViewerOpen && state.storyViewerAuthorId && (() => {
        const stories = state.stories.filter(s => s.authorId === state.storyViewerAuthorId && new Date(s.expiresAt) > new Date());
        return stories.length > 0 ? (
          <StoryViewerPortal stories={stories} onClose={() => dispatch({ type: 'SET_STORY_VIEWER', open: false })} />
        ) : null;
      })()}
    </div>
  );
}
