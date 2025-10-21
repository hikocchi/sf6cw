import React from 'react';
import type { SequencePart } from '../types';

export const SequenceItem: React.FC<{
  part: SequencePart;
  onRemove: (sequenceId: string) => void;
  isPlaying: boolean;
  isDragging?: boolean;
  draggableProps: Record<string, any>;
}> = ({
  part,
  onRemove,
  isPlaying,
  isDragging,
  draggableProps,
}) => {
  const itemClass = `
    sequence-item
    ${isPlaying ? 'playing' : ''}
    ${isDragging ? 'dragging' : ''}
  `;
  
  return (
    <div 
      className={itemClass}
      {...draggableProps}
    >
      <button
        className="drag-handle"
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

export const DropIndicator: React.FC<{ isOver: boolean }> = ({ isOver }) => {
  return (
    <div
      className={`drop-indicator ${isOver ? 'active' : ''}`}
    />
  );
};
