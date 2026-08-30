'use client';

import { useStore } from '../../store/store';
import { useState, useRef, useEffect, useCallback } from 'react';

interface CreateReelModalProps {
  onClose: () => void;
}

export default function CreateReelModal({ onClose }: CreateReelModalProps) {
  const { createReel } = useStore();
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(15);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const MAX_DURATION = 15;

  // Clean up recording interval
  useEffect(() => {
    return () => {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setVideoSrc(src);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoLoaded = useCallback(() => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setVideoDuration(dur);
      setTrimEnd(Math.min(MAX_DURATION, dur));
    }
  }, []);

  // Recording simulation (for prototype — records screen/camera if available)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      setIsRecording(true);
      setRecordingTime(0);

      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_DURATION) {
            stopRecording();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);

      // Auto-stop after MAX_DURATION
      setTimeout(() => {
        if (recordingInterval.current) stopRecording();
      }, MAX_DURATION * 1000);
    } catch {
      // Camera not available, show a friendly message
      alert('Camera access not available. Please upload a video instead.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
  };

  const handlePost = () => {
    if (!videoSrc) return;
    const tags = hashtags.split(/[,\s]+/).filter(h => h.length > 0).map(h => h.replace(/^#/, ''));
    createReel(videoSrc, caption, tags, MAX_DURATION);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#141414] rounded-2xl w-full max-w-lg overflow-hidden border border-[#262626] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a] sticky top-0 bg-[#141414] z-10">
          <button onClick={onClose} className="text-[#666] hover:text-white transition-colors text-sm">
            Cancel
          </button>
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            🎬 Create Reel
            <span className="text-[10px] bg-[#e50914]/20 text-[#e50914] px-1.5 py-0.5 rounded-full font-medium">
              {MAX_DURATION}s max
            </span>
          </h2>
          <button
            onClick={handlePost}
            disabled={!videoSrc}
            className="bg-[#e50914] hover:bg-[#ff1a25] text-white font-semibold text-sm px-4 py-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Post
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {!videoSrc ? (
            <div className="space-y-4">
              {/* Recording option */}
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="w-full aspect-video bg-[#1a1a1a] border-2 border-dashed border-[#333] rounded-xl flex flex-col items-center justify-center gap-3 hover:border-[#e50914]/50 transition-colors group"
                >
                  <div className="w-16 h-16 rounded-full bg-[#e50914]/10 flex items-center justify-center group-hover:bg-[#e50914]/20 transition-colors">
                    <svg className="w-8 h-8 text-[#e50914]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium text-sm">Record a Reel</p>
                    <p className="text-[#666] text-xs mt-0.5">Up to {MAX_DURATION} seconds</p>
                  </div>
                </button>
              ) : (
                /* Recording active */
                <div className="w-full aspect-video bg-red-900/20 border-2 border-[#e50914] rounded-xl flex flex-col items-center justify-center gap-3 relative">
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-400 text-xs font-medium">REC</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="text-white text-lg font-mono font-bold">
                      {formatTime(recordingTime)} / {formatTime(MAX_DURATION)}
                    </span>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-[#e50914] flex items-center justify-center animate-pulse">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  </div>
                  <p className="text-white/60 text-sm">
                    {recordingTime >= MAX_DURATION ? 'Maximum duration reached' : 'Recording...'}
                  </p>
                  {/* Progress bar */}
                  <div className="w-3/4 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#e50914] rounded-full transition-all duration-1000"
                      style={{ width: `${(recordingTime / MAX_DURATION) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#262626]" />
                <span className="text-[#555] text-xs">OR</span>
                <div className="flex-1 h-px bg-[#262626]" />
              </div>

              {/* Upload option */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 py-4 bg-[#1a1a1a] border border-[#262626] rounded-xl text-white text-sm font-medium hover:bg-[#222] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Upload a video (up to {MAX_DURATION}s)
              </button>
              <p className="text-[#555] text-xs text-center">
                Videos longer than {MAX_DURATION}s will be trimmed to the first {MAX_DURATION} seconds
              </p>
            </div>
          ) : (
            /* Video preview */
            <div className="space-y-4">
              {/* Video preview */}
              <div className="relative">
                <video
                  ref={videoRef}
                  src={videoSrc}
                  controls
                  onLoadedMetadata={handleVideoLoaded}
                  className="w-full aspect-[9/16] max-h-[350px] rounded-xl bg-black object-contain"
                />
                <button
                  onClick={() => setVideoSrc(null)}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {videoDuration > MAX_DURATION && (
                  <div className="absolute bottom-3 left-3 bg-black/60 rounded-lg px-2 py-1">
                    <span className="text-yellow-400 text-xs font-medium">
                      ⚠️ Will be trimmed to {MAX_DURATION}s
                    </span>
                  </div>
                )}
                <div className="absolute bottom-3 right-3 bg-black/60 rounded-lg px-2 py-1">
                  <span className="text-white text-xs">
                    {formatTime(Math.min(videoDuration, MAX_DURATION))} / {formatTime(MAX_DURATION)}
                  </span>
                </div>
              </div>

              {/* Trim controls */}
              {videoDuration > MAX_DURATION && (
                <div className="bg-[#1a1a1a] rounded-xl p-4">
                  <p className="text-[#666] text-xs mb-3">Trim to {MAX_DURATION} seconds (starts from beginning)</p>
                  <div className="relative">
                    <div className="h-2 bg-[#333] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#e50914] rounded-full"
                        style={{ width: `${(MAX_DURATION / videoDuration) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[#666] text-[10px]">0:00</span>
                      <span className="text-[#e50914] text-[10px] font-medium">{formatTime(MAX_DURATION)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Caption */}
              <div>
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Write a caption for your reel..."
                  maxLength={300}
                  rows={3}
                  className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-[#e50914]/50 transition-colors resize-none"
                />
                <p className="text-[#555] text-xs text-right mt-1">{caption.length}/300</p>
              </div>

              {/* Hashtags */}
              <div>
                <input
                  type="text"
                  value={hashtags}
                  onChange={e => setHashtags(e.target.value)}
                  placeholder="Hashtags (comma separated): coding, hackathon, iiitpune"
                  className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-[#e50914]/50 transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
