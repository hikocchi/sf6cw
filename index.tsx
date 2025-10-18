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


// --- 型定義 ---
export interface ComboPart {
  id: string;
  character: string;
  name: string;
  comboparts: string;
  videoUrl: string;
  tags: string[];
  order: number;
  damage?: number;
  frameAdvantage?: number;
  startTime?: number;
  endTime?: number;
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
  if (!isOpen) return null;

  const isPartInSequence = (partId: string) => {
    // This is a simple check, could be more sophisticated if needed
    return sequence.some(p => p.id === partId);
  }

  return (
    <div className="part-picker-modal-overlay" role="dialog" aria-modal="true">
      <div className="part-picker-modal-content">
        <header className="part-picker-modal-header">
          <h2>Parts Library</h2>
          <button onClick={onClose} className="part-picker-modal-close-button" aria-label="Close part picker">
            完了
          </button>
        </header>
        <div className="part-picker-modal-list">
          {parts.map(part => {
             const added = isPartInSequence(part.id);
             return (
              <div key={part.id} className="part-picker-item">
                <div className="part-picker-info">
                  <h3>{part.name}</h3>
                  <div className="tags">
                    {part.tags && part.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
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
        {part.tags && part.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
      </div>
      <div className="part-info">
        {part.damage != null && (
          <span className="info-item damage" aria-label={`Damage: ${part.damage}`}>
            💥 {part.damage}
          </span>
        )}
        {part.frameAdvantage != null && (
          <span
            className={`info-item frame-advantage ${part.frameAdvantage >= 0 ? 'positive' : 'negative'}`}
            aria-label={`Frame advantage: ${part.frameAdvantage}`}
          >
            ⏰ {part.frameAdvantage > 0 ? `+${part.frameAdvantage}` : part.frameAdvantage}
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
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
}> = ({ part, onRemove, isPlaying, isDragging, onDragStart, onDragEnd, onDragOver }) => {
  return (
    <div 
      className={`sequence-item ${isPlaying ? 'playing' : ''} ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
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
  
  const [filters, setFilters] = useState({ character: CHARACTERS[0] || '', tags: [] as string[] });
  const [sequence, setSequence] = useState<SequencePart[]>([]);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const [isSequencePaused, setIsSequencePaused] = useState(false);
  const [isYtApiReady, setYtApiReady] = useState(false);
  const [isCharSelectExpanded, setIsCharSelectExpanded] = useState(true);
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(true);
  const [isSampleCombosExpanded, setIsSampleCombosExpanded] = useState(true);
  const [isHowToModalOpen, setIsHowToModalOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= MOBILE_BREAKPOINT);
  const [showAllParts, setShowAllParts] = useState(false);
  const [isPartPickerModalOpen, setIsPartPickerModalOpen] = useState(false);
  const [dropTarget, setDropTarget] = useState<{ index: number | null; position: 'top' | 'bottom' | null }>({ index: null, position: null });


  const videoRef = useRef<HTMLVideoElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytPlayerContainerRef = useRef<HTMLDivElement>(null);
  const ytTimeCheckIntervalRef = useRef<number | null>(null);

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
            setIsSampleCombosExpanded(true);
        }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
}, []);


  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ character: e.target.value, tags: [] }); // キャラクター変更時にタグフィルターをリセット
  };

  const handleTagClick = (tag: string) => {
    setFilters(prevFilters => {
        const newTags = prevFilters.tags.includes(tag)
            ? prevFilters.tags.filter(t => t !== tag)
            : [...prevFilters.tags, tag];
        return { ...prevFilters, tags: newTags };
    });
  };

  const availableTags = useMemo(() => {
    const allTags = comboParts.flatMap(part => part.tags || []);
    return [...new Set(allTags)].sort();
  }, [comboParts]);

  const filteredParts = useMemo(() => {
    if (filters.tags.length === 0) {
      return comboParts;
    }
    return comboParts.filter(part =>
        filters.tags.every(tag => part.tags && part.tags.includes(tag))
    );
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
  const toggleSampleCombosExpansion = () => setIsSampleCombosExpanded(prev => !prev);
  const handleShowMoreClick = () => {
    if (isMobileView) {
      setIsPartPickerModalOpen(true);
    } else {
      setShowAllParts(prev => !prev);
    }
  };


  // Drag and Drop Handlers
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTarget({ index: null, position: null });
  };

  const handleItemDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    // ドラッグ中のアイテム自身の上ではターゲットを更新しないことで、インジケーターのちらつきを防ぐ
    if (sequence[index]?.sequenceId === draggedId) {
        return;
    }
    const targetElement = e.currentTarget as HTMLDivElement;
    const rect = targetElement.getBoundingClientRect();
    const isTopHalf = e.clientY < rect.top + rect.height / 2;
    const newPosition = isTopHalf ? 'top' : 'bottom';

    if (dropTarget.index !== index || dropTarget.position !== newPosition) {
        setDropTarget({ index, position: newPosition });
    }
  };

  const handleDrop = () => {
    if (!draggedId || dropTarget.index === null) return;

    const currentSequence = [...sequence];
    const draggedIndex = currentSequence.findIndex(p => p.sequenceId === draggedId);
    if (draggedIndex === -1) return;

    const [draggedItem] = currentSequence.splice(draggedIndex, 1);

    let targetIndex = dropTarget.index;
    if (draggedIndex < targetIndex) {
        targetIndex--; 
    }
    
    const insertAtIndex = dropTarget.position === 'top' ? targetIndex : targetIndex + 1;
    
    currentSequence.splice(insertAtIndex, 0, draggedItem);
    setSequence(currentSequence);
  };

  // Combo Stats Calculation
  const comboStats = useMemo(() => {
    const totalDamage = sequence.reduce((sum, part) => sum + (part.damage || 0), 0);
    const finalFrameAdvantage = sequence.length > 0 ? sequence[sequence.length - 1].frameAdvantage : undefined;
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
    <div className="app-container">
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
              {sampleCombos.length > 0 && (
                <div className={`sample-combos-container ${isSampleCombosExpanded ? 'expanded' : ''}`}>
                  <h3
                    onClick={isMobileView ? toggleSampleCombosExpansion : undefined}
                    role={isMobileView ? "button" : undefined}
                    aria-expanded={isSampleCombosExpanded}
                    aria-controls="sample-combos-list-container"
                    tabIndex={isMobileView ? 0 : undefined}
                    onKeyDown={isMobileView ? (e) => { if (e.key === 'Enter' || e.key === ' ') toggleSampleCombosExpansion(); } : undefined}
                  >
                    <span>Sample Combos</span>
                    <span className={`expand-icon ${isSampleCombosExpanded ? 'expanded' : ''}`} aria-hidden="true">▼</span>
                  </h3>
                  <div id="sample-combos-list-container" className="sample-combos-content">
                    <div className="sample-combos-list">
                      {sampleCombos.map((sample, index) => (
                        <button key={index} className="sample-combo-button" onClick={() => handleLoadSampleCombo(sample)}>
                          {sample.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="tag-filter-container">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    className={`tag-filter-button ${filters.tags.includes(tag) ? 'active' : ''}`}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </button>
                ))}
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
                  <button onClick={handlePause} disabled={currentPlayingIndex === null || isSequencePaused}>Stop</button>
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
                className="sequence-list-container"
                aria-label="Current combo sequence"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                {sequence.map((part, index) => (
                  <React.Fragment key={part.sequenceId}>
                    {dropTarget.index === index && dropTarget.position === 'top' && (
                       <div className="drop-indicator" />
                    )}
                    <SequenceItem
                      part={part}
                      onRemove={handleRemoveFromSequence}
                      isPlaying={part.sequenceId === sequence[currentPlayingIndex!]?.sequenceId}
                      isDragging={draggedId === part.sequenceId}
                      onDragStart={() => handleDragStart(part.sequenceId)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleItemDragOver(index, e)}
                    />
                    {dropTarget.index === index && dropTarget.position === 'bottom' && (
                       <div className="drop-indicator" />
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
          </ul>
        </section>
      </main>
      <footer>
        <div className="footer-content">
          <section className="update-history">
            <h3>更新履歴</h3>
            <ul>
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