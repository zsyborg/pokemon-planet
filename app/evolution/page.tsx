"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface EvolutionChain {
  species_id: number;
  name: string;
  identifier: string;
  pokemon_id: number | null;
  sprite: string | null;
  types: { id: number; name: string; identifier: string }[];
  evolves_from: { species_id: number; name: string } | null;
  evolution_details: {
    id: number;
    evolved_species_id: number;
    trigger: string;
    minimum_level: number | null;
    held_item_id: number | null;
    time_of_day: string | null;
    minimum_happiness: number | null;
  }[];
}

interface EvolutionData {
  chain_id: number;
  chain: EvolutionChain[];
}

interface EvolutionResponse {
  evolutions: EvolutionData[];
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

export default function EvolutionPage() {
  const [evolutions, setEvolutions] = useState<EvolutionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const fetchEvolutions = async (searchTerm: string, skipValue: number, reset: boolean = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      params.set("skip", skipValue.toString());
      params.set("limit", limit.toString());

      const response = await fetch(`/api/evolution?${params.toString()}`);
      const data: EvolutionResponse = await response.json();

      if (reset) {
        setEvolutions(data.evolutions);
      } else {
        setEvolutions((prev) => [...prev, ...data.evolutions]);
      }
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to load evolutions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvolutions(search, 0, true);
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    setSkip(0);
    fetchEvolutions(value, 0, true);
  };

  const loadMore = () => {
    const newSkip = skip + limit;
    setSkip(newSkip);
    fetchEvolutions(search, newSkip, false);
  };

  const hasMore = evolutions.length < total;

  const getTypeColor = (typeIdentifier: string): string => {
    return typeColors[typeIdentifier] || "bg-gray-400";
  };

  const formatTrigger = (trigger: string): string => {
    return trigger.replace(/-/g, " ");
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
              <h1 className="text-3xl font-bold">Pokémon Evolution</h1>
            </div>
            <span className="text-white/80">
              {total > 0 ? `${total} evolution chains` : "Loading..."}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search Pokemon by name..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Evolution Chains */}
      <div className="container mx-auto px-4 pb-8">
        {evolutions.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No evolutions found</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {evolutions.map((evolution) => (
                <div
                  key={evolution.chain_id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  {/* Evolution Chain Header */}
                  <div className="bg-gradient-to-r from-red-600 to-red-700 p-4">
                    <h3 className="font-semibold uppercase text-white">
                      Evolution Chain #{evolution.chain_id}
                    </h3>
                  </div>

                  {/* Chain */}
                  <div className="p-4">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      {evolution.chain.map((pokemon, index) => (
                        <div key={pokemon.species_id} className="flex items-center">
                          {/* Pokemon Card */}
                          <div className="flex flex-col items-center">
                            {pokemon.sprite ? (
                              <img
                                src={pokemon.sprite}
                                alt={pokemon.name}
                                className="w-24 h-24"
                              />
                            ) : (
                              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-gray-500">?</span>
                              </div>
                            )}
                            <Link
                              href={`/pokemon/${pokemon.pokemon_id}`}
                              className="font-semibold text-gray-900 dark:text-white capitalize hover:text-red-600 transition-colors mt-2"
                            >
                              {pokemon.name}
                            </Link>
                            <div className="flex gap-1 mt-1">
                              {pokemon.types.map((type) => (
                                <span
                                  key={type.id}
                                  className={`px-2 py-0.5 rounded-full text-xs text-white capitalize ${getTypeColor(type.identifier)}`}
                                >
                                  {type.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Evolution Arrow */}
                          {index < evolution.chain.length - 1 && (
                            <div className="flex flex-col items-center mx-4">
                              {/* Evolution Details */}
                              {pokemon.evolution_details.length > 0 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
                                  {pokemon.evolution_details.map((detail, i) => (
                                    <div key={i}>
                                      {detail.minimum_level && <span>Level {detail.minimum_level} </span>}
                                      {detail.minimum_happiness && <span>Happiness </span>}
                                      {detail.time_of_day && <span>{detail.time_of_day} </span>}
                                      <span className="font-medium">{formatTrigger(detail.trigger)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <span className="text-2xl text-gray-400">→</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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
                  {loading ? "Loading..." : `Load More (${total - evolutions.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}

        {/* Loading State */}
        {loading && evolutions.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
