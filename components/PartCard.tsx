import React from 'react';
import type { ComboPart } from '../types';
import './PartCard.css';

export const PartCard: React.FC<{ part: ComboPart; onPartClick: (part: ComboPart, event: React.MouseEvent<HTMLDivElement>) => void; }> = ({ part, onPartClick }) => {
  const partTags = [
    part.tagType,
    ...(part.tagCondition || []).filter(tag => !tag.endsWith('F状況')), // 自動生成タグは表示しない
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
        {part.startFrameAdvantage != null && (
          <span
            className="info-item frame-advantage start"
            aria-label={`開始フレーム: ${part.startFrameAdvantage}`}
          >
            <span className="label">▶ 開始:</span>
            <span className="value">{part.startFrameAdvantage > 0 ? `+${part.startFrameAdvantage}` : part.startFrameAdvantage}F</span>
          </span>
        )}
        {part.endFrameAdvantage != null && (
          <span
            className={`info-item frame-advantage end ${part.endFrameAdvantage >= 0 ? 'positive' : 'negative'}`}
            aria-label={`終了フレーム: ${part.endFrameAdvantage}`}
          >
            <span className="label">⏰ 終了:</span>
            <span className="value">{part.endFrameAdvantage > 0 ? `+${part.endFrameAdvantage}` : part.endFrameAdvantage}F</span>
          </span>
        )}
      </div>
    </div>
  );
};