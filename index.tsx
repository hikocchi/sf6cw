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
const LONG_PRESS_DURATION = 200; // ms

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
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  isTouchDevice: boolean;
  onMobileDragStart: (e: React.TouchEvent) => void;
  isTouchDragging: boolean;
  style: React.CSSProperties;
}> = ({
  part,
  onRemove,
  isPlaying,
  isDragging,
  onDragStart,
  onDragEnd,
  onDragOver,
  isTouchDevice,
  onMobileDragStart,
  isTouchDragging,
  style
}) => {
  const itemClass = `
    sequence-item
    ${isPlaying ? 'playing' : ''}
    ${isDragging ? 'dragging' : ''}
    ${isTouchDragging ? 'touch-dragging' : ''}
  `;

  return (
    <div
      className={itemClass}
      draggable={!isTouchDevice}
      onDragStart={!isTouchDevice ? onDragStart : undefined}
      onDragEnd={!isTouchDevice ? onDragEnd : undefined}
      onDragOver={!isTouchDevice ? onDragOver : undefined}
      style={style}
    >
      <button
        className="drag-handle"
        onTouchStart={isTouchDevice ? onMobileDragStart : undefined}
        draggable={false}
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

const App = () => {
  const CHARACTERS = AVAILABLE_CHARACTERS;
  const [comboParts, setComboParts] = useState<ComboPart[]>([]);
  const [sampleCombos, setSampleCombos] = useState<SampleCombo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const initialFilters = {
    character: CHARACTERS[0] || '',
    tags: {
      tagType: new Set<string>(),
      tagCondition: new Set<string>(),
      startCondition: new Set<string>(),
      tagDriveGauge: new Set<string>(),
      tagSaGauge: new Set<string>(),
    }
  };

  const [filters, setFilters] = useState(initialFilters);
  const [sequence, setSequence] = useState<SequencePart[]>([]);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const [isSequencePaused, setIsSequencePaused] = useState(false);
  const [isYtApiReady, setYtApiReady] = useState(false);
  const [isCharSelectExpanded, setIsCharSelectExpanded] = useState(true);
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(true);
  const [isHowToModalOpen, setIsHowToModalOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= MOBILE_BREAKPOINT);
  const [showAllParts, setShowAllParts] = useState(false);
  const [isPartPickerModalOpen, setIsPartPickerModalOpen] = useState(false);
  const [dropTarget, setDropTarget] = useState<{ index: number | null; position: 'top' | 'bottom' | null }>({ index: null, position: null });
  const [activeLibraryTab, setActiveLibraryTab] = useState<'parts' | 'samples'>('parts');
  const [touchDragState, setTouchDragState] = useState<{
    id: string;
    startY: number;
    elementInitialTop: number;
    initialScrollTop: number;
    currentY: number;
  } | null>(null);

  const isTouchDevice = useMemo(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytPlayerContainerRef = useRef<HTMLDivElement>(null);
  const ytTimeCheckIntervalRef = useRef<number | null>(null);
  const sequenceListRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<number>();
  // FIX: Changed `touch: Touch` to `touch: React.Touch` to match the event object from React.
  const touchStartInfoRef = useRef<{ part: SequencePart; element: HTMLElement; touch: React.Touch; } | null>(null);


  const isSequencePausedRef = useRef(isSequencePaused);
  useEffect(() => {
    isSequencePausedRef.current = isSequencePaused;
  }, [isSequencePaused]);
  
  // Load character data when character filter changes
  useEffect(() => {
    const loadData = async () => {
      if (!filters.character) return;
      setIsLoading(true);
      try {
        const data = await fetchCharacterData(filters.character);
        const sortedParts = data.comboParts.sort((a, b) => a.order - b.order);
        setComboParts(sortedParts);
        setSampleCombos(data.sampleCombos);
      } catch (error) {
        console.error(`Failed to load data for ${filters.character}`, error);
        setComboParts([]);
        setSampleCombos([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [filters.character]);
  
  useEffect(() => {
    const checkIsMobile = () => {
        const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
        setIsMobileView(isMobile);
        if (!isMobile) {
            setIsCharSelectExpanded(true);
            setIsLibraryExpanded(true);
        }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
}, []);


  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...initialFilters, character: e.target.value });
  };

  const handleTagClick = (category: TagCategoryKey, tag: string) => {
    setFilters(prev => {
      const newCategoryTags = new Set(prev.tags[category]);
      if (newCategoryTags.has(tag)) {
        newCategoryTags.delete(tag);
      } else {
        newCategoryTags.add(tag);
      }
      return {
        ...prev,
        tags: {
          ...prev.tags,
          [category]: newCategoryTags,
        },
      };
    });
  };

  const availableTags = useMemo(() => {
    const categories: { [K in TagCategoryKey]: Set<string> } = {
        tagType: new Set<string>(),
        tagCondition: new Set<string>(),
        startCondition: new Set<string>(),
        tagDriveGauge: new Set<string>(),
        tagSaGauge: new Set<string>(),
    };
    for (const part of comboParts) {
        if (part.tagType) categories.tagType.add(part.tagType);
        if (part.startCondition) categories.startCondition.add(part.startCondition);
        if (part.tagCondition) {
          part.tagCondition.forEach(tag => categories.tagCondition.add(tag));
        }
        if (part.tagDriveGauge) categories.tagDriveGauge.add(part.tagDriveGauge);
        if (part.tagSaGauge) categories.tagSaGauge.add(part.tagSaGauge);
    }
    
    const sortNumerically = (a: string, b: string) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
    };
    
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
        const selectedTags = filters.tags[key];
        if (selectedTags.size === 0) continue;

        if (key === 'tagCondition') {
          const partConditionTags = part.tagCondition;
          if (!partConditionTags || partConditionTags.length === 0) {
            return false;
          }
          // The part must have ALL selected condition tags (AND logic).
          for (const selected of selectedTags) {
            if (!partConditionTags.includes(selected)) {
              return false;
            }
          }
        } else {
          const partTag = part[key] as string | undefined;
          if (!partTag || !selectedTags.has(partTag)) {
            return false;
          }
        }
      }
      return true;
    });
  }, [filters.tags, comboParts]);
  
  // Reset "Show All" state when filters change
  useEffect(() => {
    setShowAllParts(false);
  }, [filters]);
  
  const displayedParts = useMemo(() => {
    return showAllParts ? filteredParts : filteredParts.slice(0, INITIAL_PARTS_LIMIT);
  }, [filteredParts, showAllParts]);
  
  const hardStopSequence = useCallback(() => {
    setCurrentPlayingIndex(null);
    setIsSequencePaused(false);
  }, []);

  const handleAddPartToSequence = (part: ComboPart) => {
    hardStopSequence();
    const newSequencePart: SequencePart = {
      ...part,
      sequenceId: `${part.id}-${Date.now()}`
    };
    setSequence(prev => [...prev, newSequencePart]);
  };

  const handleRemoveFromSequence = (sequenceId: string) => {
    hardStopSequence();
    setSequence(prev => prev.filter(p => p.sequenceId !== sequenceId));
  };
  
  const handleClearSequence = () => {
    hardStopSequence();
    setSequence([]);
  };
  
  const handleLoadSampleCombo = (sample: SampleCombo) => {
    hardStopSequence();
    const newSequence = sample.parts.map(partId => {
      const part = comboParts.find(p => p.id === partId);
      if (!part) return null;
      return { ...part, sequenceId: `${part.id}-${Date.now()}-${Math.random()}` };
    }).filter((p): p is SequencePart => p !== null);
    setSequence(newSequence);
  };

  const handleVideoEnded = useCallback(() => {
    if (isSequencePausedRef.current) {
      return;
    }
  
    if (currentPlayingIndex !== null && currentPlayingIndex < sequence.length - 1) {
      setCurrentPlayingIndex(currentPlayingIndex + 1);
    } else {
      setCurrentPlayingIndex(null);
      setIsSequencePaused(false);
    }
  }, [currentPlayingIndex, sequence]);
  
  const playSequence = () => {
    if (sequence.length === 0) return;
  
    setIsSequencePaused(false);
  
    if (currentPlayingIndex !== null) {
      // It's paused, so resume
      if (isCurrentVideoYouTube && ytPlayerRef.current?.playVideo) {
        ytPlayerRef.current.playVideo();
      } else if (videoRef.current) {
        videoRef.current.play().catch(console.error);
      }
    } else {
      // It's stopped, so play from start
      setCurrentPlayingIndex(0);
    }
  };
  
  const handlePause = () => {
    if (currentPlayingIndex === null) return;
    setIsSequencePaused(true);
    if (isCurrentVideoYouTube && ytPlayerRef.current?.pauseVideo) {
      ytPlayerRef.current.pauseVideo();
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleRewind = () => {
    if (currentPlayingIndex === null) return;
    const currentPart = sequence[currentPlayingIndex];
    const startTime = currentPart.startTime || 0;

    if (isCurrentVideoYouTube && ytPlayerRef.current) {
        const currentTime = ytPlayerRef.current.getCurrentTime();
        const newTime = Math.max(startTime, currentTime - REWIND_SECONDS);
        ytPlayerRef.current.seekTo(newTime, true);
    } else if (videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        videoRef.current.currentTime = Math.max(startTime, currentTime - REWIND_SECONDS);
    }
  };
  
  const toggleCharSelectExpansion = () => setIsCharSelectExpanded(prev => !prev);
  const toggleLibraryExpansion = () => setIsLibraryExpanded(prev => !prev);
  const handleShowMoreClick = () => {
    if (isMobileView) {
      setIsPartPickerModalOpen(true);
    } else {
      setShowAllParts(prev => !prev);
    }
  };


  // --- Drag and Drop Logic ---

  const handleDragStart = (id: string) => setDraggedId(id);

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTarget({ index: null, position: null });
  };
  
  const handleDrop = useCallback(() => {
    if (!draggedId || dropTarget.index === null) return;

    setSequence(currentSequence => {
        const draggedIndex = currentSequence.findIndex(p => p.sequenceId === draggedId);
        if (draggedIndex === -1) return currentSequence;

        const newSequence = [...currentSequence];
        const [draggedItem] = newSequence.splice(draggedIndex, 1);

        let targetIndex = dropTarget.index;
        // Adjust index if item is moved downwards
        if (draggedIndex < targetIndex) {
            targetIndex--;
        }

        const insertAtIndex = dropTarget.position === 'top' ? targetIndex : targetIndex + 1;
        newSequence.splice(insertAtIndex, 0, draggedItem);
        return newSequence;
    });
  }, [draggedId, dropTarget.index, dropTarget.position]);


  // --- Desktop Drag Handlers ---
  const handleItemDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    if (sequence[index]?.sequenceId === draggedId) return;

    const targetElement = e.currentTarget as HTMLDivElement;
    const rect = targetElement.getBoundingClientRect();
    const isTopHalf = e.clientY < rect.top + rect.height / 2;
    const newPosition = isTopHalf ? 'top' : 'bottom';

    if (dropTarget.index !== index || dropTarget.position !== newPosition) {
        setDropTarget({ index, position: newPosition });
    }
  };

  // --- Mobile Touch Drag Handlers ---

  const handleTouchDragMove = useCallback((e: TouchEvent) => {
    if (!draggedId) return;
    if (e.cancelable) e.preventDefault();

    const touchY = e.touches[0].clientY;
    setTouchDragState(prev => prev ? { ...prev, currentY: touchY } : null);

    const sequenceItems = Array.from(sequenceListRef.current?.children || [])
      .filter(child => child.classList.contains('sequence-item'));

    let newDropTarget: { index: number | null; position: 'top' | 'bottom' | null } = { index: null, position: null };

    const targetItem = sequenceItems.find(item => {
      const itemIndex = sequenceItems.indexOf(item);
      if (sequence[itemIndex]?.sequenceId === draggedId) return false;
      const rect = item.getBoundingClientRect();
      return touchY >= rect.top && touchY <= rect.bottom;
    });

    if (targetItem) {
      const rect = targetItem.getBoundingClientRect();
      const targetIndex = sequenceItems.indexOf(targetItem);
      const isTopHalf = touchY < rect.top + rect.height / 2;
      newDropTarget = { index: targetIndex, position: isTopHalf ? 'top' : 'bottom' };
    } else if (sequenceItems.length > 0) {
      const firstItem = sequenceItems[0];
      const lastItem = sequenceItems[sequenceItems.length - 1];
      if (touchY < firstItem.getBoundingClientRect().top) {
        newDropTarget = { index: 0, position: 'top' };
      } else if (touchY > lastItem.getBoundingClientRect().bottom) {
        newDropTarget = { index: sequenceItems.indexOf(lastItem), position: 'bottom' };
      }
    }

    if (dropTarget.index !== newDropTarget.index || dropTarget.position !== newDropTarget.position) {
      setDropTarget(newDropTarget);
    }
  }, [draggedId, sequence, dropTarget.index, dropTarget.position]);


  const handleTouchDragEnd = useCallback(() => {
    window.removeEventListener('touchmove', handleTouchDragMove);
    window.removeEventListener('touchend', handleTouchDragEnd);
    window.removeEventListener('touchcancel', handleTouchDragEnd);
    
    if (draggedId && dropTarget.index !== null) {
      handleDrop();
    }
    
    handleDragEnd();
    setTouchDragState(null);
  }, [draggedId, dropTarget, handleDrop, handleDragEnd, handleTouchDragMove]);

  const initTouchDrag = useCallback(() => {
    if (!touchStartInfoRef.current) return;
    const { part, element, touch } = touchStartInfoRef.current;
    const list = sequenceListRef.current;
    if (!list) return;

    handleDragStart(part.sequenceId);
    setTouchDragState({
        id: part.sequenceId,
        startY: touch.clientY,
        elementInitialTop: element.offsetTop,
        initialScrollTop: list.scrollTop,
        currentY: touch.clientY,
    });

    window.addEventListener('touchmove', handleTouchDragMove, { passive: false });
    window.addEventListener('touchend', handleTouchDragEnd);
    window.addEventListener('touchcancel', handleTouchDragEnd);
  }, [handleDragStart, handleTouchDragMove, handleTouchDragEnd]);

  const handleMobileDragStart = (part: SequencePart, e: React.TouchEvent) => {
    const element = (e.currentTarget as HTMLElement).closest('.sequence-item');
    // FIX: Ensure the found element is an HTMLElement instance before proceeding.
    if (!(element instanceof HTMLElement)) {
      return;
    }
    touchStartInfoRef.current = { part, element, touch: e.touches[0] };

    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = window.setTimeout(initTouchDrag, LONG_PRESS_DURATION);
  };
  
  const cancelLongPress = () => {
    clearTimeout(longPressTimerRef.current);
  };


  // Combo Stats Calculation
  const comboStats = useMemo(() => {
    const totalDamage = sequence.reduce((sum, part) => sum + (part.damage || 0), 0);
    const finalFrameAdvantage = sequence.length > 0 ? sequence[sequence.length - 1].endFrameAdvantage : undefined;
    return { totalDamage, finalFrameAdvantage };
  }, [sequence]);


  // Load YouTube API script
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
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
  }, []);

  useEffect(() => {
    // Clear any lingering interval from a previous render
    if (ytTimeCheckIntervalRef.current) {
      clearInterval(ytTimeCheckIntervalRef.current);
      ytTimeCheckIntervalRef.current = null;
    }

    if (currentPlayingIndex === null || !currentVideoUrl) {
      return;
    }

    const currentPart = sequence[currentPlayingIndex];
    if (!currentPart) return;
    
    const isLastPartInSequence = currentPlayingIndex === sequence.length - 1;
    const shouldCheckEndTime = currentPart.endTime && !isLastPartInSequence;

    if (isCurrentVideoYouTube) {
        if(isYtApiReady && ytPlayerContainerRef.current) {
            const videoId = getYouTubeVideoId(currentVideoUrl);
            if (videoId) {
                if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
                    ytPlayerRef.current.destroy();
                }
                ytPlayerRef.current = new window.YT.Player(ytPlayerContainerRef.current.id, {
                    height: '100%',
                    width: '100%',
                    videoId: videoId,
                    playerVars: { 
                      'autoplay': 1, 
                      'controls': 1, 
                      'playsinline': 1,
                      'start': Math.floor(currentPart.startTime || 0)
                    },
                    events: {
                        'onStateChange': (event: any) => {
                            if (event.data === window.YT.PlayerState.PLAYING) {
                                if (shouldCheckEndTime) {
                                  ytTimeCheckIntervalRef.current = window.setInterval(() => {
                                    const playerCurrentTime = ytPlayerRef.current.getCurrentTime();
                                    if (playerCurrentTime >= currentPart.endTime) {
                                      if (ytTimeCheckIntervalRef.current) {
                                        clearInterval(ytTimeCheckIntervalRef.current);
                                        ytTimeCheckIntervalRef.current = null;
                                      }
                                      handleVideoEnded();
                                    }
                                  }, 100);
                                }
                            }
                            if (event.data === window.YT.PlayerState.ENDED) {
                                if (ytTimeCheckIntervalRef.current) {
                                    clearInterval(ytTimeCheckIntervalRef.current);
                                    ytTimeCheckIntervalRef.current = null;
                                }
                                handleVideoEnded();
                            }
                        }
                    }
                });
            }
        }
    } else { // Native Video Player Logic
        if (videoRef.current) {
            const videoElement = videoRef.current;
            
            const handleTimeUpdate = () => {
                if (shouldCheckEndTime && videoElement.currentTime >= currentPart.endTime) {
                    videoElement.removeEventListener('timeupdate', handleTimeUpdate);
                    videoElement.removeEventListener('ended', handleVideoEndEvent);
                    handleVideoEnded();
                }
            };
            
            const onLoadedMetadata = () => {
                if (currentPart.startTime) {
                    videoElement.currentTime = currentPart.startTime;
                }
                videoElement.play().catch(error => {
                  console.error("Video play failed:", error);
                });
            };

            const handleVideoEndEvent = () => {
                handleVideoEnded();
            };
            
            videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
            videoElement.addEventListener('timeupdate', handleTimeUpdate);
            videoElement.addEventListener('ended', handleVideoEndEvent);
            
            videoElement.src = currentVideoUrl;
            videoElement.load();

            return () => {
              if (videoElement) {
                videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
                videoElement.removeEventListener('timeupdate', handleTimeUpdate);
                videoElement.removeEventListener('ended', handleVideoEndEvent);
                videoElement.pause();
                videoElement.removeAttribute('src');
                videoElement.load();
              }
            };
        }
    }

    return () => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
          ytPlayerRef.current.destroy();
          ytPlayerRef.current = null;
      }
      if (ytTimeCheckIntervalRef.current) {
        clearInterval(ytTimeCheckIntervalRef.current);
        ytTimeCheckIntervalRef.current = null;
      }
    };
  }, [currentPlayingIndex, isYtApiReady, currentVideoUrl, isCurrentVideoYouTube, handleVideoEnded, getYouTubeVideoId, sequence]);

  return (
    <div className="app-container" onTouchEnd={cancelLongPress} onTouchMove={cancelLongPress}>
      {isHowToModalOpen && isYtApiReady && <HowToModal onClose={() => setIsHowToModalOpen(false)} />}
       <PartPickerModal
        isOpen={isPartPickerModalOpen}
        onClose={() => setIsPartPickerModalOpen(false)}
        parts={filteredParts}
        onPartAdd={handleAddPartToSequence}
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
            <h2
              onClick={isMobileView ? toggleCharSelectExpansion : undefined}
              role={isMobileView ? "button" : undefined}
              aria-expanded={isCharSelectExpanded}
              aria-controls="character-select-content"
              tabIndex={isMobileView ? 0 : undefined}
              onKeyDown={isMobileView ? (e) => { if (e.key === 'Enter' || e.key === ' ') toggleCharSelectExpansion(); } : undefined}
            >
              <span>Character Select</span>
              <span className={`expand-icon ${isCharSelectExpanded ? 'expanded' : ''}`} aria-hidden="true">▼</span>
            </h2>
            <div id="character-select-content" className="collapsible-content">
              <div className="filters">
                <div className="filter-group">
                  <label htmlFor="character-filter">Character</label>
                  <select id="character-filter" name="character" value={filters.character} onChange={handleFilterChange}>
                    {CHARACTERS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <aside className={`library collapsible-section ${isLibraryExpanded ? 'expanded' : ''}`}>
            <h2
              onClick={isMobileView ? toggleLibraryExpansion : undefined}
              role={isMobileView ? "button" : undefined}
              aria-expanded={isLibraryExpanded}
              aria-controls="parts-list-container"
              tabIndex={isMobileView ? 0 : undefined}
              onKeyDown={isMobileView ? (e) => { if (e.key === 'Enter' || e.key === ' ') toggleLibraryExpansion(); } : undefined}
            >
              <span>Parts Library</span>
              <span className={`expand-icon ${isLibraryExpanded ? 'expanded' : ''}`} aria-hidden="true">▼</span>
            </h2>
            <div className="collapsible-content">
              <div className="library-tabs">
                <button
                  className={`library-tab-button ${activeLibraryTab === 'parts' ? 'active' : ''}`}
                  onClick={() => setActiveLibraryTab('parts')}
                >
                  パーツ検索
                </button>
                <button
                  className={`library-tab-button ${activeLibraryTab === 'samples' ? 'active' : ''}`}
                  onClick={() => setActiveLibraryTab('samples')}
                  disabled={sampleCombos.length === 0}
                >
                  サンプルコンボ
                </button>
              </div>

              {activeLibraryTab === 'parts' && (
                <>
                  <div className="tag-filter-container">
                    {Object.entries(TAG_CATEGORIES).map(([categoryKey, categoryName]) => {
                      const key = categoryKey as TagCategoryKey;
                      const tagsForCategory = availableTags[key];
                      if (!tagsForCategory || tagsForCategory.length === 0) return null;

                      return (
                        <div key={key} className="tag-category">
                          <h4>{categoryName}</h4>
                          <div className="tag-buttons">
                            {tagsForCategory.map(tag => (
                              <button
                                key={tag}
                                className={`tag-filter-button ${filters.tags[key].has(tag) ? 'active' : ''}`}
                                onClick={() => handleTagClick(key, tag)}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="parts-list" id="parts-list-container">
                    {isLoading ? (
                      <div className="loading-spinner" aria-label="Loading parts..."></div>
                    ) : displayedParts.length > 0 ? (
                      displayedParts.map(part => <PartCard key={part.id} part={part} onPartClick={handleAddPartToSequence} />)
                    ) : (
                      <p className="no-parts-found">No matching parts found.</p>
                    )}
                  </div>
                  {!isLoading && filteredParts.length > INITIAL_PARTS_LIMIT && (
                      <div className="show-more-container">
                        <button onClick={handleShowMoreClick} className="show-more-button">
                          {isMobileView || !showAllParts
                            ? `もっと見る (${filteredParts.length - (isMobileView ? 0 : INITIAL_PARTS_LIMIT)}件)`
                            : '表示を減らす'}
                        </button>
                      </div>
                  )}
                </>
              )}

              {activeLibraryTab === 'samples' && (
                <div className="sample-combos-list-container">
                  <div className="sample-combos-list">
                    {sampleCombos.map((sample, index) => (
                      <button key={index} className="sample-combo-button" onClick={() => handleLoadSampleCombo(sample)}>
                        {sample.name}
                      </button>
                    ))}
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
              {!currentVideoUrl && currentPlayingIndex === null ? (
                <div className="player-placeholder">Click a part from the library to add it to the sequence.</div>
              ) : (
                <>
                  <div
                    id="yt-player-container"
                    ref={ytPlayerContainerRef}
                    style={{ display: isCurrentVideoYouTube ? 'block' : 'none', width: '100%', height: '100%' }}
                  />
                  <video
                    ref={videoRef}
                    style={{ display: !isCurrentVideoYouTube ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'contain' }}
                    controls
                    playsInline
                    aria-label="Combo sequence player"
                  />
                </>
              )}
            </div>
            <div className="sequence-area">
              <div className="sequence-controls">
                <div>
                  <button
                    onClick={playSequence}
                    disabled={sequence.length === 0 || (currentPlayingIndex !== null && !isSequencePaused)}
                  >
                    {(currentPlayingIndex !== null && isSequencePaused) ? 'Resume' : 'Play'}
                  </button>
                  <button onClick={handleRewind} disabled={currentPlayingIndex === null}>Rewind 5s</button>
                  {/* FIX: The "Stop" button should call `hardStopSequence` to actually stop playback, not just pause it.
                      The disabled logic is also corrected to allow stopping while paused. */}
                  <button onClick={handlePause} disabled={currentPlayingIndex === null || isSequencePaused}>Pause</button>
                  <button onClick={hardStopSequence} disabled={currentPlayingIndex === null}>Stop</button>
                </div>
                <button 
                  className="clear-button"
                  onClick={handleClearSequence} 
                  disabled={sequence.length === 0}
                  aria-label="Clear sequence"
                >
                  Clear
                </button>
              </div>

              {sequence.length > 0 && (
                <div className="combo-stats">
                  <span className="info-item damage" aria-label={`Total Damage: ${comboStats.totalDamage}`}>
                    💥 Total Damage: {comboStats.totalDamage}
                  </span>
                  {comboStats.finalFrameAdvantage !== undefined && (
                    <span
                      className={`info-item frame-advantage ${comboStats.finalFrameAdvantage >= 0 ? 'positive' : 'negative'}`}
                      aria-label={`Final Frame Advantage: ${comboStats.finalFrameAdvantage}`}
                    >
                      ⏰ Final Frames: {comboStats.finalFrameAdvantage > 0 ? `+${comboStats.finalFrameAdvantage}` : comboStats.finalFrameAdvantage}
                    </span>
                  )}
                </div>
              )}

              <div
                ref={sequenceListRef}
                className="sequence-list-container"
                aria-label="Current combo sequence"
                onDragOver={(e) => { if (!isTouchDevice) e.preventDefault(); }}
                onDrop={!isTouchDevice ? () => { handleDrop(); handleDragEnd(); } : undefined}
              >
                {sequence.map((part, index) => {
                  const isBeingTouchDragged = touchDragState?.id === part.sequenceId;
                  let itemStyle: React.CSSProperties = {};
                  if (isBeingTouchDragged) {
                    const list = sequenceListRef.current;
                    const currentScrollTop = list ? list.scrollTop : touchDragState.initialScrollTop;
                    const scrollDelta = currentScrollTop - touchDragState.initialScrollTop;
                    const touchDelta = touchDragState.currentY - touchDragState.startY;
                    const transformY = touchDelta - scrollDelta;
                    
                    itemStyle = {
                      transform: `translateY(${transformY}px) scale(1.02)`,
                    };
                  }

                  return (
                    <React.Fragment key={part.sequenceId}>
                      {!isTouchDevice && dropTarget.index === index && dropTarget.position === 'top' && (
                        <div className="drop-indicator" />
                      )}
                      {isTouchDevice && dropTarget.index === index && dropTarget.position === 'top' && draggedId !== part.sequenceId && (
                        <div className="drop-indicator" />
                      )}

                      <SequenceItem
                        part={part}
                        onRemove={handleRemoveFromSequence}
                        isPlaying={part.sequenceId === sequence[currentPlayingIndex!]?.sequenceId}
                        isDragging={draggedId === part.sequenceId && !isTouchDevice}
                        isTouchDragging={isBeingTouchDragged}
                        onDragStart={(e) => { e.dataTransfer.setData('text/plain', part.sequenceId); handleDragStart(part.sequenceId); }}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleItemDragOver(index, e)}
                        isTouchDevice={isTouchDevice}
                        onMobileDragStart={(e) => handleMobileDragStart(part, e)}
                        style={itemStyle}
                      />

                      {!isTouchDevice && dropTarget.index === index && dropTarget.position === 'bottom' && (
                        <div className="drop-indicator" />
                      )}
                      {isTouchDevice && dropTarget.index === index && dropTarget.position === 'bottom' && draggedId !== part.sequenceId && (
                        <div className="drop-indicator" />
                      )}
                    </React.Fragment>
                  );
                })}
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