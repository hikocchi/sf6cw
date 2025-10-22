import { useState, useEffect } from 'react';
import { fetchCharacterData } from '../data';
import type { ComboPart, SampleCombo, SpecialMove } from '../types';

export const useCharacterData = (character: string) => {
  const [comboParts, setComboParts] = useState<ComboPart[]>([]);
  const [sampleCombos, setSampleCombos] = useState<SampleCombo[]>([]);
  const [specialMoves, setSpecialMoves] = useState<SpecialMove[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!character) return;
      setIsLoading(true);
      try {
        const data = await fetchCharacterData(character);
        const sortedParts = data.comboParts.sort((a, b) => a.order - b.order);
        setComboParts(sortedParts);
        setSampleCombos(data.sampleCombos);
        setSpecialMoves(data.specialMoves);
      } catch (error) {
        console.error(`Failed to load data for ${character}`, error);
        setComboParts([]);
        setSampleCombos([]);
        setSpecialMoves([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [character]);

  return { comboParts, sampleCombos, specialMoves, isLoading };
};
