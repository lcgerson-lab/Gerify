import { useEffect, useRef } from 'react';

export default function YouTubePlayer({ videoId, isPlaying, setIsPlaying, onEnded, playerRef, volume = 80 }) {
  const containerRef = useRef(null);
  const ytPlayerRef = useRef(null);
  // Keep the latest onEnded in a ref: the YT event closure is created once, so
  // referencing the prop directly would call a stale version.
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  useEffect(() => {
    if (!videoId) return;

    const initPlayer = () => {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.loadVideoById(videoId);
        return;
      }
      ytPlayerRef.current = new window.YT.Player(containerRef.current, {
        height: "1", width: "1",
        videoId,
        playerVars: { autoplay: 1, controls: 0, rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: (e) => {
            playerRef.current = e.target;
            e.target.setVolume(volumeRef.current);
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            if (e.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
            if (e.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              onEndedRef.current?.();
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      if (!document.getElementById("yt-iframe-api")) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }
  }, [videoId]);

  useEffect(() => {
    if (!ytPlayerRef.current) return;
    if (isPlaying) ytPlayerRef.current.playVideo?.();
    else ytPlayerRef.current.pauseVideo?.();
  }, [isPlaying]);

  return <div ref={containerRef} style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }} />;
}
