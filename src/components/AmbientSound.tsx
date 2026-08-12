'use client';

import { useState, useRef, useEffect } from 'react';
import { Music } from 'lucide-react';

export function AmbientSound() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    // Initialize the audio element
    const audio = new Audio('/Timeless (Instrumental).mp3');
    audio.loop = true;
    audio.volume = 0.05; // Very low/dimmed volume
    audioRef.current = audio;

    const startAudio = () => {
      if (!isPlayingRef.current) {
        audio.play().then(() => {
          setIsPlaying(true);
          isPlayingRef.current = true;
          // Only remove listeners if playback actually succeeded
          document.removeEventListener('click', startAudio);
          document.removeEventListener('keydown', startAudio);
          document.removeEventListener('touchstart', startAudio);
        }).catch(() => {
          // Playback failed (browser blocked it). Listeners remain active for the next interaction.
        });
      }
    };

    // Attempt autoplay immediately
    audio.play().then(() => {
      setIsPlaying(true);
      isPlayingRef.current = true;
    }).catch(() => {
      // Browsers block autoplay. Wait for a valid user interaction.
      document.addEventListener('click', startAudio);
      document.addEventListener('keydown', startAudio);
      document.addEventListener('touchstart', startAudio);
    });

    return () => {
      audio.pause();
      audio.src = '';
      document.removeEventListener('click', startAudio);
      document.removeEventListener('keydown', startAudio);
      document.removeEventListener('touchstart', startAudio);
    };
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      setIsPlaying(true);
      isPlayingRef.current = true;
    }
  };

  return (
    <button
      onClick={toggleSound}
      className={`ambient-btn ${isPlaying ? 'is-playing' : ''}`}
      title={isPlaying ? "Pause Background Music" : "Play Background Music"}
    >
      {isPlaying ? (
        <div className="visualizer-container">
           <div className="visualizer-bar animate-visualizer-1" style={{ height: '80%' }} />
           <div className="visualizer-bar animate-visualizer-2" style={{ height: '100%' }} />
           <div className="visualizer-bar animate-visualizer-3" style={{ height: '60%' }} />
           <div className="visualizer-bar animate-visualizer-4" style={{ height: '90%' }} />
        </div>
      ) : (
        <Music size={18} />
      )}
    </button>
  );
}
