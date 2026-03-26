'use client';

import { useRef, useEffect } from 'react';
import shaka from 'shaka-player';

interface ShakaPlayerProps {
  src: string;
  poster?: string;
  autoplay?: boolean;
}

export default function ShakaPlayer({ src, poster, autoplay = false }: ShakaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<shaka.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initPlayer = async () => {
      if (!videoRef.current || !containerRef.current) return;

      shaka.polyfill.installAll();

      if (shaka.Player.isBrowserSupported()) {
        const player = new shaka.Player(videoRef.current);
        playerRef.current = player;

        player.addEventListener('error', (event) => {
          console.error('Shaka Player error:', event);
        });

        if (poster) {
          videoRef.current.poster = poster;
        }

        if (autoplay) {
          videoRef.current.autoplay = true;
        }

        try {
          await player.load(src);
        } catch (error) {
          console.error('Error loading video:', error);
        }
      } else {
        console.error('Browser not supported for Shaka Player');
      }
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [src, poster, autoplay]);

  return (
    <div ref={containerRef} className="w-full h-full bg-black">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
      />
    </div>
  );
}
