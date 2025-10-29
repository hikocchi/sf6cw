import React, { useState, useEffect, useMemo } from 'react';
import type { Move } from '../types';
import {
  ArrowUpLeft, ArrowUp, ArrowUpRight, ArrowLeft, ArrowRight,
  ArrowDownLeft, ArrowDown, ArrowDownRight
} from './Icons';
import './VisualComboBuilder.css';

interface VisualComboBuilderProps {
  character: string;
  moves: Move[];
}

const DIRECTIONS = [
  { key: 'up-left', label: '左斜上', icon: <ArrowUpLeft /> },
  { key: 'up', label: '上', icon: <ArrowUp /> },
  { key: 'up-right', label: '右斜上', icon: <ArrowUpRight /> },
  { key: 'left', label: '引', icon: <ArrowLeft /> },
  { key: 'neutral', label: 'N', icon: null },
  { key: 'right', label: '前', icon: <ArrowRight /> },
  { key: 'down-left', label: '左斜下', icon: <ArrowDownLeft /> },
  { key: 'down', label: '屈', icon: <ArrowDown /> },
  { key: 'down-right', label: '右斜下', icon: <ArrowDownRight /> },
];

const ACTION_BUTTONS = [
  { label: '弱P', notation: '弱P' }, { label: '中P', notation: '中P' }, { label: '強P', notation: '強P' },
  { label: '弱K', notation: '弱K' }, { label: '中K', notation: '中K' }, { label: '強K', notation: '強K' },
];

const SPECIAL_ACTIONS = [
  // Row 1
  { label: '投げ', notation: '弱P+弱K', driveCost: 0, saCost: 0 },
  { label: 'パリィ', notation: '中P+中K', driveCost: 0.5, saCost: 0 },
  { label: 'DI', notation: '強P+強K', driveCost: 1, saCost: 0 },
  // Row 2
  { label: 'R', notation: 'R', driveCost: 1, saCost: 0 },
  { label: 'CR', notation: 'CR', driveCost: 3, saCost: 0 },
  // Row 3
  { label: 'PPP', notation: 'PPP', driveCost: 0, saCost: 0 },
  { label: 'KKK', notation: 'KKK', driveCost: 0, saCost: 0 },
  { label: 'PP', notation: 'PP', driveCost: 0, saCost: 0 },
  { label: 'KK', notation: 'KK', driveCost: 0, saCost: 0 },
];

