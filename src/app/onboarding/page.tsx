'use client';

import { useStore } from '../../store/store';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Branch, AcademicYear } from '../../types';

const steps = ['welcome', 'university', 'profile', 'interests', 'findPeople', 'enter'];
const interests = [
  '💻 Coding', '🤖 AI', '🎮 Gaming', '🎵 Music', '🏏 Sports', '🎬 Movies',
  '📸 Photography', '🏆 Hackathons', '😂 Memes', '🧠 Academics', '🎨 Design',
  '🚀 Startups', '📚 Reading', '🏃 Fitness', '🌐 Web Dev', '📱 Mobile Dev',
  '🔐 Security', '☁️ Cloud', '🎸 Guitar', '♟️ Chess', '✈️ Travel', '🍳 Cooking'
];

export default function OnboardingPage() {
  const { state, completeOnboarding, logout } = useStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [branch, setBranch] = useState<Branch>('CSE');
  const [year, setYear] = useState<AcademicYear>('1st Year');
  const [gradYear, setGradYear] = useState(2029);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    if (!state.isLoggedIn) router.push('/login');
    if (state.isOnboarded) router.push('/home');
  }, [state.isLoggedIn, state.isOnboarded, router]);

  const currentStep = steps[step];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const nextStep = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const finish = () => {
    completeOnboarding({
      name: name || state.currentUser?.name || 'Student',
      branch,
      academicYear: year,
      graduationYear: gradYear,
      interests: selectedInterests,
    });
    router.push('/home');
  };

  const suggestedPeople = state.users.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#e50914] opacity-[0.02] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg animate-fade-in">
        {/* Progress bar */}
        <div className="flex gap-1 mb-8">
          {steps.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-[#262626]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  i <= step ? 'bg-[#e50914]' : 'bg-transparent'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Step: Welcome */}
        {currentStep === 'welcome' && (
          <div className="text-center animate-slide-up">
            <div className="text-6xl mb-6">👋</div>
            <h1 className="text-3xl font-bold mb-3">Welcome to IIITSocial</h1>
            <p className="text-[#666] mb-8">Let&apos;s set up your profile in less than 2 minutes</p>
            <button
              onClick={nextStep}
              className="px-8 py-3.5 bg-[#e50914] hover:bg-[#ff1a25] text-white font-semibold rounded-xl transition-all active:scale-95"
            >
              Get Started
            </button>
          </div>
        )}

        {/* Step: University */}
        {currentStep === 'university' && (
          <div className="animate-slide-up">
            <h1 className="text-2xl font-bold mb-2">Select your IIIT</h1>
            <p className="text-[#666] mb-8">Choose your university to join the community</p>
            <button
              onClick={nextStep}
              className="w-full bg-[#141414] border-2 border-[#e50914] rounded-xl p-5 text-left mb-3 flex items-center gap-4 hover:bg-[#1a1a1a] transition-colors"
            >
              <div className="w-12 h-12 bg-[#e50914] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">IP</span>
              </div>
              <div>
                <div className="text-white font-semibold">IIIT Pune</div>
                <div className="text-[#666] text-sm">Active community · Growing fast</div>
              </div>
              <svg className="w-5 h-5 text-[#e50914] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(step - 1)} className="px-6 py-3 border border-[#333] text-[#666] rounded-xl hover:text-white hover:border-[#555] transition-colors">
                Back
              </button>
              <button onClick={nextStep} className="px-6 py-3 bg-[#e50914] hover:bg-[#ff1a25] text-white font-semibold rounded-xl transition-all flex-1">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step: Profile */}
        {currentStep === 'profile' && (
          <div className="animate-slide-up">
            <h1 className="text-2xl font-bold mb-2">Set up your profile</h1>
            <p className="text-[#666] mb-8">Tell us about yourself</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[#a0a0a0] text-sm mb-2">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#a0a0a0] text-sm mb-2">Branch</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value as Branch)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-3 text-white focus:border-[#e50914] focus:outline-none transition-colors"
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="IT">IT</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#a0a0a0] text-sm mb-2">Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value as AcademicYear)}
                    className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-3 text-white focus:border-[#e50914] focus:outline-none transition-colors"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#a0a0a0] text-sm mb-2">Graduation Year</label>
                  <select
                    value={gradYear}
                    onChange={(e) => setGradYear(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-3 text-white focus:border-[#e50914] focus:outline-none transition-colors"
                  >
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                    <option value={2028}>2028</option>
                    <option value={2029}>2029</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(step - 1)} className="px-6 py-3 border border-[#333] text-[#666] rounded-xl hover:text-white hover:border-[#555] transition-colors">
                Back
              </button>
              <button onClick={nextStep} className="px-6 py-3 bg-[#e50914] hover:bg-[#ff1a25] text-white font-semibold rounded-xl transition-all flex-1">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step: Interests */}
        {currentStep === 'interests' && (
          <div className="animate-slide-up">
            <h1 className="text-2xl font-bold mb-2">Choose your interests</h1>
            <p className="text-[#666] mb-6">Select at least 5 to personalize your feed</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {interests.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedInterests.includes(interest)
                      ? 'bg-[#e50914] text-white'
                      : 'bg-[#141414] border border-[#262626] text-[#a0a0a0] hover:border-[#444] hover:text-white'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            <p className="text-[#444] text-xs mb-6">{selectedInterests.length}/5 minimum selected</p>
            <div className="flex gap-3">
              <button onClick={() => setStep(step - 1)} className="px-6 py-3 border border-[#333] text-[#666] rounded-xl hover:text-white hover:border-[#555] transition-colors">
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={selectedInterests.length < 5}
                className="px-6 py-3 bg-[#e50914] hover:bg-[#ff1a25] disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex-1"
              >
                Continue ({selectedInterests.length}/5)
              </button>
            </div>
          </div>
        )}

        {/* Step: Find People */}
        {currentStep === 'findPeople' && (
          <div className="animate-slide-up">
            <h1 className="text-2xl font-bold mb-2">Find your people</h1>
            <p className="text-[#666] mb-6">Students you might want to connect with</p>
            <div className="space-y-3 mb-8">
              {suggestedPeople.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">👥</div>
                  <p className="text-[#666] text-sm">No other students yet</p>
                  <p className="text-[#444] text-xs mt-1">You'll see your batchmates here as they join IIITSocial</p>
                </div>
              ) : (
                suggestedPeople.map(user => (
                  <div key={user.id} className="bg-[#141414] border border-[#262626] rounded-xl p-4 flex items-center gap-3">
                    <img src={user.avatar} alt="" className="w-10 h-10 rounded-full bg-[#1a1a1a]" />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{user.name}</div>
                      <div className="text-[#666] text-xs">{user.branch} · {user.academicYear}</div>
                    </div>
                    {user.isVerified && (
                      <span className="text-[#e50914] text-xs">✓ IIIT Pune</span>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(step - 1)} className="px-6 py-3 border border-[#333] text-[#666] rounded-xl hover:text-white hover:border-[#555] transition-colors">
                Back
              </button>
              <button onClick={nextStep} className="px-6 py-3 bg-[#e50914] hover:bg-[#ff1a25] text-white font-semibold rounded-xl transition-all flex-1">
                Looks good!
              </button>
            </div>
          </div>
        )}

        {/* Step: Enter */}
        {currentStep === 'enter' && (
          <div className="text-center animate-slide-up">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold mb-3">You&apos;re all set!</h1>
            <p className="text-[#666] mb-4">Welcome to IIITSocial, {name || 'Student'}</p>
            <div className="inline-flex items-center gap-2 bg-[#141414] border border-[#262626] rounded-full px-4 py-2 mb-8">
              <svg className="w-4 h-4 text-[#e50914]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0c.49.401 1.003.703 1.545.857a3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-[#a0a0a0] text-sm">✓ IIIT Pune Verified</span>
            </div>
            <br />
            <button
              onClick={finish}
              className="px-8 py-3.5 bg-[#e50914] hover:bg-[#ff1a25] text-white font-semibold rounded-xl transition-all active:scale-95"
            >
              Enter IIITSocial 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
