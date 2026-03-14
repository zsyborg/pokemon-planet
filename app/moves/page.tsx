"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Pokemon type colors
const TYPE_COLORS: Record<string, string> = {
  normal: "bg-gray-400",
  fire: "bg-orange-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-cyan-300",
  fighting: "bg-red-700",
  poison: "bg-purple-600",
  ground: "bg-amber-600",
  flying: "bg-indigo-300",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-stone-500",
  ghost: "bg-purple-800",
  dragon: "bg-indigo-700",
  dark: "bg-gray-700",
  steel: "bg-slate-400",
  fairy: "bg-pink-300",
};

// Map of type IDs to type names
const TYPE_ID_MAP: Record<number, string> = {
  1: "normal",
  2: "fighting",
  3: "flying",
  4: "poison",
  5: "ground",
  6: "rock",
  7: "bug",
  8: "ghost",
  9: "steel",
  10: "fire",
  11: "water",
  12: "grass",
  13: "electric",
  14: "psychic",
  15: "ice",
  16: "dragon",
  17: "dark",
  18: "fairy",
};

interface Move {
  id: number;
  identifier: string;
  type_id: number;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  damage_class_id: number | null;
  name?: string;
  flavor_text?: string;
  damage_class?: string;
  pokemon?: {
    id: number;
    name: string;
    sprite: string;
  }[];
}

interface MovesResponse {
  moves: Move[];
  total: number;
  skip: number;
  limit: number;
}

export default function MovesPage() {
  const [moves, setMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const fetchMoves = async (searchTerm: string, skipValue: number, reset: boolean = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      params.set("skip", skipValue.toString());
      params.set("limit", limit.toString());

      const response = await fetch(`/api/moves?${params.toString()}`);
      const data: MovesResponse = await response.json();

      if (reset) {
        setMoves(data.moves);
      } else {
        setMoves((prev) => [...prev, ...data.moves]);
      }
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to load moves:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoves(search, 0, true);
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    setSkip(0);
    fetchMoves(value, 0, true);
  };

  const loadMore = () => {
    const newSkip = skip + limit;
    setSkip(newSkip);
    fetchMoves(search, newSkip, false);
  };

  const getTypeColor = (typeId: number) => {
    const typeName = TYPE_ID_MAP[typeId] || "normal";
    return TYPE_COLORS[typeName] || TYPE_COLORS.normal;
  };

  const formatStat = (value: number | null, defaultValue: string = "—") => {
    return value !== null ? value.toString() : defaultValue;
  };

  const hasMore = moves.length < total;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-red-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-white hover:text-gray-200">
                ← Back
              </Link>
              <h1 className="text-3xl font-bold">Pokémon Moves</h1>
            </div>
            <span className="text-white/80">
              {total > 0 ? `${total} moves` : "Loading..."}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search moves by name..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Moves Grid */}
      <div className="container mx-auto px-4 pb-8">
        {moves.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No moves found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {moves.map((move) => (
                <div
                  key={move.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Move Header with Type */}
                  <div className={`${getTypeColor(move.type_id)} p-3`}>
                    <h3 className="font-semibold uppercase text-white text-sm truncate">
                      {move.name || move.identifier}
                    </h3>
                    <p className="text-white/80 text-xs capitalize mt-1">
                      {move.damage_class || "status"}
                    </p>
                  </div>

                  {/* Move Details */}
                  <div className="p-3">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                        <span className="text-gray-500 dark:text-gray-400 block">Power</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatStat(move.power)}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                        <span className="text-gray-500 dark:text-gray-400 block">Accuracy</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatStat(move.accuracy, "—")}%
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                        <span className="text-gray-500 dark:text-gray-400 block">PP</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatStat(move.pp)}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                        <span className="text-gray-500 dark:text-gray-400 block">Priority</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatStat(move.priority)}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {move.flavor_text && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 line-clamp-2">
                        {move.flavor_text}
                      </p>
                    )}

                    {/* Type Badge */}
                    <div className="mt-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium text-white ${getTypeColor(move.type_id)}`}>
                        {TYPE_ID_MAP[move.type_id] || "normal"}
                      </span>
                    </div>

                    {/* Pokemon that can learn this move */}
                    {move.pokemon && move.pokemon.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-2">
                          Can be learned by:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {move.pokemon.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1"
                            >
                              <img
                                src={p.sprite}
                                alt={p.name}
                                className="w-5 h-5"
                              />
                              <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">
                                {p.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                >
                  {loading ? "Loading..." : `Load More (${total - moves.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}

        {/* Loading State */}
        {loading && moves.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
