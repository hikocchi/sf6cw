import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AVAILABLE_CHARACTERS, CHARACTER_ID_MAP, CHARACTER_NAME_MAP } from './data';
import { HowToModal } from './components/HowToModal';
import { PartPickerModal } from './components/PartPickerModal';
import { PartCard } from './components/PartCard';
import { SequenceItem, DropIndicator } from './components/SequenceItem';
import { PlayIcon, PauseIcon, RewindIcon, StopIcon, StarIcon, ShareIcon } from './components/Icons';
import { useDeviceState } from './hooks/useDeviceState';
import { useCharacterData } from './hooks/useCharacterData';
import { useFilters } from './hooks/useFilters';
import { useSequence } from './hooks/useSequence';
import { useVideoPlayer } from './hooks/useVideoPlayer';
import { useSequenceReorder } from './hooks/useSequenceReorder';
import { useFavorites } from './hooks/useFavorites';
import { TAG_CATEGORIES, INITIAL_PARTS_LIMIT } from './constants';
import type { TagCategoryKey, ComboPart, SampleCombo, FavoriteCombo, SequencePart } from './types';

// --- Save Favorite Modal Component ---
interface SaveFavoriteModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
}

const SaveFavoriteModal: React.FC<SaveFavoriteModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSave();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content save-favorite-modal" onClick={(e) => e.stopPropagation()}>
        <h2>お気に入りに保存</h2>
        <p>このコンボの名前を入力してください。</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="例：画面端 最大ダメージ"
          autoFocus
        />
        <div className="modal-actions">
          <button onClick={onClose} className="cancel-button">キャンセル</button>
          <button onClick={handleSave} className="save-button" disabled={!name.trim()}>保存</button>
        </div>
      </div>
    </div>
  );
};


