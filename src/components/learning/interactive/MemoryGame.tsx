'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Card {
  id: string;
  content: string;
  description: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  cards: { content: string; description: string }[];
  onComplete: (score: number) => void;
}

export default function MemoryGame({ cards: initialCards, onComplete }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);

  useEffect(() => {
    // Create pairs of cards and shuffle them
    const cardPairs = [...initialCards, ...initialCards].map((card, index) => ({
      ...card,
      id: `${index}`,
      isFlipped: false,
      isMatched: false,
    }));
    
    setCards(shuffleCards(cardPairs));
  }, [initialCards]);

  const shuffleCards = (cards: Card[]) => {
    return [...cards].sort(() => Math.random() - 0.5);
  };

  const handleCardClick = async (clickedCard: Card) => {
    if (
      isLocked ||
      flippedCards.length === 2 ||
      flippedCards.includes(clickedCard.id) ||
      clickedCard.isMatched
    ) {
      return;
    }

    if (!gameStarted) {
      setGameStarted(true);
    }

    // Play flip sound if enabled
    if (audioEnabled) {
      playSound('flip');
    }

    const newFlippedCards = [...flippedCards, clickedCard.id];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setIsLocked(true);
      setMoves(moves + 1);

      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);

      if (firstCard?.content === secondCard?.content) {
        // Match found
        if (audioEnabled) {
          playSound('match');
        }
        setCards(cards.map(card =>
          newFlippedCards.includes(card.id)
            ? { ...card, isMatched: true }
            : card
        ));
        setFlippedCards([]);
        setIsLocked(false);

        // Check if game is complete
        const allMatched = cards.every(card => 
          card.isMatched || newFlippedCards.includes(card.id)
        );
        if (allMatched) {
          const score = calculateScore(moves);
          onComplete(score);
        }
      } else {
        // No match
        if (audioEnabled) {
          playSound('nomatch');
        }
        setTimeout(() => {
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const calculateScore = (moves: number) => {
    const perfectMoves = cards.length / 2;
    const score = Math.max(0, 100 - Math.floor((moves - perfectMoves) * (100 / perfectMoves)));
    return score;
  };

  const playSound = (type: 'flip' | 'match' | 'nomatch') => {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.play().catch(() => {});
  };

  const handleKeyPress = (e: React.KeyboardEvent, card: Card) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(card);
    }
  };

  return (
    <div className="space-y-4">
      {/* Settings */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="flex items-center space-x-2 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
            aria-label={`${audioEnabled ? 'Disable' : 'Enable'} sound effects`}
          >
            {audioEnabled ? (
              <span>🔊 Sound On</span>
            ) : (
              <span>🔇 Sound Off</span>
            )}
          </button>
          <button
            onClick={() => setHighContrastMode(!highContrastMode)}
            className="flex items-center space-x-2 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
            aria-label={`${highContrastMode ? 'Disable' : 'Enable'} high contrast mode`}
          >
            {highContrastMode ? '👁️ High Contrast On' : '👁️ High Contrast Off'}
          </button>
        </div>
        <div className="text-gray-600">
          Moves: {moves}
        </div>
      </div>

      {/* Game Grid */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${Math.min(4, Math.ceil(Math.sqrt(cards.length)))}, minmax(0, 1fr))`
        }}
        role="grid"
        aria-label="Memory game grid"
      >
        {cards.map((card) => (
          <motion.div
            key={card.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              className={`w-full aspect-square rounded-lg ${
                highContrastMode
                  ? 'border-4'
                  : 'border-2'
              } ${
                card.isMatched
                  ? highContrastMode
                    ? 'border-green-600 bg-green-100'
                    : 'border-green-300 bg-green-50'
                  : flippedCards.includes(card.id)
                  ? highContrastMode
                    ? 'border-blue-600 bg-blue-100'
                    : 'border-blue-300 bg-blue-50'
                  : highContrastMode
                  ? 'border-gray-800 bg-white'
                  : 'border-gray-200 bg-white'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              onClick={() => handleCardClick(card)}
              onKeyDown={(e) => handleKeyPress(e, card)}
              disabled={isLocked}
              aria-label={
                card.isMatched || flippedCards.includes(card.id)
                  ? `${card.content}: ${card.description}`
                  : 'Hidden card'
              }
              aria-pressed={card.isMatched || flippedCards.includes(card.id)}
            >
              <AnimatePresence mode="wait">
                {(card.isMatched || flippedCards.includes(card.id)) ? (
                  <motion.div
                    key="front"
                    initial={{ rotateY: 180, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 180, opacity: 0 }}
                    className="w-full h-full flex items-center justify-center p-4 text-center"
                  >
                    <div>
                      <div className="text-2xl mb-2">{card.content}</div>
                      <div className="text-sm text-gray-600">{card.description}</div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ rotateY: 180, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 180, opacity: 0 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <span className="text-4xl">❓</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">How to Play</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>Click or tap cards to flip them</li>
          <li>Find matching pairs of cards</li>
          <li>Complete the game in as few moves as possible</li>
          <li>Use keyboard navigation (Tab, Enter, Space) for accessibility</li>
        </ul>
      </div>
    </div>
  );
}
