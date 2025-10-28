import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { SequencePart } from '../types';
import { REWIND_SECONDS, HOW_TO_USE_VIDEO_ID } from '../constants';

export const useVideoPlayer = (sequence: SequencePart[]) => {
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const [isSequencePaused, setIsSequencePaused] = useState(false);
  const [isYtApiReady, setYtApiReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytPlayerContainerRef = useRef<HTMLDivElement>(null);
  const ytTimeCheckIntervalRef = useRef<number | null>(null);
  const isSequencePausedRef = useRef(isSequencePaused);
  useEffect(() => { isSequencePausedRef.current = isSequencePaused; }, [isSequencePaused]);

  const hardStopSequence = useCallback(() => {
    setCurrentPlayingIndex(null);
    setIsSequencePaused(false);
  }, []);

  const playSequence = () => {
    if (sequence.length === 0) return;
    setIsSequencePaused(false);
    if (currentPlayingIndex !== null) { // Resume
      const isYouTube = sequence[currentPlayingIndex]?.videoUrl.includes('youtube.com');
      if (isYouTube && ytPlayerRef.current?.playVideo) ytPlayerRef.current.playVideo();
      else if (videoRef.current) videoRef.current.play().catch(console.error);
    } else { // Play from start
      setCurrentPlayingIndex(0);
    }
  };

  const pauseSequence = () => {
    if (currentPlayingIndex === null) return;
    setIsSequencePaused(true);
    const isYouTube = sequence[currentPlayingIndex]?.videoUrl.includes('youtube.com');
    if (isYouTube && ytPlayerRef.current?.pauseVideo) ytPlayerRef.current.pauseVideo();
    else if (videoRef.current) videoRef.current.pause();
  };
  
  const rewindSequence = () => {
    if (currentPlayingIndex === null) return;
    const currentPart = sequence[currentPlayingIndex];
    const startTime = currentPart.videoTime?.[0] || 0;
    const isYouTube = currentPart.videoUrl.includes('youtube.com');
    if (isYouTube && ytPlayerRef.current) {
      const newTime = Math.max(startTime, ytPlayerRef.current.getCurrentTime() - REWIND_SECONDS);
      ytPlayerRef.current.seekTo(newTime, true);
    } else if (videoRef.current) {
      videoRef.current.currentTime = Math.max(startTime, videoRef.current.currentTime - REWIND_SECONDS);
    }
  };
  
  useEffect(() => {
    const hasYouTubeVideo = sequence.some(part => part.videoUrl.includes('youtube.com') || part.videoUrl.includes('youtu.be')) || HOW_TO_USE_VIDEO_ID;
    if (hasYouTubeVideo && !window.YT) {
      window.onYouTubeIframeAPIReady = () => setYtApiReady(true);
      if (!document.getElementById('youtube-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    } else if (window.YT?.Player) {
      setYtApiReady(true);
    }
  }, [sequence]);

  const currentVideoUrl = currentPlayingIndex !== null ? sequence[currentPlayingIndex]?.videoUrl : null;
  const isCurrentVideoYouTube = useMemo(() => !!currentVideoUrl && (currentVideoUrl.includes('youtube.com') || currentVideoUrl.includes('youtu.be')), [currentVideoUrl]);
  
  const getYouTubeVideoId = useCallback((url: string): string | null => {
      if (!url) return null;
      const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
      return (match && match[2].length === 11) ? match[2] : null;
  }, []);
  
  useEffect(() => {
    if (currentPlayingIndex === null || !currentVideoUrl) return;

    const handleVideoEnded = () => {
      if (isSequencePausedRef.current) return;
      if (currentPlayingIndex < sequence.length - 1) {
        setCurrentPlayingIndex(currentPlayingIndex + 1);
      } else {
        hardStopSequence();
      }
    };

    const currentPart = sequence[currentPlayingIndex];
    if (!currentPart) return;
    
    const startTime = currentPart.videoTime?.[0] || 0;
    const endTime = currentPart.videoTime?.[1];
    const isLastPartInSequence = currentPlayingIndex === sequence.length - 1;
    const shouldCheckEndTime = endTime !== undefined && !isLastPartInSequence;

    const videoElement = videoRef.current;

    const onLoadedMetadata = () => {
      if (videoElement) {
          videoElement.currentTime = startTime;
          videoElement.play().catch(e => console.error("Video play failed:", e));
      }
    };
    const handleTimeUpdate = () => {
      if (videoElement && shouldCheckEndTime && videoElement.currentTime >= endTime!) handleVideoEnded();
    };

    if (isCurrentVideoYouTube) {
      if(isYtApiReady && ytPlayerContainerRef.current) {
        const videoId = getYouTubeVideoId(currentVideoUrl);
        if (videoId) {
          ytPlayerRef.current = new window.YT.Player(ytPlayerContainerRef.current.id, {
            height: '100%', width: '100%', videoId,
            playerVars: { 'autoplay': 1, 'controls': 1, 'playsinline': 1, 'start': Math.floor(startTime) },
            events: {
              'onStateChange': (event: any) => {
                // 状態が変化するたびに、まず既存のタイマーをクリア
                if (ytTimeCheckIntervalRef.current) {
                  clearInterval(ytTimeCheckIntervalRef.current);
                  ytTimeCheckIntervalRef.current = null;
                }
                
                // 再生が開始され、終了時間チェックが必要な場合に新しいタイマーをセット
                if (event.data === window.YT.PlayerState.PLAYING && shouldCheckEndTime) {
                  ytTimeCheckIntervalRef.current = window.setInterval(() => {
                    if (ytPlayerRef.current?.getCurrentTime() >= endTime!) {
                      handleVideoEnded();
                    }
                  }, 100);
                } else if (event.data === window.YT.PlayerState.ENDED) {
                  handleVideoEnded();
                }
              }
            }
          });
        }
      }
    } else {
      if (videoElement) {
        videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
        videoElement.addEventListener('timeupdate', handleTimeUpdate);
        videoElement.addEventListener('ended', handleVideoEnded);
        videoElement.src = currentVideoUrl;
        videoElement.load();
      }
    }

    return () => { // Unified Cleanup
      if (ytPlayerRef.current?.destroy) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
      if (ytTimeCheckIntervalRef.current) {
        clearInterval(ytTimeCheckIntervalRef.current);
        ytTimeCheckIntervalRef.current = null;
      }
      if (videoElement) {
        videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('ended', handleVideoEnded);
        if (videoElement.src) {
            videoElement.pause();
            videoElement.removeAttribute('src');
            videoElement.load();
        }
      }
    };
  }, [currentPlayingIndex, isYtApiReady, currentVideoUrl, isCurrentVideoYouTube, getYouTubeVideoId, sequence, hardStopSequence]);
  
  return {
    refs: { videoRef, ytPlayerRef, ytPlayerContainerRef },
    state: { currentPlayingIndex, isSequencePaused, isYtApiReady, currentVideoUrl, isCurrentVideoYouTube },
    actions: { playSequence, pauseSequence, rewindSequence, hardStopSequence }
  };
};
