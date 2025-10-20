import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { fetchCharacterData, AVAILABLE_CHARACTERS } from './data';

// Declare YT on window for TypeScript
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// --- 定数 ---
// TODO: ご自身の使い方動画のYouTube動画IDに置き換えてください
const HOW_TO_USE_VIDEO_ID = 'oMhooZHpaRw'; // 例: 'ABCdeFG1234'
const MOBILE_BREAKPOINT = 900;
const INITIAL_PARTS_LIMIT = 6;
const REWIND_SECONDS = 5;

const TAG_CATEGORIES = {
  tagType: '種類',
  tagCondition: '条件',
  startCondition: '開始条件',
  tagDriveGauge: 'Dゲージ',
  tagSaGauge: 'SAゲージ'
} as const;
type TagCategoryKey = keyof typeof TAG_CATEGORIES;


// --- 型定義 ---
export interface ComboPart {
  id: string;
  character: string;
  name: string;
  comboparts: string;
  videoUrl: string;
  order: number;
  damage?: number;
  endFrameAdvantage?: number;
  startTime?: number;
  endTime?: number;
  tagType?: string;
  startCondition?: string;
  tagCondition?: string[];
  tagDriveGauge?: string;
  tagSaGauge?: string;
}

interface SequencePart extends ComboPart {
  sequenceId: string;
}

interface SampleCombo {
  name: string;
  parts: string[];
}


// --- コンポーネント ---
const HowToModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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

const PartPickerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  parts: ComboPart[];
  onPartAdd: (part: ComboPart) => void;
  sequence: SequencePart[];
}> = ({ isOpen, onClose, parts, onPartAdd, sequence }) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // モーダルが開いたらスクロールをトップにリセット
      if (listRef.current) {
        listRef.current.scrollTop = 0;
      }
      // bodyのスクロールを禁止
      document.body.style.overflow = 'hidden';
    } else {
      // モーダルが閉じたらbodyのスクロールを許可
      document.body.style.overflow = '';
    }

    // コンポーネントがアンマウントされる際のクリーンアップ
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isPartInSequence = (partId: string) => {
    // This is a simple check, could be more sophisticated if needed
    return sequence.some(p => p.id === partId);
  }

  const getPartTags = (part: ComboPart) => {
    return [
      part.tagType,
      part.startCondition,
      ...(part.tagCondition || []),
      part.tagDriveGauge && `D: ${part.tagDriveGauge}`,
      part.tagSaGauge && `SA: ${part.tagSaGauge}`
    ].filter(Boolean) as string[];
  };

  return (
    <div className="part-picker-modal-overlay" role="dialog" aria-modal="true">
      <div className="part-picker-modal-content">
        <header className="part-picker-modal-header">
          <h2>Parts Library</h2>
          <button onClick={onClose} className="part-picker-modal-close-button" aria-label="Close part picker">
            完了
          </button>
        </header>
        <div ref={listRef} className="part-picker-modal-list">
          {parts.map(part => {
             const added = isPartInSequence(part.id);
             const partTags = getPartTags(part);
             return (
              <div key={part.id} className="part-picker-item">
                <div className="part-picker-info">
                  <h3>{part.name}</h3>
                  <div className="tags">
                    {partTags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                  </div>
                </div>
                <button
                  onClick={() => onPartAdd(part)}
                  className={`part-picker-add-button ${added ? 'added' : ''}`}
                  aria-label={`Add ${part.name} to sequence`}
                >
                  {added ? '追加済み ✔' : '+ 追加'}
                </button>
              </div>
             )
            })}
        </div>
        <footer className="part-picker-modal-footer">
          <p>現在シーケンスに {sequence.length} 個のパーツ</p>
        </footer>
      </div>
    </div>
  );
};


