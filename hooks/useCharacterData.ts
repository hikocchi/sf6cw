import { useState, useEffect } from 'react';
import { fetchCharacterData } from '../data';
import type { ComboPart, SampleCombo, SpecialMove, UniqueMove } from '../types';

export const useCharacterData = (character: string) => {
  const [comboParts, setComboParts] = useState<ComboPart[]>([]);
  const [sampleCombos, setSampleCombos] = useState<SampleCombo[]>([]);
  const [specialMoves, setSpecialMoves] = useState<SpecialMove[]>([]);
  const [uniqueMoves, setUniqueMoves] = useState<UniqueMove[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!character) return;
      setIsLoading(true);
      try {
        const data = await fetchCharacterData(character);
        const partsWithCharacter = data.comboParts.map(part => ({ ...part, character }));
        const sortedParts = partsWithCharacter.sort((a, b) => a.order - b.order);
        setComboParts(sortedParts);
        setSampleCombos(data.sampleCombos);
        setSpecialMoves(data.specialMoves);
        setUniqueMoves(data.uniqueMoves);
      } catch (error) {
        console.error(`Failed to load data for ${character}`, error);
        setComboParts([]);
        setSampleCombos([]);
        setSpecialMoves([]);
        setUniqueMoves([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [character]);

  return { comboParts, sampleCombos, specialMoves, uniqueMoves, isLoading };
};
