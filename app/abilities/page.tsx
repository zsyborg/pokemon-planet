"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Ability {
  id: number;
  identifier: string;
  is_main_series: boolean;
  name?: string;
  flavor_text?: string;
  short_description?: string;
  description?: string;
  pokemon?: {
    id: number;
    name: string;
    sprite: string;
    is_hidden: boolean;
    slot: number;
  }[];
}

interface AbilitiesResponse {
  abilities: Ability[];
  total: number;
  skip: number;
  limit: number;
}

export default function AbilitiesPage() {
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const fetchAbilities = async (searchTerm: string, skipValue: number, reset: boolean = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      params.set("skip", skipValue.toString());
      params.set("limit", limit.toString());

      const response = await fetch(`/api/abilities?${params.toString()}`);
      const data: AbilitiesResponse = await response.json();

      if (reset) {
        setAbilities(data.abilities);
      } else {
        setAbilities((prev) => [...prev, ...data.abilities]);
      }
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to load abilities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbilities(search, 0, true);
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    setSkip(0);
    fetchAbilities(value, 0, true);
  };

  const loadMore = () => {
    const newSkip = skip + limit;
    setSkip(newSkip);
    fetchAbilities(search, newSkip, false);
  };

  const hasMore = abilities.length < total;

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
              <h1 className="text-3xl font-bold">Pokémon Abilities</h1>
            </div>
            <span className="text-white/80">
              {total > 0 ? `${total} abilities` : "Loading..."}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search abilities by name..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Abilities Grid */}
      <div className="container mx-auto px-4 pb-8">
        {abilities.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No abilities found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {abilities.map((ability) => (
                <div
                  key={ability.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Ability Header */}
                  <div className="bg-gradient-to-r from-red-600 to-red-700 p-3">
                    <h3 className="font-semibold uppercase text-white text-sm truncate">
                      {ability.name || ability.identifier}
                    </h3>
                    <p className="text-white/80 text-xs mt-1">
                      {ability.is_main_series ? "Main Series" : "Non-Main Series"}
                    </p>
                  </div>

                  {/* Ability Details */}
                  <div className="p-3">
                    {/* Description */}
                    {(ability.flavor_text || ability.short_description) && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
                        {ability.flavor_text || ability.short_description}
                      </p>
                    )}

                    {/* Pokemon that have this ability */}
                    {ability.pokemon && ability.pokemon.length > 0 && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-2">
                          Pokémon with this ability:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {ability.pokemon.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1"
                              title={p.is_hidden ? "Hidden Ability" : `Slot ${p.slot}`}
                            >
                              <img
                                src={p.sprite}
                                alt={p.name}
                                className="w-5 h-5"
                              />
                              <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">
                                {p.name}
                              </span>
                              {p.is_hidden && (
                                <span className="text-[10px] text-purple-500" title="Hidden Ability">
                                  ★
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        {ability.pokemon.length >= 10 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            And more...
                          </p>
                        )}
                      </div>
                    )}

                    {/* No Pokemon indicator */}
                    {(!ability.pokemon || ability.pokemon.length === 0) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                        No Pokémon have this ability
                      </p>
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
                  {loading ? "Loading..." : `Load More (${total - abilities.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}

        {/* Loading State */}
        {loading && abilities.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