export const VisualComboBuilder: React.FC<VisualComboBuilderProps> = ({ character, moves }) => {
  const [comboString, setComboString] = useState('');
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const [driveGauge, setDriveGauge] = useState(0);
  const [saGauge, setSaGauge] = useState(0);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  useEffect(() => {
    handleClear();
  }, [character]);

  const handleClear = () => {
    setComboString('');
    setSelectedDirection(null);
    setDriveGauge(0);
    setSaGauge(0);
  };
  
  const handleInput = (notation: string, driveCost: number = 0, saCost: number = 0) => {
    const directionLabel = DIRECTIONS.find(d => d.key === selectedDirection)?.label || '';
    const part = `${directionLabel ? `${directionLabel}` : ''}${notation}`;
    const newCombo = comboString ? `${comboString} > ${part}` : part;

    setComboString(newCombo);
    setDriveGauge(prev => prev + driveCost);
    setSaGauge(prev => prev + saCost);
    setSelectedDirection(null);
  };

  const handleDelete = () => {
    if (!comboString) return;

    const parts = comboString.split(' > ');
    if (parts.length > 0) {
      parts.pop();
      setComboString(parts.join(' > '));
      // NOTE: For simplicity, gauge reset is not implemented on delete.
      // A more complex implementation would be needed to parse and recalculate.
    }
  };
  
  const handleCopy = () => {
    if (!comboString) return;
    navigator.clipboard.writeText(comboString).then(() => {
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    });
  };

  const specialMoves = useMemo(() => moves.filter(m => m.type === 'special'), [moves]);
  const uniqueMoves = useMemo(() => moves.filter(m => m.type === 'unique'), [moves]);
  const saMoves = useMemo(() => moves.find(m => m.type === 'sa'), [moves]);

  return (
    <div className="visual-combo-builder">
      <div className="vcb-display-area">
        <div className="vcb-display" title={comboString || "ここにコンボが表示されます"}>
          {comboString || <span className="vcb-placeholder">ここにコンボが表示されます</span>}
        </div>
        <div className="vcb-controls">
          <div className={`vcb-feedback ${showCopyFeedback ? 'visible' : ''}`}>コピーしました！</div>
          <button onClick={handleDelete} disabled={!comboString}>1コマンド削除</button>
          <button onClick={handleClear} disabled={!comboString}>全コマンド削除</button>
          <button onClick={handleCopy} disabled={!comboString}>コピー</button>
        </div>
      </div>
      <div className="vcb-resources">
        <div className={`vcb-gauge drive ${driveGauge > 6 ? 'vcb-warning' : ''}`}>
          <span>DRIVE</span>
          <div>{Array.from({ length: 6 }).map((_, i) => <i key={i} className={i < driveGauge ? 'filled' : ''}></i>)}</div>
          <span>{driveGauge.toFixed(1)} / 6</span>
        </div>
         <div className={`vcb-gauge sa ${saGauge > 3 ? 'vcb-warning' : ''}`}>
          <span>SA</span>
          <div>{Array.from({ length: 3 }).map((_, i) => <i key={i} className={i < saGauge ? 'filled' : ''}></i>)}</div>
          <span>{saGauge} / 3</span>
        </div>
      </div>
      <p className="vcb-notation-notice">※コマンド表記は全て1P側のものです。</p>
      <div className="vcb-controller-area">
        <div className="vcb-controller-left">
          <div className="vcb-d-pad">
            {DIRECTIONS.map(({ key, label, icon }) => (
              <button
                key={key}
                className={`${key} ${selectedDirection === key ? 'active' : ''}`}
                onClick={() => key !== 'neutral' && setSelectedDirection(key === selectedDirection ? null : key)}
                disabled={key === 'neutral'}
                aria-label={label}
              >
                {icon}
              </button>
            ))}
          </div>
          <div className="vcb-inputs-right">
            <div className="vcb-action-buttons">
              {ACTION_BUTTONS.map(({ label, notation }) => (
                <button key={label} onClick={() => handleInput(notation)}>{label}</button>
              ))}
            </div>
            <div className="vcb-special-inputs">
                <div className="vcb-special-inputs-row">
                {SPECIAL_ACTIONS.slice(0, 3).map(({ label, notation, driveCost }) => (
                  <button key={label} onClick={() => handleInput(notation, driveCost, 0)}>{label}</button>
                ))}
              </div>
              <div className="vcb-special-inputs-row">
                {SPECIAL_ACTIONS.slice(3, 5).map(({ label, notation, driveCost }) => (
                  <button key={label} onClick={() => handleInput(notation, driveCost, 0)}>{label}</button>
                ))}
              </div>
              <div className="vcb-special-inputs-row">
                {SPECIAL_ACTIONS.slice(5).map(({ label, notation, driveCost }) => (
                  <button key={label} onClick={() => handleInput(notation, driveCost, 0)}>{label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="vcb-palette-right">
          <div className="vcb-palette-section">
            <div className="vcb-palette-header">
              <h4>必殺技</h4>
            </div>
            <div className="vcb-palette-content vcb-specials-grid">
              {specialMoves.map(move => (
                <div key={move.id} className="vcb-move-group">
                  <h4>{move.name}</h4>
                  <div className="vcb-strength-buttons">
                    {move.variants?.map(variant => (
                      <button key={variant.notation} onClick={() => handleInput(variant.notation, variant.driveCost, variant.saCost)}>
                        {variant.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
           {uniqueMoves.length > 0 && (
            <div className="vcb-palette-section">
              <div className="vcb-palette-header">
                <h4>特殊技 / 特殊ムーブ</h4>
              </div>
              <div className="vcb-palette-content vcb-specials-grid">
                {uniqueMoves.map(move => (
                  <div key={move.id} className="vcb-move-group vcb-unique-move-group">
                    <h4 className="vcb-unique-move-group-title">{move.name}</h4>
                    {move.variantGroups?.map(group => (
                      <div key={group.groupName}>
                        {(move.variantGroups?.length || 0) > 1 && <h5 className="vcb-variant-group-name">{group.groupName}</h5>}
                        <div className="vcb-strength-buttons">
                          {group.variants.map(variant => (
                            <button key={variant.notation} onClick={() => handleInput(variant.notation, variant.driveCost, variant.saCost)}>
                              {variant.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {saMoves && (
            <div className="vcb-palette-section">
              <div className="vcb-palette-header">
                <h4>{saMoves.name}</h4>
              </div>
              <div className="vcb-palette-content vcb-sa-palette-content">
                <div className="vcb-move-group">
                  <div className="vcb-strength-buttons vcb-sa-buttons">
                    {saMoves.variants?.map(variant => (
                      <button key={variant.notation} onClick={() => handleInput(variant.notation, variant.driveCost, variant.saCost)}>
                        {variant.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};