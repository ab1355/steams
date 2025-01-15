'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Pair {
  id: string;
  term: string;
  definition: string;
  termImage?: string;
  definitionImage?: string;
}

interface MatchingPairsProps {
  pairs: Pair[];
  onComplete: (score: number) => void;
  timeLimit?: number; // optional time limit in seconds
  showImages?: boolean;
}

export default function MatchingPairs({
  pairs,
  onComplete,
  timeLimit,
  showImages = false,
}: MatchingPairsProps) {
  const [shuffledTerms, setShuffledTerms] = useState<(Pair & { index: number })[]>([]);
  const [shuffledDefinitions, setShuffledDefinitions] = useState<(Pair & { index: number })[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<string | null>(null);
  const [matches, setMatches] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  
  const timerRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize shuffled arrays
    const shuffleArray = <T extends unknown>(array: T[]): T[] => {
      return [...array].sort(() => Math.random() - 0.5);
    };

    setShuffledTerms(
      shuffleArray(pairs.map((pair, index) => ({ ...pair, index })))
    );
    setShuffledDefinitions(
      shuffleArray(pairs.map((pair, index) => ({ ...pair, index })))
    );

    // Initialize timer if provided
    if (timeLimit) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [pairs, timeLimit]);

  const playSound = (type: 'match' | 'wrong' | 'complete') => {
    if (!audioEnabled) return;
    
    const sounds = {
      match: '/sounds/match.mp3',
      wrong: '/sounds/wrong.mp3',
      complete: '/sounds/complete.mp3',
    };

    if (audioRef.current) {
      audioRef.current.src = sounds[type];
      audioRef.current.play().catch(() => {});
    }
  };

  const handleTermClick = (id: string) => {
    if (matches.has(id)) return;
    setSelectedTerm(id);
    
    if (selectedDefinition) {
      const term = pairs.find((p) => p.id === id);
      const definition = pairs.find((p) => p.id === selectedDefinition);
      
      if (term && definition) {
        setAttempts((prev) => prev + 1);
        
        if (term.id === definition.id) {
          // Match found
          playSound('match');
          setMatches((prev) => new Set([...prev, id]));
          
          // Check if all pairs are matched
          if (matches.size + 1 === pairs.length) {
            handleComplete();
          }
        } else {
          playSound('wrong');
        }
      }
      
      setSelectedTerm(null);
      setSelectedDefinition(null);
    }
  };

  const handleDefinitionClick = (id: string) => {
    if (matches.has(id)) return;
    setSelectedDefinition(id);
    
    if (selectedTerm) {
      const term = pairs.find((p) => p.id === selectedTerm);
      const definition = pairs.find((p) => p.id === id);
      
      if (term && definition) {
        setAttempts((prev) => prev + 1);
        
        if (term.id === definition.id) {
          // Match found
          playSound('match');
          setMatches((prev) => new Set([...prev, id]));
          
          // Check if all pairs are matched
          if (matches.size + 1 === pairs.length) {
            handleComplete();
          }
        } else {
          playSound('wrong');
        }
      }
      
      setSelectedTerm(null);
      setSelectedDefinition(null);
    }
  };

  const handleComplete = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const score = calculateScore();
    playSound('complete');
    onComplete(score);
  };

  const calculateScore = () => {
    const perfectScore = 100;
    const penaltyPerAttempt = 5;
    return Math.max(0, perfectScore - (attempts - pairs.length) * penaltyPerAttempt);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <audio ref={audioRef} />

      {/* Controls */}
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
        <div className="flex space-x-4">
          <button
            onClick={() => setHighContrastMode(!highContrastMode)}
            className="px-3 py-1 rounded-md bg-white shadow-sm"
            aria-label="Toggle high contrast mode"
          >
            {highContrastMode ? '👁️ High Contrast On' : '👁️ High Contrast Off'}
          </button>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="px-3 py-1 rounded-md bg-white shadow-sm"
            aria-label="Toggle sound effects"
          >
            {audioEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFontSize((prev) => Math.max(12, prev - 2))}
              className="px-2 rounded-md bg-white shadow-sm"
              aria-label="Decrease font size"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize((prev) => Math.min(24, prev + 2))}
              className="px-2 rounded-md bg-white shadow-sm"
              aria-label="Increase font size"
            >
              A+
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {timeLimit && (
            <span className="text-lg font-semibold">
              Time: {formatTime(timeRemaining)}
            </span>
          )}
          <span className="text-lg">
            Matches: {matches.size}/{pairs.length}
          </span>
        </div>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-2 gap-8">
        {/* Terms */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Terms</h2>
          {shuffledTerms.map((pair) => (
            <motion.button
              key={pair.id}
              onClick={() => handleTermClick(pair.id)}
              className={`w-full p-4 rounded-lg text-left transition-all ${
                matches.has(pair.id)
                  ? 'bg-green-100 border-green-500'
                  : selectedTerm === pair.id
                  ? 'bg-blue-100 border-blue-500'
                  : highContrastMode
                  ? 'bg-black text-white border-white hover:bg-gray-800'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              } border-2`}
              style={{ fontSize: `${fontSize}px` }}
              disabled={matches.has(pair.id)}
              whileHover={{ scale: matches.has(pair.id) ? 1 : 1.02 }}
              aria-label={`Term: ${pair.term}`}
            >
              <div className="flex items-center space-x-4">
                {showImages && pair.termImage && (
                  <img
                    src={pair.termImage}
                    alt=""
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <span>{pair.term}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Definitions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Definitions</h2>
          {shuffledDefinitions.map((pair) => (
            <motion.button
              key={pair.id}
              onClick={() => handleDefinitionClick(pair.id)}
              className={`w-full p-4 rounded-lg text-left transition-all ${
                matches.has(pair.id)
                  ? 'bg-green-100 border-green-500'
                  : selectedDefinition === pair.id
                  ? 'bg-blue-100 border-blue-500'
                  : highContrastMode
                  ? 'bg-black text-white border-white hover:bg-gray-800'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              } border-2`}
              style={{ fontSize: `${fontSize}px` }}
              disabled={matches.has(pair.id)}
              whileHover={{ scale: matches.has(pair.id) ? 1 : 1.02 }}
              aria-label={`Definition: ${pair.definition}`}
            >
              <div className="flex items-center space-x-4">
                {showImages && pair.definitionImage && (
                  <img
                    src={pair.definitionImage}
                    alt=""
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <span>{pair.definition}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">How to Play</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>Click a term, then click its matching definition</li>
          <li>Matched pairs will turn green</li>
          <li>Try to match all pairs with as few attempts as possible</li>
          <li>Use the accessibility controls to adjust the display</li>
        </ul>
      </div>
    </div>
  );
}
