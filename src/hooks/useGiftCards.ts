import { useState, useEffect } from 'react';
import { GiftCardService } from '@/services/giftCardService';
import { GiftCard } from '@/types/database';

export function useGiftCards() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGiftCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const cards = await GiftCardService.getAllGiftCards();
      setGiftCards(cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gift cards');
    } finally {
      setLoading(false);
    }
  };

  const validateGiftCard = async (code: string, amount: number) => {
    try {
      setError(null);
      return await GiftCardService.validateGiftCard(code, amount);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate gift card';
      setError(errorMessage);
      return { isValid: false, error: errorMessage };
    }
  };

  const useGiftCard = async (giftCardId: string, amount: number) => {
    try {
      setError(null);
      await GiftCardService.useGiftCard(giftCardId, amount);
      // Refresh gift cards after use
      await fetchGiftCards();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to use gift card';
      setError(errorMessage);
      throw err;
    }
  };

  const createGiftCard = async (giftCardData: Parameters<typeof GiftCardService.createGiftCard>[0]) => {
    try {
      setError(null);
      const id = await GiftCardService.createGiftCard(giftCardData);
      await fetchGiftCards(); // Refresh list
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create gift card';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchGiftCards();
  }, []);

  return {
    giftCards,
    loading,
    error,
    fetchGiftCards,
    validateGiftCard,
    useGiftCard,
    createGiftCard
  };
}
