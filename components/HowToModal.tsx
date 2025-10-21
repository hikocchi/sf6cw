import React, { useEffect, useRef } from 'react';
import { HOW_TO_USE_VIDEO_ID } from '../constants';

export const HowToModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // YT APIが準備できていればプレーヤーを初期化
    if (window.YT && window.YT.Player) {
      playerRef.current = new window.YT.Player('how-to-player', {
        videoId: HOW_TO_USE_VIDEO_ID,
        playerVars: {
          'autoplay': 1,
          'controls': 1,
          'playsinline': 1,
        },
        events: {
          'onError': () => {
            // エラー時に備えてコンソールに出力
             console.error(`YouTube Player Error: Video with ID ${HOW_TO_USE_VIDEO_ID} could not be played.`);
          }
        }
      });
    }

    return () => {
      // コンポーネントがアンマウントされるときにプレーヤーを破棄
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
    };
  }, []);
  
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose} aria-label="Close modal">&times;</button>
        <div className="modal-video-container">
          <div id="how-to-player"></div>
        </div>
      </div>
    </div>
  );
};