export const App = () => {
  const [character, setCharacter] = useState(() => localStorage.getItem('sf6-cw-character') || AVAILABLE_CHARACTERS[0] || '');
  const [activeTab, setActiveTab] = useState<'library' | 'samples' | 'favorites'>('library');

  const { isMobileView } = useDeviceState();
  const { comboParts, sampleCombos, isLoading } = useCharacterData(character);
  const { tags, handleTagClick, resetFilters, availableTags, filteredParts } = useFilters(comboParts);
  const { sequence, setSequence, addPartToSequence, removeFromSequence, clearSequence, loadSampleCombo, comboStats } = useSequence();
  const { refs: playerRefs, state: playerState, actions: playerActions } = useVideoPlayer(sequence);
  const reorder = useSequenceReorder(sequence, setSequence);
  const { favorites, saveFavorite, deleteFavorite } = useFavorites();
  
  const [showAllParts, setShowAllParts] = useState(false);
  const [isPartPickerModalOpen, setIsPartPickerModalOpen] = useState(false);
  const [isCharSelectExpanded, setIsCharSelectExpanded] = useState(true);
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(true);
  const [isHowToModalOpen, setIsHowToModalOpen] = useState(false);
  const [isSaveFavoriteModalOpen, setIsSaveFavoriteModalOpen] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);


  const didRestoreFromUrl = useRef(false);
  const didRestoreSession = useRef(false);
  const sequenceListRef = useRef<HTMLDivElement>(null);

  // Restore from URL (highest priority)
  useEffect(() => {
    if (isLoading || comboParts.length === 0 || didRestoreFromUrl.current) return;
  
    const params = new URLSearchParams(window.location.search);
    const charIdFromUrl = params.get('c');
    const partIdsFromUrl = params.get('p');
  
    if (charIdFromUrl && partIdsFromUrl && CHARACTER_NAME_MAP[charIdFromUrl]) {
      const charName = CHARACTER_NAME_MAP[charIdFromUrl];
      const partNumbers = partIdsFromUrl.split(',');
      
      const restoredSequence = partNumbers.map(partNum => {
        const fullPartId = `${charIdFromUrl}-${partNum}`;
        const part = comboParts.find(p => p.id === fullPartId);
        return part ? { ...part, sequenceId: `${part.id}-${Date.now()}-${Math.random()}` } : null;
      }).filter(Boolean) as SequencePart[];
  
      if (restoredSequence.length > 0) {
        if (character !== charName) {
          setCharacter(charName);
        }
        setSequence(restoredSequence);
        didRestoreFromUrl.current = true;
  
        // Clean the URL to avoid re-loading on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [isLoading, comboParts, character, setSequence]);

  // Save/Restore session from localStorage (if not restored from URL)
  useEffect(() => {
    localStorage.setItem('sf6-cw-character', character);
  }, [character]);

  useEffect(() => {
    // Only save to localStorage if the sequence wasn't just loaded from a URL
    if (!didRestoreFromUrl.current) {
        const sequenceToSave = sequence.map(part => part.id);
        localStorage.setItem('sf6-cw-sequence', JSON.stringify(sequenceToSave));
    }
  }, [sequence]);

  useEffect(() => {
    if (didRestoreSession.current || didRestoreFromUrl.current || isLoading || comboParts.length === 0) return;
    try {
      const savedSequenceIds: string[] = JSON.parse(localStorage.getItem('sf6-cw-sequence') || '[]');
      if (savedSequenceIds.length > 0) {
        const restoredSequence = savedSequenceIds.map(partId => {
          const part = comboParts.find(p => p.id === partId);
          if (!part) return null;
          return { ...part, sequenceId: `${part.id}-${Date.now()}-${Math.random()}` };
        }).filter(Boolean) as SequencePart[];
        setSequence(restoredSequence);
      }
    } catch (e) {
      console.error("Failed to restore sequence from localStorage:", e);
      localStorage.removeItem('sf6-cw-sequence');
    }
    didRestoreSession.current = true;
  }, [isLoading, comboParts, setSequence]);


  useEffect(() => {
    if (!isMobileView) {
        setIsCharSelectExpanded(true);
        setIsLibraryExpanded(true);
    }
  }, [isMobileView]);

  useEffect(() => {
    setShowAllParts(false);
    setActiveTab('library');
  }, [tags, character]);
  
  const handleCharacterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCharacter(e.target.value);
    resetFilters();
    clearSequence();
    playerActions.hardStopSequence();
  };
  
  const handleAddPart = (part: ComboPart, event: React.MouseEvent<HTMLDivElement>) => {
    // Animation logic
    const partCardEl = event.currentTarget;
    const sequenceListEl = sequenceListRef.current;
    if (sequenceListEl) {
        const startRect = partCardEl.getBoundingClientRect();
        const endRect = sequenceListEl.getBoundingClientRect();
        
        const clone = partCardEl.cloneNode(true) as HTMLElement;
        clone.classList.add('flying-part-card-clone');
        clone.style.top = `${startRect.top}px`;
        clone.style.left = `${startRect.left}px`;
        clone.style.width = `${startRect.width}px`;
        clone.style.height = `${startRect.height}px`;

        document.body.appendChild(clone);

        requestAnimationFrame(() => {
            const targetX = endRect.left + (endRect.width / 2) - (startRect.width / 2);
            const targetY = endRect.top + endRect.height - startRect.height;
            clone.style.transform = `translate(${targetX - startRect.left}px, ${targetY - startRect.top}px) scale(0.5)`;
            clone.style.opacity = '0';
            clone.style.transformOrigin = 'center center';
        });

        clone.addEventListener('transitionend', () => {
            clone.remove();
        }, { once: true });
    }

    // Add part to sequence
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
  
  const handlePlayPauseToggle = () => {
    if (playerState.currentPlayingIndex !== null && !playerState.isSequencePaused) {
      playerActions.pauseSequence();
    } else {
      playerActions.playSequence();
    }
  };

  const handleOpenSaveFavoriteModal = () => {
    setIsSaveFavoriteModalOpen(true);
  };

  const handleConfirmSaveFavorite = (name: string) => {
    saveFavorite(sequence, name, character);
    setIsSaveFavoriteModalOpen(false);
    setActiveTab('favorites');
  };

  const handleLoadFavorite = (favorite: FavoriteCombo) => {
    if (character !== favorite.character) {
        if(window.confirm(`このコンボは${favorite.character}用です。キャラクターを切り替えますか？`)) {
            setCharacter(favorite.character);
            // Character change will trigger data loading, so we need to load combo after that.
            // For simplicity, we just switch character for now. User can click load again.
            // A more robust solution would queue the load action.
            return;
        } else {
            return;
        }
    }
    playerActions.hardStopSequence();
    loadSampleCombo({ name: favorite.name, parts: favorite.partIds }, comboParts);
  };
  
  const handleDeleteFavorite = (favoriteId: string) => {
    if (window.confirm("このお気に入りコンボを削除しますか？")) {
      deleteFavorite(favoriteId);
    }
  };
  
  const handleShare = () => {
    if (sequence.length === 0) return;
  
    const charId = CHARACTER_ID_MAP[character];
    if (!charId) {
      alert("共有URLの生成に失敗しました。");
      return;
    }
  
    const partNumbers = sequence.map(p => p.id.replace(`${charId}-`, '')).join(',');
    const url = new URL(window.location.origin + window.location.pathname);
    url.search = `?c=${charId}&p=${partNumbers}`;
  
    const shareText = `
【${character}】のコンボを SF6 Combo Weaver で練習中！
Total Damage: ${comboStats.totalDamage}

▼コンボレシピはこちら
${url.toString()}

#SF6 #SF6CW
  `.trim();

    navigator.clipboard.writeText(shareText).then(() => {
        setShowCopyFeedback(true);
        setTimeout(() => setShowCopyFeedback(false), 2000);
    }).catch(err => {
        console.error('共有テキストのコピーに失敗しました: ', err);
        alert('共有テキストのコピーに失敗しました。');
    });
  };

  const displayedParts = useMemo(() => {
    return showAllParts ? filteredParts : filteredParts.slice(0, INITIAL_PARTS_LIMIT);
  }, [filteredParts, showAllParts]);
  
  const characterFavorites = useMemo(() => {
    return favorites.filter(f => f.character === character);
  }, [favorites, character]);

  return (
    <div className="app-container">
      {isHowToModalOpen && playerState.isYtApiReady && <HowToModal onClose={() => setIsHowToModalOpen(false)} />}
      {isSaveFavoriteModalOpen && (
        <SaveFavoriteModal
          onClose={() => setIsSaveFavoriteModalOpen(false)}
          onSave={handleConfirmSaveFavorite}
        />
      )}
       <PartPickerModal
        isOpen={isPartPickerModalOpen}
        onClose={() => setIsPartPickerModalOpen(false)}
        parts={filteredParts}
        onPartAdd={(part) => handleAddPart(part, null!)} // Event is null for modal
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
              <span>Library</span>
              <span className={`expand-icon ${isLibraryExpanded ? 'expanded' : ''}`} aria-hidden="true">▼</span>
            </h2>
            <div className="collapsible-content">
               <div className="library-tabs">
                <button
                  className={`tab-button ${activeTab === 'library' ? 'active' : ''}`}
                  onClick={() => setActiveTab('library')}
                >
                  パーツ検索
                </button>
                <button
                  className={`tab-button ${activeTab === 'samples' ? 'active' : ''}`}
                  onClick={() => setActiveTab('samples')}
                  disabled={sampleCombos.length === 0}
                >
                  サンプル
                </button>
                 <button
                  className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
                  onClick={() => setActiveTab('favorites')}
                >
                  お気に入り
                </button>
              </div>
              <div className="tab-content">
                {activeTab === 'library' && (
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
                 {activeTab === 'samples' && (
                  <div className="sample-combos-list">
                    {isLoading ? <div className="loading-spinner"></div> :
                      sampleCombos.length > 0 ? sampleCombos.map(sample => (
                        <div key={sample.name} className="sample-combo-card">
                          <h3>{sample.name}</h3>
                          <div className="sample-combo-parts">
                            {sample.parts.map(partId => {
                              const part = comboParts.find(p => p.id === partId);
                              return part ? <span key={`${sample.name}-${partId}`} className="tag">{part.name}</span> : null;
                            })}
                          </div>
                          <div className="card-actions">
                            <button className="load-sample-button" onClick={() => handleLoadSample(sample)}>
                              このコンボをロード
                            </button>
                          </div>
                        </div>
                      )) : <p className="no-parts-found">サンプルコンボがありません。</p>
                    }
                  </div>
                )}
                 {activeTab === 'favorites' && (
                  <div className="favorites-list">
                    {isLoading ? <div className="loading-spinner"></div> :
                      characterFavorites.length > 0 ? characterFavorites.map(fav => (
                        <div key={fav.id} className="favorite-combo-card">
                          <h3>{fav.name}</h3>
                          <div className="favorite-combo-parts">
                            {fav.partIds.map(partId => {
                              const part = comboParts.find(p => p.id === partId);
                              return part ? <span key={`${fav.id}-${partId}`} className="tag">{part.name}</span> : null;
                            })}
                          </div>
                          <div className="card-actions">
                             <button className="delete-favorite-button" onClick={() => handleDeleteFavorite(fav.id)}>削除</button>
                            <button className="load-favorite-button" onClick={() => handleLoadFavorite(fav)}>
                              ロード
                            </button>
                          </div>
                        </div>
                      )) : <p className="no-parts-found">{character}のお気に入りコンボはありません。</p>
                    }
                  </div>
                )}
              </div>
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
                <div className="player-controls-main">
                  <button
                    className="player-control-button"
                    onClick={playerActions.rewindSequence}
                    disabled={playerState.currentPlayingIndex === null}
                    aria-label="Rewind 5 seconds"
                  >
                    <RewindIcon />
                    <span>Rewind 5s</span>
                  </button>
                  <button
                    className="player-control-button play-pause-button"
                    onClick={handlePlayPauseToggle}
                    disabled={sequence.length === 0}
                    aria-label={
                      playerState.currentPlayingIndex !== null && !playerState.isSequencePaused ? 'Pause' 
                      : (playerState.isSequencePaused ? 'Resume' : 'Play')
                    }
                  >
                    {playerState.currentPlayingIndex !== null && !playerState.isSequencePaused ? <PauseIcon /> : <PlayIcon />}
                    <span>
                      {
                        playerState.currentPlayingIndex !== null && !playerState.isSequencePaused ? 'Pause' 
                        : (playerState.isSequencePaused ? 'Resume' : 'Play')
                      }
                    </span>
                  </button>
                  <button
                    className="player-control-button"
                    onClick={playerActions.hardStopSequence}
                    disabled={playerState.currentPlayingIndex === null}
                    aria-label="Stop"
                  >
                    <StopIcon />
                    <span>Stop</span>
                  </button>
                </div>
                <div className="sequence-actions-right">
                  <div className={`copy-feedback ${showCopyFeedback ? 'visible' : ''}`}>
                    共有テキストをコピーしました！
                  </div>
                  <button
                    className="player-control-button"
                    onClick={handleShare}
                    disabled={sequence.length === 0}
                    title="Share combo via URL"
                  >
                    <ShareIcon />
                    <span>Share</span>
                  </button>
                  <button
                    className="player-control-button"
                    onClick={handleOpenSaveFavoriteModal}
                    disabled={sequence.length === 0}
                    title="Save combo to favorites"
                  >
                    <StarIcon />
                    <span>Save</span>
                  </button>
                  <button className="clear-button" onClick={handleClear} disabled={sequence.length === 0}>Clear</button>
                </div>
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

              <div 
                ref={sequenceListRef}
                className="sequence-list-container"
                onDrop={isMobileView ? undefined : reorder.desktopActions.handleDrop}
                onDragLeave={isMobileView ? undefined : reorder.desktopActions.handleDragLeave}
                onDragOver={isMobileView ? undefined : (e) => e.preventDefault()}
                onTouchMove={isMobileView ? reorder.mobileActions.handleTouchMove : undefined}
                onTouchEnd={isMobileView ? reorder.mobileActions.handleTouchEnd : undefined}
                onTouchCancel={isMobileView ? reorder.mobileActions.handleTouchEnd : undefined}
              >
                <DropIndicator isOver={reorder.dragOverIndex === 0} />
                {sequence.map((part, index) => {
                  const draggableProps = isMobileView
                    ? { onTouchStart: () => reorder.mobileActions.handleTouchStart(part.sequenceId) }
                    : {
                        draggable: true,
                        onDragStart: (e: React.DragEvent) => reorder.desktopActions.handleDragStart(e, part.sequenceId),
                        onDragEnd: reorder.desktopActions.handleDragEnd,
                        onDragOver: (e: React.DragEvent) => reorder.desktopActions.handleDragOver(e, index),
                      };

                  return (
                    <React.Fragment key={part.sequenceId}>
                      <SequenceItem
                        part={part}
                        onRemove={handleRemovePart}
                        isPlaying={part.sequenceId === sequence[playerState.currentPlayingIndex]?.sequenceId}
                        isDragging={reorder.draggingPartId === part.sequenceId}
                        draggableProps={draggableProps}
                      />
                      <DropIndicator isOver={reorder.dragOverIndex === index + 1} />
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
            {/* FIX: The list items were not wrapped in a `<ul>` tag, causing a JSX parsing error. */}
            <ul>
              <li>2025.10.22 - コミュニティ機能の第一歩として、コンボ共有リンク機能を実装。</li>
              <li>2025.10.21 - UI/UXを向上。お気に入り登録機能、セッション復元機能、パーツ追加アニメーションを実装。</li>
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
              This site does not collect or use any user cookies or personally identifiable information. Session data is stored only in your browser's local storage.
              <br />
              当サイトは、利用者のCookie情報や個人を特定する情報を収集・利用することはありません。セッションデータは、お使いのブラウザのローカルストレージにのみ保存されます。
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