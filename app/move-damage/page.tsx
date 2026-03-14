"use client";

import { useEffect, useState } from "react";

interface Type {
  id: number;
  identifier: string;
  name: string;
}

interface Move {
  id: number;
  name: string;
  identifier: string;
  type: Type;
  damageClass: string;
  power: number | null;
  pp: number | null;
  accuracy: number | null;
}

interface MoveDamageResult {
  type: Type;
  multiplier: number;
  multiplierLabel: string;
  damageClass: string;
  effectiveness: string;
  color: string;
}

interface MoveDamageResponse {
  move: Move;
  typeEffectiveness: MoveDamageResult[];
}

const typeColors: Record<string, string> = {
  normal: "bg-gray-400",
  fire: "bg-orange-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-cyan-300",
  fighting: "bg-red-700",
  poison: "bg-purple-600",
  ground: "bg-amber-600",
  flying: "bg-sky-300",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-stone-500",
  ghost: "bg-indigo-700",
  dragon: "bg-violet-700",
  dark: "bg-gray-800",
  steel: "bg-slate-400",
  fairy: "bg-pink-300",
};

export default function MoveDamagePage() {
  const [moves, setMoves] = useState<Move[]>([]);
  const [filteredMoves, setFilteredMoves] = useState<Move[]>([]);
  const [selectedMove, setSelectedMove] = useState<MoveDamageResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMove, setLoadingMove] = useState(false);

  useEffect(() => {
    const fetchMoves = async () => {
      try {
        const response = await fetch("/api/move-damage");
        const data = await response.json();
        setMoves(data.moves || []);
        setFilteredMoves(data.moves || []);
      } catch (error) {
        console.error("Failed to load moves:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMoves();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredMoves(moves.slice(0, 50));
    } else {
      const filtered = moves.filter((move) =>
        move.name.toLowerCase().includes(query.toLowerCase()) ||
        move.identifier.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMoves(filtered.slice(0, 50));
    }
    setShowDropdown(true);
  };

  const selectMove = async (move: Move) => {
    setSearchQuery(move.name);
    setShowDropdown(false);
    setLoadingMove(true);

    try {
      const response = await fetch(`/api/move-damage?moveId=${move.id}`);
      const data: MoveDamageResponse = await response.json();
      setSelectedMove(data);
    } catch (error) {
      console.error("Failed to load move damage:", error);
    } finally {
      setLoadingMove(false);
    }
  };

  const groupedEffectiveness = selectedMove
    ? {
        superEffective: selectedMove.typeEffectiveness.filter((te) => te.multiplier >= 2),
        normal: selectedMove.typeEffectiveness.filter((te) => te.multiplier === 1),
        notVeryEffective: selectedMove.typeEffectiveness.filter(
          (te) => te.multiplier === 0.5 || te.multiplier === 0.25
        ),
        noEffect: selectedMove.typeEffectiveness.filter((te) => te.multiplier === 0),
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Move Damage Calculator
          </h1>
          <p className="text-gray-400">
            Select a move to see how much damage it deals against different Pokémon types
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8 backdrop-blur-sm">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search for a move
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              placeholder="Enter move name..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />

            {/* Dropdown */}
            {showDropdown && filteredMoves.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                {filteredMoves.map((move) => (
                  <button
                    key={move.id}
                    onClick={() => selectMove(move)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-600 flex items-center justify-between transition-colors"
                  >
                    <span className="text-white">{move.name}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs text-white ${
                          typeColors[move.type.identifier] || "bg-gray-500"
                        }`}
                      >
                        {move.type.name}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {move.power ? `${move.power} power` : "—"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* Move Damage Results */}
        {loadingMove && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        {selectedMove && !loadingMove && (
          <div className="space-y-6">
            {/* Move Info Card */}
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                      typeColors[selectedMove.move.type.identifier] || "bg-gray-500"
                    }`}
                  >
                    <span className="text-white text-2xl font-bold">
                      {selectedMove.move.power || "—"}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedMove.move.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className={`px-3 py-1 rounded-full text-sm text-white font-medium ${
                          typeColors[selectedMove.move.type.identifier] || "bg-gray-500"
                        }`}
                      >
                        {selectedMove.move.type.name} Type
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm text-white bg-gray-600 capitalize">
                        {selectedMove.move.damageClass}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ml-auto flex gap-6 text-gray-300">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {selectedMove.move.power || "—"}
                    </div>
                    <div className="text-sm">Power</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {selectedMove.move.pp || "—"}
                    </div>
                    <div className="text-sm">PP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {selectedMove.move.accuracy || "—"}%
                    </div>
                    <div className="text-sm">Accuracy</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Effectiveness Grid */}
            {groupedEffectiveness && (
              <div className="space-y-6">
                {/* Super Effective */}
                {groupedEffectiveness.superEffective.length > 0 && (
                  <div className="bg-red-900/20 rounded-xl p-6 backdrop-blur-sm border border-red-700/30">
                    <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                      <span className="text-2xl">⚔️</span>
                      Super Effective (2× or 4×)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {groupedEffectiveness.superEffective.map((te) => (
                        <div
                          key={te.type.id}
                          className={`${te.color} rounded-lg p-3 text-center`}
                        >
                          <div className="text-white font-bold">{te.type.name}</div>
                          <div className="text-white/90 text-lg">{te.multiplierLabel}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Normal */}
                {groupedEffectiveness.normal.length > 0 && (
                  <div className="bg-gray-800/20 rounded-xl p-6 backdrop-blur-sm border border-gray-700/30">
                    <h3 className="text-xl font-bold text-gray-300 mb-4 flex items-center gap-2">
                      <span className="text-2xl">➖</span>
                      Normal (1×)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {groupedEffectiveness.normal.map((te) => (
                        <div
                          key={te.type.id}
                          className={`${te.color} rounded-lg p-3 text-center`}
                        >
                          <div className="text-white font-bold">{te.type.name}</div>
                          <div className="text-white/90 text-lg">{te.multiplierLabel}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Not Very Effective */}
                {groupedEffectiveness.notVeryEffective.length > 0 && (
                  <div className="bg-blue-900/20 rounded-xl p-6 backdrop-blur-sm border border-blue-700/30">
                    <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                      <span className="text-2xl">🛡️</span>
                      Not Very Effective (0.5×)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {groupedEffectiveness.notVeryEffective.map((te) => (
                        <div
                          key={te.type.id}
                          className={`${te.color} rounded-lg p-3 text-center`}
                        >
                          <div className="text-white font-bold">{te.type.name}</div>
                          <div className="text-white/90 text-lg">{te.multiplierLabel}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Effect */}
                {groupedEffectiveness.noEffect.length > 0 && (
                  <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/30">
                    <h3 className="text-xl font-bold text-gray-500 mb-4 flex items-center gap-2">
                      <span className="text-2xl">❌</span>
                      No Effect (0×)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {groupedEffectiveness.noEffect.map((te) => (
                        <div
                          key={te.type.id}
                          className={`${te.color} rounded-lg p-3 text-center`}
                        >
                          <div className="text-white font-bold">{te.type.name}</div>
                          <div className="text-white/90 text-lg">{te.multiplierLabel}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !selectedMove && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Select a Move
            </h3>
            <p className="text-gray-400">
              Search for a move above to see its damage effectiveness against all types
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
