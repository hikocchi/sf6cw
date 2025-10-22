import React, { useState, useEffect, useMemo } from 'react';
import type { SpecialMove } from '../types';
import {
  ArrowUpLeft, ArrowUp, ArrowUpRight, ArrowLeft, ArrowRight,
  ArrowDownLeft, ArrowDown, ArrowDownRight
} from './Icons';
import './VisualComboBuilder.css';

interface VisualComboBuilderProps {
  character: string;
  specialMoves: SpecialMove[];
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

export const VisualComboBuilder: React.FC<VisualComboBuilderProps> = ({ character, specialMoves }) => {
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

  const groupedSpecials = useMemo(() => {
    const groups = new Map<string, SpecialMove[]>();
    const specialMovesOnly = specialMoves.filter(m => m.type === 'special');
    const prefixes = ['弱 ', '中 ', '強 ', 'OD '];

    // Create groups based on base move name
    for (const move of specialMovesOnly) {
      let baseName = move.name;
      for (const prefix of prefixes) {
        if (move.name.startsWith(prefix)) {
          baseName = move.name.substring(prefix.length);
          break;
        }
      }
      
      if (!groups.has(baseName)) {
        groups.set(baseName, []);
      }
      groups.get(baseName)!.push(move);
    }

    const getStrengthOrder = (name: string) => {
        const strengthOrderMap: Record<string, number> = { '弱': 1, '中': 2, '強': 3, 'OD': 4 };
        const firstPart = name.split(' ')[0];
        if (firstPart in strengthOrderMap) {
            return strengthOrderMap[firstPart];
        }
        // Handle cases like 'OD 空中竜巻...' where OD is a separate word.
        if (firstPart === 'OD') return 4;
        return 0; // For moves without a strength prefix, e.g., '空中竜巻旋風脚'
    };

    // Sort moves within each group
    groups.forEach(moves => {
      moves.sort((a, b) => getStrengthOrder(a.name) - getStrengthOrder(b.name));
    });

    return Array.from(groups.entries());
  }, [specialMoves]);

  const characterSAsAndCAs = useMemo(() => {
    const saMoves = specialMoves.filter(m => m.type === 'sa');
    saMoves.sort((a, b) => {
        const getOrder = (name: string) => {
            if (name.startsWith('SA1')) return 1;
            if (name.startsWith('SA2')) return 2;
            if (name.startsWith('SA3')) return 3;
            if (name.startsWith('CA')) return 4;
            return 5;
        };
        return getOrder(a.name) - getOrder(b.name);
    });
    return saMoves;
  }, [specialMoves]);

  const getStrengthLabel = (name: string) => {
    const prefixes = ['弱', '中', '強', 'OD'];
    const firstPart = name.split(' ')[0];
    if (prefixes.includes(firstPart)) {
        return firstPart;
    }
    return '通常'; // Default for non-prefixed moves
  };

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

        <div className="vcb-palette-right">
          <div className="vcb-palette-section">
            <div className="vcb-palette-header">
              <h4>必殺技</h4>
            </div>
            <div className="vcb-palette-content">
              {groupedSpecials.map(([baseName, moves]) => (
                <div key={baseName} className="vcb-move-group">
                  <h4>{baseName}</h4>
                  <div className="vcb-strength-buttons">
                    {moves.map(move => (
                      <button key={move.name} onClick={() => handleInput(move.notation, move.driveCost, move.saCost)}>
                        {getStrengthLabel(move.name)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="vcb-palette-section">
            <div className="vcb-palette-header">
              <h4>スーパーアーツ</h4>
            </div>
            <div className="vcb-palette-content">
              {characterSAsAndCAs.length > 0 && (
                <div className="vcb-move-group">
                  <div className="vcb-strength-buttons vcb-sa-buttons">
                    {characterSAsAndCAs.map(move => (
                      <button key={move.name} onClick={() => handleInput(move.notation, move.driveCost, move.saCost)}>
                        {move.name.startsWith('CA') ? 'CA' : move.notation}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};