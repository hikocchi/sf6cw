import React, { useEffect, useRef } from 'react';
import type { ComboPart, SequencePart } from '../types';
import './PartPickerModal.css';

export const PartPickerModal: React.FC<{
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
    return sequence.some(p => p.id === partId);
  }

  const getPartTags = (part: ComboPart) => {
    return [
      part.tagType,
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