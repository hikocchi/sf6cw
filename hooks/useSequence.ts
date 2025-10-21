import { useState, useMemo } from 'react';
import type { SequencePart, ComboPart, SampleCombo } from '../types';

export const useSequence = () => {
  const [sequence, setSequence] = useState<SequencePart[]>([]);

  const addPartToSequence = (part: ComboPart) => {
    const newSequencePart: SequencePart = { ...part, sequenceId: `${part.id}-${Date.now()}` };
    setSequence(prev => [...prev, newSequencePart]);
  };

  const removeFromSequence = (sequenceId: string) => {
    setSequence(prev => prev.filter(p => p.sequenceId !== sequenceId));
  };

  const clearSequence = () => setSequence([]);

  const loadSampleCombo = (sample: SampleCombo, allParts: ComboPart[]) => {
    const newSequence = sample.parts.map(partId => {
      const part = allParts.find(p => p.id === partId);
      if (!part) return null;
      return { ...part, sequenceId: `${part.id}-${Date.now()}-${Math.random()}` };
    }).filter((p): p is SequencePart => p !== null);
    setSequence(newSequence);
  };

  const comboStats = useMemo(() => {
    const totalDamage = sequence.reduce((sum, part) => sum + (part.damage || 0), 0);
    const finalFrameAdvantage = sequence.length > 0 ? sequence[sequence.length - 1].endFrameAdvantage : undefined;
    return { totalDamage, finalFrameAdvantage };
  }, [sequence]);

  return { sequence, setSequence, addPartToSequence, removeFromSequence, clearSequence, loadSampleCombo, comboStats };
};
