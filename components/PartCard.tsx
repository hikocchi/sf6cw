import React from 'react';
import type { ComboPart } from '../types';

export const PartCard: React.FC<{ part: ComboPart; onPartClick: (part: ComboPart, event: React.MouseEvent<HTMLDivElement>) => void; }> = ({ part, onPartClick }) => {
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
      onClick={(e) => onPartClick(part, e)}
      aria-label={`Click to add ${part.name}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPartClick(part, e as any); }}
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