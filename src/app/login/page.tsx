'use client';

import { useStore } from '../../store/store';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LoginPage() {
  const { state, login, register } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.isLoggedIn && state.isOnboarded) {
      router.push('/home');
    }
  }, [state.isLoggedIn, state.isOnboarded, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (!email || !password) {
        setError('Please enter your credentials');
        setLoading(false);
        return;
      }

      if (isRegister) {
        register(email, password);
        router.push('/onboarding');
      } else {
        // Check if user already exists to decide redirect
        login(email, password);
        // After login, check localStorage directly since state won't update yet
        try {
          const raw = localStorage.getItem('iiitsocial_state');
          if (raw) {
            const parsed = JSON.parse(raw);
            const existingUser = parsed.users?.find((u: { email: string }) => u.email === email);
            router.push(parsed.isOnboarded ? '/home' : '/onboarding');
          } else {
            router.push('/onboarding');
          }
        } catch {
          router.push('/onboarding');
        }
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#e50914] opacity-[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="mb-8 text-[#666] hover:text-white transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#e50914] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">II</span>
            </div>
            <span className="text-white font-bold text-xl">IIITSocial</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-2">Enter your IIIT</h1>
        <p className="text-[#666] mb-8">Verify your IIIT identity to join the community</p>

        {/* Prototype notice */}
        <div className="bg-[#e50914]/5 border border-[#e50914]/20 rounded-lg p-3 mb-6">
          <p className="text-[#e50914] text-xs font-medium">⚡ Prototype mode — any credentials are accepted</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#a0a0a0] text-sm mb-2 font-medium">
              Student ID / Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.id@iiitpune.ac.in"
              className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-3.5 text-white placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#a0a0a0] text-sm mb-2 font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-3.5 text-white placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-[#e50914] text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e50914] hover:bg-[#ff1a25] disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#e50914]/25 active:scale-[0.98]"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </span>
            ) : (
              'Enter IIITSocial'
            )}
          </button>
        </form>

        {/* Toggle register/login */}
        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-[#666] hover:text-[#a0a0a0] text-sm transition-colors"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>

        {/* Verification badge preview */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[#444] text-xs">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          ✓ IIIT Pune Verification System
        </div>
      </div>
    </div>
  );
}
