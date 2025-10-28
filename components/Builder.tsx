import React, { useState } from 'react';
import type { SequencePart, SpecialMove, UniqueMove } from '../types';
import { SequenceItem, DropIndicator } from './SequenceItem';
import { PlayIcon, PauseIcon, RewindIcon, StopIcon, StarIcon, ShareIcon, ControllerIcon } from './Icons';
import { VisualComboBuilder } from './VisualComboBuilder';

// Define props for Builder component
interface BuilderProps {
  playerState: any; // Simplified for brevity
  playerActions: any;
  playerRefs: any;
  sequence: SequencePart[];
  sequenceListRef: React.RefObject<HTMLDivElement>;
  reorder: any;
  handleRemovePart: (id: string) => void;
  comboStats: { 
    totalDamage: number; 
    finalFrameAdvantage: number | undefined;
    totalDriveCost: number;
    totalSaCost: number;
  };
  handlePlayPauseToggle: () => void;
  handleShare: () => void;
  showCopyFeedback: boolean;
  handleOpenSaveFavoriteModal: () => void;
  handleClear: () => void;
  isMobileView: boolean;
  character: string;
  specialMoves: SpecialMove[];
  uniqueMoves: UniqueMove[];
}


export const Builder: React.FC<BuilderProps> = ({
  playerState,
  playerActions,
  playerRefs,
  sequence,
  sequenceListRef,
  reorder,
  handleRemovePart,
  comboStats,
  handlePlayPauseToggle,
  handleShare,
  showCopyFeedback,
  handleOpenSaveFavoriteModal,
  handleClear,
  isMobileView,
  character,
  specialMoves,
  uniqueMoves,
}) => {
  const [isComboBuilderExpanded, setIsComboBuilderExpanded] = useState(false);
  
  return (
    <>
      <section className="builder">
        <h2>Sequence Builder</h2>
        <div className="builder-content">
          <div className="player-area">
            {!playerState.currentVideoUrl && playerState.currentPlayingIndex === null ? (
              <div className="player-placeholder">Click a part from the library to add it to the sequence.</div>
            ) : (
              <>
                <div id="yt-player-container" ref={playerRefs.ytPlayerContainerRef} style={{ display: playerState.isCurrentVideoYouTube ? 'block' : 'none', width: '100%', height: '100%' }} />
                <video ref={playerRefs.videoRef} style={{ display: !playerState.isCurrentVideoYouTube ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'contain' }} playsInline />
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
                 {comboStats.totalDriveCost > 0 && (
                  <span className="info-item drive-cost">💧 Drive Used: {comboStats.totalDriveCost}</span>
                )}
                {comboStats.totalSaCost > 0 && (
                  <span className="info-item sa-cost">🔥 SA Used: {comboStats.totalSaCost}</span>
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

      <section className={`vcb-section collapsible-section ${isComboBuilderExpanded ? 'expanded' : ''}`}>
         <h2 onClick={() => setIsComboBuilderExpanded(p => !p)} role="button">
          <span><ControllerIcon /> Visual Combo Builder</span>
          <span className={`expand-icon ${isComboBuilderExpanded ? 'expanded' : ''}`} aria-hidden="true">▼</span>
        </h2>
        <div className="collapsible-content">
          <VisualComboBuilder character={character} specialMoves={specialMoves} uniqueMoves={uniqueMoves} />
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
          <li><strong>J、前J、後J</strong> → ジャンプ。Jは垂直。</li>
          <li><strong>💥</strong> → ダメージ量を表します。</li>
          <li><strong>⏰</strong> → 技後の有利・不利フレームを表します。</li>
        </ul>
      </section>
    </>
  );
};