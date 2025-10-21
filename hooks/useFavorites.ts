import { useState, useEffect, useCallback } from 'react';
import type { FavoriteCombo, SequencePart } from '../types';

const STORAGE_KEY = 'sf6-cw-favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteCombo[]>([]);

  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem(STORAGE_KEY);
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (e) {
      console.error("Failed to load favorites:", e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const saveFavorite = useCallback((sequence: SequencePart[], name: string, character: string) => {
    if (!name || sequence.length === 0) return;

    const newFavorite: FavoriteCombo = {
      id: `${Date.now()}`,
      name,
      character,
      partIds: sequence.map(p => p.id),
    };

    setFavorites(prev => {
      const updatedFavorites = [...prev, newFavorite];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  }, []);

  const deleteFavorite = useCallback((favoriteId: string) => {
    setFavorites(prev => {
      const updatedFavorites = prev.filter(f => f.id !== favoriteId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  }, []);

  return { favorites, saveFavorite, deleteFavorite };
};
