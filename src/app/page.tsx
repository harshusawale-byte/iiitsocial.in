'use client';

import { useStore } from '../store/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const { state } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (state.isLoggedIn && state.isOnboarded) {
      router.push('/home');
    }
  }, [state.isLoggedIn, state.isOnboarded, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#e50914] opacity-[0.03] blur-[150px]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-fade-in">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#e50914] rounded-xl flex items-center justify-center shadow-lg shadow-[#e50914]/20">
              <span className="text-white font-bold text-xl">II</span>
            </div>
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-4">
          <span className="text-white">IIIT</span>
          <span className="text-[#e50914]">Social</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-[#a0a0a0] mb-3 font-light">
          Your IIIT. Your people. Your world.
        </p>

        {/* Subtitle */}
        <p className="text-base md:text-lg text-[#666] mb-12 max-w-xl mx-auto">
          A social world built exclusively around your IIIT life.
          <br />
          <span className="text-[#e50914]/70">Built by students, for students.</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 bg-[#e50914] hover:bg-[#ff1a25] text-white font-semibold text-lg rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#e50914]/25 active:scale-95 min-w-[240px]"
          >
            Enter IIIT Pune
          </button>
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 bg-transparent border border-[#333] hover:border-[#555] text-[#a0a0a0] hover:text-white font-medium text-lg rounded-xl transition-all duration-200 min-w-[240px]"
          >
            See how it works
          </button>
        </div>

        {/* Feature preview cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 text-left card-hover">
            <div className="text-3xl mb-3">🔥</div>
            <h3 className="text-white font-semibold mb-2">Trending</h3>
            <p className="text-[#666] text-sm">See what&apos;s happening across IIIT Pune in real-time</p>
          </div>
          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 text-left card-hover">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-white font-semibold mb-2">Connect</h3>
            <p className="text-[#666] text-sm">Find batchmates, seniors, alumni and build your network</p>
          </div>
          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 text-left card-hover">
            <div className="text-3xl mb-3">🗣️</div>
            <h3 className="text-white font-semibold mb-2">Discuss</h3>
            <p className="text-[#666] text-sm">Share opinions, ask questions, and start conversations</p>
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-[#333] text-sm">
          Currently at IIIT Pune · Coming to more IIITs soon
        </p>
      </div>
    </div>
  );
}
