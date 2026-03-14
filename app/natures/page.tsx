"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Nature {
  id: number;
  name: string;
  identifier: string;
  increased_stat: string;
  decreased_stat: string;
  effect: string;
  hates_flavor: string | null;
  likes_flavor: string | null;
  game_index: number;
}

interface NaturesResponse {
  natures: Nature[];
}

const flavorColors: Record<string, string> = {
  Spicy: "bg-red-500",
  Dry: "bg-orange-500",
  Sweet: "bg-pink-500",
  Bitter: "bg-green-500",
  Sour: "bg-yellow-500",
};

export default function NaturesPage() {
  const [natures, setNatures] = useState<Nature[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchNatures = async (searchTerm: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);

      const response = await fetch(`/api/natures?${params.toString()}`);
      const data: NaturesResponse = await response.json();
      setNatures(data.natures);
    } catch (error) {
      console.error("Failed to load natures:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNatures(search);
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchNatures(value);
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
              <h1 className="text-3xl font-bold">Pokémon Natures</h1>
            </div>
            <span className="text-white/80">
              {natures.length > 0 ? `${natures.length} natures` : "Loading..."}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search natures by name or effect..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Natures Grid */}
      <div className="container mx-auto px-4 pb-8">
        {natures.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No natures found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {natures.map((nature) => (
              <div
                key={nature.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Nature Header */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold uppercase text-white">
                      {nature.name}
                    </h3>
                    <span className="text-white/80 text-xs">#{nature.game_index}</span>
                  </div>
                </div>

                {/* Nature Details */}
                <div className="p-4">
                  {/* Effect */}
                  <div className="mb-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Effect</span>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {nature.effect}
                    </p>
                  </div>

                  {/* Stats */}
                  {nature.increased_stat && nature.decreased_stat && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">+</span>
                        <p className="font-medium text-green-600 dark:text-green-400 text-sm">
                          {nature.increased_stat}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">-</span>
                        <p className="font-medium text-red-600 dark:text-red-400 text-sm">
                          {nature.decreased_stat}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Flavors */}
                  <div className="flex flex-wrap gap-2">
                    {nature.likes_flavor && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        <span className="text-gray-500">Likes:</span>{" "}
                        <span className={`${flavorColors[nature.likes_flavor] || ""} px-1 rounded text-white`}>
                          {nature.likes_flavor}
                        </span>
                      </span>
                    )}
                    {nature.hates_flavor && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        <span className="text-gray-500">Hates:</span>{" "}
                        <span className={`${flavorColors[nature.hates_flavor] || ""} px-1 rounded text-white`}>
                          {nature.hates_flavor}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && natures.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
