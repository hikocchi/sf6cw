import { useState, useEffect } from 'react';
import { fetchCharacterData } from '../data';
import type { ComboPart, SampleCombo, Move } from '../types';

export const useCharacterData = (character: string) => {
  const [comboParts, setComboParts] = useState<ComboPart[]>([]);
  const [sampleCombos, setSampleCombos] = useState<SampleCombo[]>([]);
  const [moves, setMoves] = useState<Move[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!character) return;
      setIsLoading(true);
      try {
        const data = await fetchCharacterData(character);

        // start/endFrameAdvantageからタグを自動生成する処理
        const processedParts = data.comboParts.map(part => {
          const newPart = { ...part };
          if (!newPart.tagCondition) {
            newPart.tagCondition = [];
          }
          const conditions = new Set(newPart.tagCondition);

          const addFrameTag = (frame?: number) => {
            if (frame !== undefined && frame !== null) {
              const frameAdvantageTag = `${frame >= 0 ? '+' : ''}${frame}F状況`;
              conditions.add(frameAdvantageTag);
            }
          };
          
          addFrameTag(newPart.startFrameAdvantage);
          addFrameTag(newPart.endFrameAdvantage);

          newPart.tagCondition = Array.from(conditions);
          return newPart;
        });

        const partsWithCharacter = processedParts.map(part => ({ ...part, character }));
        const sortedParts = partsWithCharacter.sort((a, b) => a.order - b.order);
        setComboParts(sortedParts);
        setSampleCombos(data.sampleCombos);
        setMoves(data.moves);
      } catch (error) {
        console.error(`Failed to load data for ${character}`, error);
        setComboParts([]);
        setSampleCombos([]);
        setMoves([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [character]);

  return { comboParts, sampleCombos, moves, isLoading };
};