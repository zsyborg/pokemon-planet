"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PokemonStat {
  id: number;
  name: string;
  identifier: string;
  height: number;
  weight: number;
  base_experience: number;
  stats: {
    HP?: number;
    Attack?: number;
    Defense?: number;
    "Special Attack"?: number;
    "Special Defense"?: number;
    Speed?: number;
  };
  total_stats: number;
  types: { id: number; name: string; identifier: string }[];
  abilities: { id: number; name: string; is_hidden: boolean; slot: number }[];
  genus: string | null;
  generation_id: number | null;
}

interface StatsResponse {
  pokemon: PokemonStat[];
  total: number;
  skip: number;
  limit: number;
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

const statColors: Record<string, string> = {
  HP: "bg-red-500",
  Attack: "bg-orange-500",
  Defense: "bg-yellow-500",
  "Special Attack": "bg-blue-500",
  "Special Defense": "bg-green-500",
  Speed: "bg-pink-500",
};

export default function StatsPage() {
  const [pokemon, setPokemon] = useState<PokemonStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const limit = 50;

  const fetchPokemon = async (searchTerm: string, skipValue: number, sortByValue: string, sortOrderValue: "asc" | "desc", reset: boolean = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      params.set("skip", skipValue.toString());
      params.set("limit", limit.toString());
      params.set("sortBy", sortByValue);
      params.set("sortOrder", sortOrderValue);

      const response = await fetch(`/api/stats?${params.toString()}`);
      const data: StatsResponse = await response.json();

      if (reset) {
        setPokemon(data.pokemon);
      } else {
        setPokemon((prev) => [...prev, ...data.pokemon]);
      }
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to load pokemon stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemon(search, 0, sortBy, sortOrder, true);
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    setSkip(0);
    fetchPokemon(value, 0, sortBy, sortOrder, true);
  };

  const handleSort = (stat: string) => {
    if (selectedStat === stat) {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
      fetchPokemon(search, 0, stat, newOrder, true);
    } else {
      setSelectedStat(stat);
      setSortBy(stat);
      setSortOrder("desc");
      fetchPokemon(search, 0, stat, "desc", true);
    }
  };

  const loadMore = () => {
    const newSkip = skip + limit;
    setSkip(newSkip);
    fetchPokemon(search, newSkip, sortBy, sortOrder, false);
  };

  const hasMore = pokemon.length < total;

  const getTypeColor = (typeIdentifier: string): string => {
    return typeColors[typeIdentifier] || "bg-gray-400";
  };

  const getStatPercentage = (value: number): string => {
    // Max stat is typically 255
    const percentage = Math.min((value / 255) * 100, 100);
    return `${percentage}%`;
  };

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
              <h1 className="text-3xl font-bold">Pokémon Stats</h1>
            </div>
            <span className="text-white/80">
              {total > 0 ? `${total} Pokémon` : "Loading..."}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Sort Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search Pokemon by name..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                fetchPokemon(search, 0, e.target.value, sortOrder, true);
              }}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="id">Sort by #</option>
              <option value="name">Sort by Name</option>
              <option value="total_stats">Sort by Total</option>
              <option value="HP">Sort by HP</option>
              <option value="Attack">Sort by Attack</option>
              <option value="Defense">Sort by Defense</option>
              <option value="Special Attack">Sort by Sp. Atk</option>
              <option value="Special Defense">Sort by Sp. Def</option>
              <option value="Speed">Sort by Speed</option>
            </select>
            <button
              onClick={() => {
                const newOrder = sortOrder === "asc" ? "desc" : "asc";
                setSortOrder(newOrder);
                fetchPokemon(search, 0, sortBy, newOrder, true);
              }}
              className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      {/* Pokemon Stats Grid */}
      <div className="container mx-auto px-4 pb-8">
        {pokemon.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No Pokemon found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pokemon.map((p) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Pokemon Header */}
                  <div className="bg-gradient-to-r from-red-600 to-red-700 p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                        alt={p.name}
                        className="w-16 h-16 bg-white rounded-full p-1"
                      />
                      <div>
                        <span className="text-white/80 text-sm">#{p.id.toString().padStart(3, "0")}</span>
                        <h3 className="font-semibold uppercase text-white text-lg capitalize">
                          {p.name}
                        </h3>
                        <div className="flex gap-1 mt-1">
                          {p.types.map((type) => (
                            <span
                              key={type.id}
                              className={`px-2 py-0.5 rounded-full text-xs text-white capitalize ${getTypeColor(type.identifier)}`}
                            >
                              {type.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-4">
                    {/* Physical Info */}
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span>Height: {p.height / 10}m</span>
                      <span>Weight: {p.weight / 10}kg</span>
                    </div>

                    {/* Base Stats */}
                    <div className="space-y-2">
                      {["HP", "Attack", "Defense", "Special Attack", "Special Defense", "Speed"].map((stat) => {
                        const value = p.stats[stat as keyof typeof p.stats] || 0;
                        return (
                          <div key={stat} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-20">
                              {stat}
                            </span>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full ${statColors[stat]} transition-all duration-500`}
                                style={{ width: getStatPercentage(value) }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-8 text-right">
                              {value}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total Stats */}
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</span>
                        <span className="text-lg font-bold text-red-600">{p.total_stats}</span>
                      </div>
                    </div>

                    {/* Abilities */}
                    {p.abilities.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Abilities:</span>
                        <div className="flex flex-wrap gap-1">
                          {p.abilities.map((ability) => (
                            <span
                              key={ability.id}
                              className={`px-2 py-0.5 rounded text-xs capitalize ${
                                ability.is_hidden
                                  ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {ability.name}
                              {ability.is_hidden && " (Hidden)"}
                            </span>
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
                  {loading ? "Loading..." : `Load More (${total - pokemon.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}

        {/* Loading State */}
        {loading && pokemon.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
