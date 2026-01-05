import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface TargetPosition {
  x: number;
  y: number;
}

const TOTAL_ROUNDS = 10;

const Game = () => {
  const navigate = useNavigate();
  const { difficulty, setLastResult } = useStore();
  
  const [gameState, setGameState] = useState<'countdown' | 'waiting' | 'active' | 'finished'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [round, setRound] = useState(0);
  const [targetPos, setTargetPos] = useState<TargetPosition | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [hits, setHits] = useState(0);
  const [clicks, setClicks] = useState(0); // Total clicks (for accuracy)
  
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Difficulty settings
  const getTargetSize = () => {
    switch (difficulty) {
      case 'easy': return 80; // px
      case 'normal': return 60;
      case 'hard': return 40;
      default: return 60;
    }
  };

  const getRandomPosition = useCallback(() => {
    const size = getTargetSize();
    const padding = 50;
    const maxX = window.innerWidth - size - padding;
    const maxY = window.innerHeight - size - padding; // Account for navbar/padding
    const minX = padding;
    const minY = padding + 60; // Navbar height approx

    return {
      x: Math.random() * (maxX - minX) + minX,
      y: Math.random() * (maxY - minY) + minY,
    };
  }, [difficulty]);

  const startRound = useCallback(() => {
    setGameState('waiting');
    setTargetPos(null);
    
    // Random delay between 1-3 seconds
    const delay = Math.random() * 2000 + 1000;
    
    timeoutRef.current = setTimeout(() => {
      setTargetPos(getRandomPosition());
      setGameState('active');
      startTimeRef.current = Date.now();
    }, delay);
  }, [getRandomPosition]);

  // Countdown logic
  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        startRound();
      }
    }
  }, [countdown, gameState, startRound]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent background click
    if (gameState !== 'active') return;

    const endTime = Date.now();
    const reactionTime = endTime - startTimeRef.current;

    setReactionTimes(prev => [...prev, reactionTime]);
    setHits(prev => prev + 1);
    setClicks(prev => prev + 1);
    
    nextRound();
  };

  const handleBackgroundClick = () => {
    if (gameState === 'active') {
      // Missed shot
      setClicks(prev => prev + 1);
    } else if (gameState === 'waiting') {
      // Early click penalty? For now just ignore or maybe punish.
      // Let's just count it as a miss for accuracy.
      setClicks(prev => prev + 1);
    }
  };

  const nextRound = () => {
    if (round + 1 >= TOTAL_ROUNDS) {
      finishGame();
    } else {
      setRound(prev => prev + 1);
      startRound();
    }
  };

  const finishGame = () => {
    setGameState('finished');
    // Calculate final stats
    // We need to wait for the state update to be reflected, but simpler to calculate here
    // Actually reactionTimes is not updated yet in this render cycle if called directly
    // So we pass the new array.
    
    // Wait a tick to ensure state is consistent or just calculate from values
    // Better: use useEffect to watch round count, but we called it from handleTargetClick.
    
    // Let's construct the result object.
    // Note: reactionTimes state is not yet updated with the latest click in this function scope
    // So we need to handle that.
    // Actually, setReactionTimes is async.
    // Let's defer finishGame or pass the latest value.
  };
  
  // Watch for round completion
  useEffect(() => {
    if (reactionTimes.length === TOTAL_ROUNDS) {
      const avgTime = reactionTimes.reduce((a, b) => a + b, 0) / TOTAL_ROUNDS;
      const accuracy = clicks > 0 ? (hits / clicks) * 100 : 0;
      
      setLastResult({
        reactionTime: Math.round(avgTime),
        accuracy: Number(accuracy.toFixed(2)),
        difficulty,
        targetHits: hits,
        totalTargets: TOTAL_ROUNDS,
      });
      
      navigate('/result');
    }
  }, [reactionTimes, clicks, hits, difficulty, navigate, setLastResult]);


  const targetSize = getTargetSize();

  return (
    <div 
      className="fixed inset-0 bg-black cursor-crosshair select-none"
      onClick={handleBackgroundClick}
    >
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none">
        <div className="text-white text-xl font-bold font-mono">
          ROUND: {round + 1} / {TOTAL_ROUNDS}
        </div>
        <div className="text-zinc-500 font-mono">
           {difficulty.toUpperCase()}
        </div>
      </div>

      {/* Countdown Overlay */}
      {gameState === 'countdown' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-9xl font-black text-white animate-pulse">
            {countdown > 0 ? countdown : 'GO!'}
          </div>
        </div>
      )}

      {/* Target */}
      {gameState === 'active' && targetPos && (
        <div
          className="absolute rounded-full bg-red-500 hover:bg-red-400 shadow-[0_0_15px_rgba(239,68,68,0.6)] cursor-pointer transform transition-transform active:scale-95"
          style={{
            left: targetPos.x,
            top: targetPos.y,
            width: targetSize,
            height: targetSize,
          }}
          onMouseDown={handleTargetClick}
        />
      )}
    </div>
  );
};

export default Game;
