"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BattleState, 
  createBattleState, 
  executeTurn
} from "@/lib/battle";

const typeColors: Record<string, string> = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-blue-200',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-green-400',
  rock: 'bg-yellow-800',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-700',
  dark: 'bg-gray-800',
  steel: 'bg-gray-500',
  fairy: 'bg-pink-300',
};

interface BattleProps {
  player1PokemonId: number;
  player2PokemonId: number;
  onBattleEnd: (winner: number) => void;
  onExit: () => void;
}

export default function Battle({ player1PokemonId, player2PokemonId, onBattleEnd, onExit }: BattleProps) {
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [battleResult, setBattleResult] = useState<{
    winner: number;
    leveledUp: boolean;
    newLevel?: number;
    expGained?: number;
  } | null>(null);

  // Load Pokemon data and initialize battle
  useEffect(() => {
    async function initBattle() {
      try {
        const response = await fetch('/api/battle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player1PokemonId,
            player2PokemonId,
          }),
        });

        if (!response.ok) throw new Error('Failed to load battle');

        const data = await response.json();
        const state = createBattleState(data.player1, data.player2);
        setBattleState(state);
      } catch (error) {
        console.error('Battle init error:', error);
      } finally {
        setLoading(false);
      }
    }

    initBattle();
  }, [player1PokemonId, player2PokemonId]);

  // Handle battle end
  useEffect(() => {
    if (!battleState?.isOver || !battleState.winner) return;
    
    const winnerId = battleState.winner === battleState.player1.id ? player1PokemonId : player2PokemonId;
    const isPlayer1Winner = battleState.winner === battleState.player1.id;
    
    setIsAnimating(true);
    
    // Call API to update stats (award experience for winner)
    async function updateBattleStats() {
      if (!battleState || !battleState.winner) return;
      
      const currentWinner = battleState.winner;
      
      try {
        const response = await fetch(`/api/pokemon/stats?pokemonId=${winnerId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            won: isPlayer1Winner,
            baseExperienceGain: 100
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setBattleResult({
            winner: currentWinner,
            leveledUp: data.leveledUp || false,
            newLevel: data.stats?.level,
            expGained: 100,
          });
        }
      } catch (error) {
        console.error('Failed to update battle stats:', error);
        setBattleResult({
          winner: currentWinner,
          leveledUp: false,
        });
      }
    }
    
    updateBattleStats();
    
    const timeoutId = setTimeout(() => {
      onBattleEnd(battleState.winner ?? player1PokemonId);
    }, 4000);
    
    return () => clearTimeout(timeoutId);
  }, [battleState?.isOver, battleState?.winner, player1PokemonId, player2PokemonId, onBattleEnd]);

  const handleMoveSelect = useCallback((moveIndex: number) => {
    if (isAnimating || !battleState || battleState.isOver) return;
    setSelectedMove(moveIndex);
  }, [isAnimating, battleState]);

  const handleAttack = useCallback(async () => {
    if (selectedMove === null || !battleState || isAnimating) return;

    // Player 2 (CPU) selects a random move
    const cpuMoveIndex = Math.floor(Math.random() * battleState.player2.moves.length);

    setIsAnimating(true);
    
    // Small delay for animation effect
    await new Promise(resolve => setTimeout(resolve, 500));

    const newState = executeTurn(battleState, selectedMove, cpuMoveIndex);
    setBattleState(newState);
    setSelectedMove(null);

    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsAnimating(false);
  }, [selectedMove, battleState, isAnimating]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">⚔️</div>
          <p className="text-white text-xl">Loading Battle...</p>
        </div>
      </div>
    );
  }

  if (!battleState) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="text-center">
          <p className="text-white text-xl">Failed to load battle</p>
          <button onClick={onExit} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { player1, player2, battleLog, isOver, winner } = battleState;
  const hpPercent1 = (player1.currentHp / player1.maxHp) * 100;
  const hpPercent2 = (player2.currentHp / player2.maxHp) * 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-sky-400 to-sky-200 flex flex-col z-50 overflow-hidden">
      {/* Battle Header */}
      <div className="bg-black/30 p-4 flex justify-between items-center">
        <h2 className="text-white text-xl font-bold">⚔️ Pokemon Battle</h2>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold"
        >
          Exit Battle
        </button>
      </div>

      {/* Battle Arena */}
      <div className="flex-1 relative p-8">
        {/* Enemy Pokemon (Top Right) */}
        <div className="absolute top-8 right-8 flex flex-col items-end">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white font-bold text-lg capitalize">{player2.name}</p>
              <div className="flex gap-1 justify-end mb-1">
                {player2.types.map((type) => (
                  <span
                    key={type}
                    className={`px-2 py-0.5 rounded text-xs text-white capitalize ${typeColors[type] || 'bg-gray-500'}`}
                  >
                    {type}
                  </span>
                ))}
              </div>
              <div className="w-48 h-3 bg-gray-700 rounded-full overflow-hidden border border-white">
                <div
                  className={`h-full transition-all duration-500 ${
                    hpPercent2 > 50 ? 'bg-green-500' : hpPercent2 > 20 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${hpPercent2}%` }}
                />
              </div>
              <p className="text-white text-sm mt-1">
                {player2.currentHp} / {player2.maxHp} HP
              </p>
            </div>
            <motion.div
              animate={isAnimating ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={`/sprites/sprites/pokemon/${player2.id}.png`}
                alt={player2.name}
                width={120}
                height={120}
                className="object-contain"
                unoptimized
              />
            </motion.div>
          </div>
        </div>

        {/* Player Pokemon (Bottom Left) */}
        <div className="absolute bottom-8 left-8 flex items-center gap-4">
          <motion.div
            animate={isAnimating ? { x: [0, 10, -10, 10, -10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={`/sprites/sprites/pokemon/${player1.id}.png`}
              alt={player1.name}
              width={150}
              height={150}
              className="object-contain"
              unoptimized
            />
          </motion.div>
          <div>
            <p className="text-white font-bold text-lg capitalize">{player1.name}</p>
            <div className="flex gap-1 mb-1">
              {player1.types.map((type) => (
                <span
                  key={type}
                  className={`px-2 py-0.5 rounded text-xs text-white capitalize ${typeColors[type] || 'bg-gray-500'}`}
                >
                  {type}
                </span>
              ))}
            </div>
            <div className="w-48 h-3 bg-gray-700 rounded-full overflow-hidden border border-white">
              <div
                className={`h-full transition-all duration-500 ${
                  hpPercent1 > 50 ? 'bg-green-500' : hpPercent1 > 20 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${hpPercent1}%` }}
              />
            </div>
            <p className="text-white text-sm mt-1">
              {player1.currentHp} / {player1.maxHp} HP
            </p>
          </div>
        </div>

        {/* Battle Log Toggle */}
        <button
          onClick={() => setShowLog(!showLog)}
          className="absolute top-8 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/50 text-white rounded-lg"
        >
          {showLog ? 'Hide Log' : 'Show Battle Log'}
        </button>

        {/* Battle Log */}
        <AnimatePresence>
          {showLog && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-1/2 transform -translate-x-1/2 w-80 max-h-40 overflow-y-auto bg-black/70 p-3 rounded-lg"
            >
              {battleLog.slice(-5).map((entry, index) => (
                <p key={index} className="text-white text-sm mb-1">
                  {entry.message}
                  {entry.damage ? ` (${entry.damage} dmg)` : ''}
                  {entry.effectiveness && (
                    <span className="text-yellow-400 ml-1">{entry.effectiveness}</span>
                  )}
                </p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Victory/Defeat Message */}
        {isOver && battleResult && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50"
          >
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-400 mb-4">
                {winner === player1.id ? '🎉 Victory!' : '💀 Defeat!'}
              </p>
              <p className="text-white text-xl mb-2">
                {winner === player1.id ? player1.name : player2.name} wins!
              </p>
              {winner === player1.id && battleResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 p-4 bg-green-600 rounded-lg"
                >
                  <p className="text-white font-bold mb-2">🎁 Rewards!</p>
                  <p className="text-yellow-300">+{battleResult.expGained || 100} EXP</p>
                  {battleResult.leveledUp && (
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-yellow-400 font-bold text-lg mt-2"
                    >
                      ⬆️ Level Up! Level {battleResult.newLevel}!
                    </motion.p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Move Selection Panel */}
      <div className="bg-gray-800 p-6">
        {!isOver ? (
          <div>
            <p className="text-white mb-4 font-bold">Choose your move:</p>
            <div className="grid grid-cols-2 gap-3">
              {player1.moves.map((move, index) => (
                <button
                  key={move.id}
                  onClick={() => handleMoveSelect(index)}
                  disabled={isAnimating || move.pp <= 0}
                  className={`p-3 rounded-lg font-bold text-left transition-all ${
                    selectedMove === index
                      ? 'bg-yellow-500 text-gray-900 ring-4 ring-yellow-300'
                      : move.pp <= 0
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="capitalize">{move.name.replace('-', ' ')}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${typeColors[move.type] || 'bg-gray-500'}`}>
                      {move.type}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1 text-sm">
                    <span>Power: {move.power || '-'}</span>
                    <span>PP: {move.pp}/{move.maxPp}</span>
                  </div>
                </button>
              ))}
            </div>

            {selectedMove !== null && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={handleAttack}
                disabled={isAnimating}
                className="w-full mt-4 py-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-500 text-white text-xl font-bold rounded-lg"
              >
                {isAnimating ? 'Attacking...' : '⚔️ ATTACK!'}
              </motion.button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={onExit}
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-lg"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