const PartCard: React.FC<{ part: ComboPart; onPartClick: (part: ComboPart) => void; }> = ({ part, onPartClick }) => {
  const partTags = [
    part.tagType,
    part.startCondition,
    ...(part.tagCondition || []),
    part.tagDriveGauge && `D: ${part.tagDriveGauge}`,
    part.tagSaGauge && `SA: ${part.tagSaGauge}`
  ].filter(Boolean) as string[];

  return (
    <div
      className="part-card"
      onClick={() => onPartClick(part)}
      aria-label={`Click to add ${part.name}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPartClick(part); }}
    >
      <h3>{part.name}</h3>
      <div className="tags">
        {partTags.map(tag => <span key={tag} className="tag">{tag}</span>)}
      </div>
      <div className="part-info">
        {part.damage != null && (
          <span className="info-item damage" aria-label={`Damage: ${part.damage}`}>
            💥 {part.damage}
          </span>
        )}
        {part.endFrameAdvantage != null && (
          <span
            className={`info-item frame-advantage ${part.endFrameAdvantage >= 0 ? 'positive' : 'negative'}`}
            aria-label={`Frame advantage: ${part.endFrameAdvantage}`}
          >
            ⏰ {part.endFrameAdvantage > 0 ? `+${part.endFrameAdvantage}` : part.endFrameAdvantage}
          </span>
        )}
      </div>
    </div>
  );
};

const SequenceItem: React.FC<{
  part: SequencePart;
  onRemove: (sequenceId: string) => void;
  isPlaying: boolean;
  isMoving: boolean;
  onMoveClick: () => void;
}> = ({
  part,
  onRemove,
  isPlaying,
  isMoving,
  onMoveClick,
}) => {
  const itemClass = `
    sequence-item
    ${isPlaying ? 'playing' : ''}
    ${isMoving ? 'moving' : ''}
  `;

  return (
    <div className={itemClass}>
      <button
        className="drag-handle"
        onClick={onMoveClick}
        aria-label={`Move ${part.comboparts}`}
        title="Move part"
      >
        ⠿
      </button>
      <span>{part.comboparts}</span>
      <div className="item-controls">
        <button onClick={() => onRemove(part.sequenceId)} aria-label={`Remove ${part.comboparts}`} title="Remove part">&times;</button>
      </div>
    </div>
  );
};

// --- Custom Hooks ---

const useDeviceState = () => {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

  useEffect(() => {
    const checkIsMobile = () => setIsMobileView(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return { isMobileView };
};

const useCharacterData = (character: string) => {
  const [comboParts, setComboParts] = useState<ComboPart[]>([]);
  const [sampleCombos, setSampleCombos] = useState<SampleCombo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!character) return;
      setIsLoading(true);
      try {
        const data = await fetchCharacterData(character);
        const sortedParts = data.comboParts.sort((a, b) => a.order - b.order);
        setComboParts(sortedParts);
        setSampleCombos(data.sampleCombos);
      } catch (error) {
        console.error(`Failed to load data for ${character}`, error);
        setComboParts([]);
        setSampleCombos([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [character]);

  return { comboParts, sampleCombos, isLoading };
};

const useFilters = (comboParts: ComboPart[]) => {
  const initialFilterState = {
    tagType: new Set<string>(),
    tagCondition: new Set<string>(),
    startCondition: new Set<string>(),
    tagDriveGauge: new Set<string>(),
    tagSaGauge: new Set<string>(),
  };
  const [tags, setTags] = useState(initialFilterState);

  const resetFilters = () => setTags(initialFilterState);

  const handleTagClick = (category: TagCategoryKey, tag: string) => {
    setTags(prev => {
      const newCategoryTags = new Set(prev[category]);
      if (newCategoryTags.has(tag)) newCategoryTags.delete(tag);
      else newCategoryTags.add(tag);
      return { ...prev, [category]: newCategoryTags };
    });
  };

  const availableTags = useMemo(() => {
    const categories: { [K in TagCategoryKey]: Set<string> } = {
        tagType: new Set(), tagCondition: new Set(), startCondition: new Set(),
        tagDriveGauge: new Set(), tagSaGauge: new Set(),
    };
    for (const part of comboParts) {
        if (part.tagType) categories.tagType.add(part.tagType);
        if (part.startCondition) categories.startCondition.add(part.startCondition);
        if (part.tagCondition) part.tagCondition.forEach(tag => categories.tagCondition.add(tag));
        if (part.tagDriveGauge) categories.tagDriveGauge.add(part.tagDriveGauge);
        if (part.tagSaGauge) categories.tagSaGauge.add(part.tagSaGauge);
    }
    const sortNumerically = (a: string, b: string) => (parseInt(a.match(/\d+/)?.[0] || '0') - parseInt(b.match(/\d+/)?.[0] || '0'));
    return {
        tagType: [...categories.tagType].sort(),
        startCondition: [...categories.startCondition].sort(),
        tagCondition: [...categories.tagCondition].sort(),
        tagDriveGauge: [...categories.tagDriveGauge].sort(sortNumerically),
        tagSaGauge: [...categories.tagSaGauge].sort(sortNumerically),
    };
  }, [comboParts]);

  const filteredParts = useMemo(() => {
    return comboParts.filter(part => {
      for (const key of Object.keys(TAG_CATEGORIES) as TagCategoryKey[]) {
        const selectedTags = tags[key];
        if (selectedTags.size === 0) continue;
        if (key === 'tagCondition') {
          if (!part.tagCondition || !([...selectedTags].every(t => part.tagCondition!.includes(t)))) return false;
        } else {
          if (!part[key] || !selectedTags.has(part[key] as string)) return false;
        }
      }
      return true;
    });
  }, [tags, comboParts]);

  return { tags, handleTagClick, resetFilters, availableTags, filteredParts };
};

const useSequence = () => {
  const [sequence, setSequence] = useState<SequencePart[]>([]);

  const addPartToSequence = (part: ComboPart) => {
    const newSequencePart: SequencePart = { ...part, sequenceId: `${part.id}-${Date.now()}` };
    setSequence(prev => [...prev, newSequencePart]);
  };

  const removeFromSequence = (sequenceId: string) => {
    setSequence(prev => prev.filter(p => p.sequenceId !== sequenceId));
  };

  const clearSequence = () => setSequence([]);

  const loadSampleCombo = (sample: SampleCombo, allParts: ComboPart[]) => {
    const newSequence = sample.parts.map(partId => {
      const part = allParts.find(p => p.id === partId);
      if (!part) return null;
      return { ...part, sequenceId: `${part.id}-${Date.now()}-${Math.random()}` };
    }).filter((p): p is SequencePart => p !== null);
    setSequence(newSequence);
  };

  const comboStats = useMemo(() => {
    const totalDamage = sequence.reduce((sum, part) => sum + (part.damage || 0), 0);
    const finalFrameAdvantage = sequence.length > 0 ? sequence[sequence.length - 1].endFrameAdvantage : undefined;
    return { totalDamage, finalFrameAdvantage };
  }, [sequence]);

  return { sequence, setSequence, addPartToSequence, removeFromSequence, clearSequence, loadSampleCombo, comboStats };
};

const useVideoPlayer = (sequence: SequencePart[]) => {
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
    const startTime = currentPart.startTime || 0;
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
  
  // FIX: Refactored to correctly handle video event listeners and their cleanup.
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
    
    const isLastPartInSequence = currentPlayingIndex === sequence.length - 1;
    const shouldCheckEndTime = currentPart.endTime && !isLastPartInSequence;

    const videoElement = videoRef.current;

    const onLoadedMetadata = () => {
      if (videoElement) {
          if (currentPart.startTime) videoElement.currentTime = currentPart.startTime;
          videoElement.play().catch(e => console.error("Video play failed:", e));
      }
    };
    const handleTimeUpdate = () => {
      if (videoElement && shouldCheckEndTime && videoElement.currentTime >= currentPart.endTime!) handleVideoEnded();
    };

    if (isCurrentVideoYouTube) {
      if(isYtApiReady && ytPlayerContainerRef.current) {
        const videoId = getYouTubeVideoId(currentVideoUrl);
        if (videoId) {
          ytPlayerRef.current = new window.YT.Player(ytPlayerContainerRef.current.id, {
            height: '100%', width: '100%', videoId,
            playerVars: { 'autoplay': 1, 'controls': 1, 'playsinline': 1, 'start': Math.floor(currentPart.startTime || 0) },
            events: {
              'onStateChange': (event: any) => {
                if (event.data === window.YT.PlayerState.PLAYING && shouldCheckEndTime) {
                  ytTimeCheckIntervalRef.current = window.setInterval(() => {
                    if (ytPlayerRef.current?.getCurrentTime() >= currentPart.endTime!) handleVideoEnded();
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

const useSequenceReorder = (
  setSequence: React.Dispatch<React.SetStateAction<SequencePart[]>>
) => {
  const [movingPartId, setMovingPartId] = useState<string | null>(null);

  const handleStartMove = (partId: string) => {
    // すでに同じパーツが選択されている場合は移動モードをキャンセル
    setMovingPartId(prevId => (prevId === partId ? null : partId));
  };

  const handleConfirmMove = (targetIndex: number) => {
    if (!movingPartId) return;

    setSequence(currentSequence => {
      const draggedIndex = currentSequence.findIndex(p => p.sequenceId === movingPartId);
      if (draggedIndex === -1) return currentSequence;

      const newSequence = [...currentSequence];
      const [draggedItem] = newSequence.splice(draggedIndex, 1);
      
      // 自身を移動させる場合、挿入先のインデックスがずれることがあるため調整
      const adjustedTargetIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;

      newSequence.splice(adjustedTargetIndex, 0, draggedItem);
      return newSequence;
    });

    setMovingPartId(null);
  };

  const handleCancelMove = () => {
    setMovingPartId(null);
  };

  return {
    state: { movingPartId },
    actions: {
      handleStartMove,
      handleConfirmMove,
      handleCancelMove,
    }
  };
};


const App = () => {
  const [character, setCharacter] = useState(AVAILABLE_CHARACTERS[0] || '');
  
  const { isMobileView } = useDeviceState();
  const { comboParts, sampleCombos, isLoading } = useCharacterData(character);
  const { tags, handleTagClick, resetFilters, availableTags, filteredParts } = useFilters(comboParts);
  const { sequence, setSequence, addPartToSequence, removeFromSequence, clearSequence, loadSampleCombo, comboStats } = useSequence();
  const { refs: playerRefs, state: playerState, actions: playerActions } = useVideoPlayer(sequence);
  const { state: reorderState, actions: reorderActions } = useSequenceReorder(setSequence);
  
  const [showAllParts, setShowAllParts] = useState(false);
  const [isPartPickerModalOpen, setIsPartPickerModalOpen] = useState(false);
  const [isCharSelectExpanded, setIsCharSelectExpanded] = useState(true);
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(true);
  const [isHowToModalOpen, setIsHowToModalOpen] = useState(false);
  const [activeLibraryTab, setActiveLibraryTab] = useState<'parts' | 'samples'>('parts');

  useEffect(() => {
    if (!isMobileView) {
        setIsCharSelectExpanded(true);
        setIsLibraryExpanded(true);
    }
  }, [isMobileView]);

  useEffect(() => {
    setShowAllParts(false);
  }, [tags, character]);
  
  // 他の操作が行われたら並べ替えモードをキャンセルする
  useEffect(() => {
    if (reorderState.movingPartId) {
      reorderActions.handleCancelMove();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequence.length]);


  const handleCharacterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCharacter(e.target.value);
    resetFilters();
    clearSequence();
    playerActions.hardStopSequence();
  };
  
  const handleAddPart = (part: ComboPart) => {
    playerActions.hardStopSequence();
    addPartToSequence(part);
  };

  const handleRemovePart = (id: string) => {
    playerActions.hardStopSequence();
    removeFromSequence(id);
  };
  
  const handleClear = () => {
    playerActions.hardStopSequence();
    clearSequence();
  };
  
  const handleLoadSample = (sample: SampleCombo) => {
    playerActions.hardStopSequence();
    loadSampleCombo(sample, comboParts);
  };

  const handleShowMoreClick = () => {
    if (isMobileView) setIsPartPickerModalOpen(true);
    else setShowAllParts(prev => !prev);
  };
  
  const displayedParts = useMemo(() => {
    return showAllParts ? filteredParts : filteredParts.slice(0, INITIAL_PARTS_LIMIT);
  }, [filteredParts, showAllParts]);
  
  return (
    <div className="app-container">
      {isHowToModalOpen && playerState.isYtApiReady && <HowToModal onClose={() => setIsHowToModalOpen(false)} />}
       <PartPickerModal
        isOpen={isPartPickerModalOpen}
        onClose={() => setIsPartPickerModalOpen(false)}
        parts={filteredParts}
        onPartAdd={handleAddPart}
        sequence={sequence}
      />
      <header>
        <h1>SF6 Combo Weaver</h1>
        <button className="how-to-button" onClick={() => setIsHowToModalOpen(true)}>
          使い方
        </button>
      </header>
      <main>
        <div className="sidebar">
          <section className={`character-select collapsible-section ${isCharSelectExpanded ? 'expanded' : ''}`}>
            <h2 onClick={isMobileView ? () => setIsCharSelectExpanded(p => !p) : undefined} role={isMobileView ? "button" : "heading"} aria-level={2}>
              <span>Character Select</span>
              <span className={`expand-icon ${isCharSelectExpanded ? 'expanded' : ''}`} aria-hidden="true">▼</span>
            </h2>
            <div className="collapsible-content">
              <div className="filters">
                <div className="filter-group">
                  <label htmlFor="character-filter">Character</label>
                  <select id="character-filter" name="character" value={character} onChange={handleCharacterChange}>
                    {AVAILABLE_CHARACTERS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <aside className={`library collapsible-section ${isLibraryExpanded ? 'expanded' : ''}`}>
            <h2 onClick={isMobileView ? () => setIsLibraryExpanded(p => !p) : undefined} role={isMobileView ? "button" : "heading"} aria-level={2}>
              <span>Parts Library</span>
              <span className={`expand-icon ${isLibraryExpanded ? 'expanded' : ''}`} aria-hidden="true">▼</span>
            </h2>
            <div className="collapsible-content">
              <div className="library-tabs">
                <button className={`library-tab-button ${activeLibraryTab === 'parts' ? 'active' : ''}`} onClick={() => setActiveLibraryTab('parts')}>パーツ検索</button>
                <button className={`library-tab-button ${activeLibraryTab === 'samples' ? 'active' : ''}`} onClick={() => setActiveLibraryTab('samples')} disabled={sampleCombos.length === 0}>サンプルコンボ</button>
              </div>

              {activeLibraryTab === 'parts' && (
                <>
                  <div className="tag-filter-container">
                    {Object.entries(TAG_CATEGORIES).map(([key, name]) => {
                      const categoryKey = key as TagCategoryKey;
                      const tagsForCategory = availableTags[categoryKey];
                      if (!tagsForCategory || tagsForCategory.length === 0) return null;
                      return (
                        <div key={key} className="tag-category">
                          <h4>{name}</h4>
                          <div className="tag-buttons">
                            {tagsForCategory.map(tag => (
                              <button key={tag} className={`tag-filter-button ${tags[categoryKey].has(tag) ? 'active' : ''}`} onClick={() => handleTagClick(categoryKey, tag)}>{tag}</button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="parts-list">
                    {isLoading ? <div className="loading-spinner"></div> : 
                     displayedParts.length > 0 ? displayedParts.map(part => <PartCard key={part.id} part={part} onPartClick={handleAddPart} />) : 
                     <p className="no-parts-found">No matching parts found.</p>}
                  </div>
                  {!isLoading && filteredParts.length > INITIAL_PARTS_LIMIT && (
                    <div className="show-more-container">
                      <button onClick={handleShowMoreClick} className="show-more-button">
                        {isMobileView || !showAllParts ? `もっと見る (${filteredParts.length - (isMobileView ? 0 : INITIAL_PARTS_LIMIT)}件)` : '表示を減らす'}
                      </button>
                    </div>
                  )}
                </>
              )}

              {activeLibraryTab === 'samples' && (
                <div className="sample-combos-list-container">
                  <div className="sample-combos-list">
                    {sampleCombos.map((sample, index) => <button key={index} className="sample-combo-button" onClick={() => handleLoadSample(sample)}>{sample.name}</button>)}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        <section className="builder">
          <h2>Sequence Builder</h2>
          <div className="builder-content">
            <div className="player-area">
              {!playerState.currentVideoUrl && playerState.currentPlayingIndex === null ? (
                <div className="player-placeholder">Click a part from the library to add it to the sequence.</div>
              ) : (
                <>
                  <div id="yt-player-container" ref={playerRefs.ytPlayerContainerRef} style={{ display: playerState.isCurrentVideoYouTube ? 'block' : 'none', width: '100%', height: '100%' }} />
                  <video ref={playerRefs.videoRef} style={{ display: !playerState.isCurrentVideoYouTube ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'contain' }} controls playsInline />
                </>
              )}
            </div>
            <div className="sequence-area">
              <div className="sequence-controls">
                <div>
                  <button onClick={playerActions.playSequence} disabled={sequence.length === 0 || (playerState.currentPlayingIndex !== null && !playerState.isSequencePaused)}>
                    {(playerState.currentPlayingIndex !== null && playerState.isSequencePaused) ? 'Resume' : 'Play'}
                  </button>
                  <button onClick={playerActions.rewindSequence} disabled={playerState.currentPlayingIndex === null}>Rewind 5s</button>
                  <button onClick={playerActions.pauseSequence} disabled={playerState.currentPlayingIndex === null || playerState.isSequencePaused}>Pause</button>
                  <button onClick={playerActions.hardStopSequence} disabled={playerState.currentPlayingIndex === null}>Stop</button>
                </div>
                 {reorderState.movingPartId ? (
                  <button className="cancel-move-button" onClick={reorderActions.handleCancelMove}>Cancel Move</button>
                ) : (
                  <button className="clear-button" onClick={handleClear} disabled={sequence.length === 0}>Clear</button>
                )}
              </div>

              {sequence.length > 0 && (
                <div className="combo-stats">
                  <span className="info-item damage">💥 Total Damage: {comboStats.totalDamage}</span>
                  {comboStats.finalFrameAdvantage !== undefined && (
                    <span className={`info-item frame-advantage ${comboStats.finalFrameAdvantage >= 0 ? 'positive' : 'negative'}`}>
                      ⏰ Final Frames: {comboStats.finalFrameAdvantage > 0 ? `+${comboStats.finalFrameAdvantage}` : comboStats.finalFrameAdvantage}
                    </span>
                  )}
                </div>
              )}

              <div className="sequence-list-container">
                 {reorderState.movingPartId && (
                  <button
                    className="move-target-indicator"
                    onClick={() => reorderActions.handleConfirmMove(0)}
                  >
                    ここに移動 (先頭)
                  </button>
                )}
                {sequence.map((part, index) => (
                  <React.Fragment key={part.sequenceId}>
                    <SequenceItem
                      part={part}
                      onRemove={handleRemovePart}
                      isPlaying={part.sequenceId === sequence[playerState.currentPlayingIndex!]?.sequenceId}
                      isMoving={reorderState.movingPartId === part.sequenceId}
                      onMoveClick={() => reorderActions.handleStartMove(part.sequenceId)}
                    />
                    {reorderState.movingPartId && reorderState.movingPartId !== part.sequenceId && (
                       <button
                        className="move-target-indicator"
                        onClick={() => reorderActions.handleConfirmMove(index + 1)}
                      >
                        ここに移動
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        <section className="notation-guide">
          <h2>特殊表記について</h2>
          <p>パーツ名などで使用されている略語は以下の通りです。</p>
          <ul>
            <li><strong>P</strong> → パンチ</li>
            <li><strong>K</strong> → キック</li>
            <li><strong>屈</strong> → しゃがみ状態</li>
            <li><strong>F消費</strong> → フレーム消費</li>
            <li><strong>DI</strong> → ドライブインパクト</li>
            <li><strong>R</strong> → ドライブラッシュ（生ラッシュ）</li>
            <li><strong>CR</strong> → キャンセルラッシュ</li>
            <li><strong>Dn(1~6)本</strong> → ドライブゲージn(1~6)本使用するコンボ</li>
            <li><strong>💥</strong> → ダメージ量を表します。</li>
            <li><strong>⏰</strong> → 技後の有利・不利フレームを表します。</li>
          </ul>
        </section>
      </main>
      <footer>
        <div className="footer-content">
          <section className="update-history">
            <h3>更新履歴</h3>
            <ul>
              <li>2025.10.20 - ラシードデータを公開開始。リュウのデータを精査し、修正。モバイル版の表示関連不具合を修正。</li>
              <li>2025.10.18 - 初版公開開始。リュウのデータのみ。控えデータ：ケン、ラシード。</li>
            </ul>
          </section>
          <section className="legal-info">
            <h3>免責事項・プライバシーポリシー</h3>
            <p>
              This is an unofficial fan-made tool and is not affiliated with Capcom.
              <br />
              このツールは非公式のファン制作物であり、株式会社カプコンとは一切関係ありません。
            </p>
            <p>
              All Street Fighter 6 characters, images, and related content are trademarks and copyrights of ©CAPCOM.
              <br />
              『ストリートファイター6』に関する全てのキャラクター、画像、その他関連コンテンツの商標権および著作権は、株式会社カプコンに帰属します。
            </p>
            <p>
              The creator assumes no responsibility for any damages caused by the use of this tool. Please use it at your own risk.
              <br />
              当ツールの利用によって生じたいかなる損害についても、制作者は一切の責任を負いません。
            </p>
            <p>
              This site does not collect or use any user cookies or personally identifiable information.
              <br />
              当サイトは、利用者のCookie情報や個人を特定する情報を収集・利用することはありません。
            </p>
          </section>
          <section className="contact-info">
            <h3>連絡先</h3>
            <p>
              ご意見・ご要望・不具合の報告は作者Xアカウントまで: <a href="https://x.com/takanan0325" target="_blank" rel="noopener noreferrer">@takanan0325</a>
            </p>
          </section>
        </div>
      </footer>
    </div>
  );
};

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
});
