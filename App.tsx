import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AVAILABLE_CHARACTERS, CHARACTER_ID_MAP, CHARACTER_NAME_MAP } from './data';
import { HowToModal } from './components/HowToModal';
import { PartPickerModal } from './components/PartPickerModal';
import { SaveFavoriteModal } from './components/SaveFavoriteModal';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Builder } from './components/Builder';
import { Footer } from './components/Footer';
import { useDeviceState } from './hooks/useDeviceState';
import { useCharacterData } from './hooks/useCharacterData';
import { useFilters } from './hooks/useFilters';
import { useSequence } from './hooks/useSequence';
import { useVideoPlayer } from './hooks/useVideoPlayer';
import { useSequenceReorder } from './hooks/useSequenceReorder';
import { useFavorites } from './hooks/useFavorites';
import { INITIAL_PARTS_LIMIT } from './constants';
import type { ComboPart, SampleCombo, FavoriteCombo, SequencePart } from './types';
import './App.css';
import './components/Modal.css';

export type SortOrder = 'default' | 'damage_desc' | 'damage_asc';

export const App = () => {
  const [character, setCharacter] = useState(() => localStorage.getItem('sf6-cw-character') || AVAILABLE_CHARACTERS[0] || '');
  
  const { isMobileView } = useDeviceState();
  const { comboParts, sampleCombos, moves, isLoading } = useCharacterData(character);
  const { tags, handleTagClick, resetFilters, availableTags, filteredParts, dynamicallyAvailableTags } = useFilters(comboParts);
  const { sequence, setSequence, addPartToSequence, removeFromSequence, clearSequence, loadSampleCombo, comboStats } = useSequence();
  const { refs: playerRefs, state: playerState, actions: playerActions } = useVideoPlayer(sequence);
  const reorder = useSequenceReorder(sequence, setSequence);
  const { favorites, saveFavorite, deleteFavorite } = useFavorites();
  
  const [showAllParts, setShowAllParts] = useState(false);
  const [isPartPickerModalOpen, setIsPartPickerModalOpen] = useState(false);
  const [isHowToModalOpen, setIsHowToModalOpen] = useState(false);
  const [isSaveFavoriteModalOpen, setIsSaveFavoriteModalOpen] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');

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
    setShowAllParts(false);
  }, [tags, character]);
  
  const handleCharacterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCharacter(e.target.value);
    resetFilters();
    setSortOrder('default');
    clearSequence();
    playerActions.hardStopSequence();
  };
  
  const handleAddPart = (part: ComboPart, event: React.MouseEvent<HTMLDivElement>) => {
    // Animation logic
    if (event) {
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
    }

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

  const sortedParts = useMemo(() => {
    const sorted = [...filteredParts];
    if (sortOrder === 'damage_asc') {
      sorted.sort((a, b) => (a.damage || 0) - (b.damage || 0));
    } else if (sortOrder === 'damage_desc') {
      sorted.sort((a, b) => (b.damage || 0) - (a.damage || 0));
    }
    return sorted;
  }, [filteredParts, sortOrder]);

  const displayedParts = useMemo(() => {
    return showAllParts ? sortedParts : sortedParts.slice(0, INITIAL_PARTS_LIMIT);
  }, [sortedParts, showAllParts]);
  
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

      <Header onHowToClick={() => setIsHowToModalOpen(true)} />

      <main>
        <Sidebar
          character={character}
          availableCharacters={AVAILABLE_CHARACTERS}
          isMobileView={isMobileView}
          handleCharacterChange={handleCharacterChange}
          isLoading={isLoading}
          comboParts={comboParts}
          sampleCombos={sampleCombos}
          tags={tags}
          handleTagClick={handleTagClick}
          availableTags={availableTags}
          dynamicallyAvailableTags={dynamicallyAvailableTags}
          filteredParts={filteredParts}
          displayedParts={displayedParts}
          onPartAdd={handleAddPart}
          handleLoadSample={handleLoadSample}
          handleLoadFavorite={handleLoadFavorite}
          handleDeleteFavorite={handleDeleteFavorite}
          handleShowMoreClick={handleShowMoreClick}
          showAllParts={showAllParts}
          characterFavorites={characterFavorites}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />
        <Builder
          playerState={playerState}
          playerActions={playerActions}
          playerRefs={playerRefs}
          sequence={sequence}
          sequenceListRef={sequenceListRef}
          reorder={reorder}
          handleRemovePart={handleRemovePart}
          comboStats={comboStats}
          handlePlayPauseToggle={handlePlayPauseToggle}
          handleShare={handleShare}
          showCopyFeedback={showCopyFeedback}
          handleOpenSaveFavoriteModal={handleOpenSaveFavoriteModal}
  handleClear={handleClear}
          isMobileView={isMobileView}
          character={character}
          moves={moves}
        />
      </main>

      <Footer />
    </div>
  );
};