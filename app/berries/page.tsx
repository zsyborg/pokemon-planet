"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Berry {
  id: number;
  item_id: number;
  name: string;
  firmness: string;
  natural_gift_power: number;
  natural_gift_type: { id: number; name: string; identifier: string } | null;
  size: number;
  max_harvest: number;
  growth_time: number;
  soil_dryness: number;
  smoothness: number;
  flavors: Record<string, number>;
}

interface BerriesResponse {
  berries: Berry[];
  total: number;
  skip: number;
  limit: number;
}

const flavorColors: Record<string, string> = {
  Spicy: "bg-red-500",
  Dry: "bg-orange-500",
  Sweet: "bg-pink-500",
  Bitter: "bg-green-500",
  Sour: "bg-yellow-500",
};

export default function BerriesPage() {
  const [berries, setBerries] = useState<Berry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const fetchBerries = async (searchTerm: string, skipValue: number, reset: boolean = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      params.set("skip", skipValue.toString());
      params.set("limit", limit.toString());

      const response = await fetch(`/api/berries?${params.toString()}`);
      const data: BerriesResponse = await response.json();

      if (reset) {
        setBerries(data.berries);
      } else {
        setBerries((prev) => [...prev, ...data.berries]);
      }
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to load berries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBerries(search, 0, true);
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    setSkip(0);
    fetchBerries(value, 0, true);
  };

  const loadMore = () => {
    const newSkip = skip + limit;
    setSkip(newSkip);
    fetchBerries(search, newSkip, false);
  };

  const hasMore = berries.length < total;

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
              <h1 className="text-3xl font-bold">Pokémon Berries</h1>
            </div>
            <span className="text-white/80">
              {total > 0 ? `${total} berries` : "Loading..."}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search berries by name..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Berries Grid */}
      <div className="container mx-auto px-4 pb-8">
        {berries.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No berries found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {berries.map((berry) => (
                <div
                  key={berry.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Berry Header */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/berry.png`}
                        alt={berry.name}
                        className="w-12 h-12 bg-white rounded-full p-1"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                      <div>
                        <h3 className="font-semibold uppercase text-white">
                          {berry.name}
                        </h3>
                        <span className="text-white/80 text-xs">
                          #{berry.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Berry Details */}
                  <div className="p-4">
                    {/* Firmness */}
                    <div className="mb-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Firmness</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {berry.firmness}
                      </p>
                    </div>

                    {/* Growth Info */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Growth Time</span>
                        <p className="font-medium text-gray-900 dark:text-white">{berry.growth_time}h</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Max Harvest</span>
                        <p className="font-medium text-gray-900 dark:text-white">{berry.max_harvest}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Size</span>
                        <p className="font-medium text-gray-900 dark:text-white">{berry.size}mm</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Smoothness</span>
                        <p className="font-medium text-gray-900 dark:text-white">{berry.smoothness}</p>
                      </div>
                    </div>

                    {/* Natural Gift */}
                    {berry.natural_gift_type && (
                      <div className="mb-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Natural Gift</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {berry.natural_gift_power} Power / {berry.natural_gift_type.name} Type
                        </p>
                      </div>
                    )}

                    {/* Flavors */}
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-2">Flavors</span>
                      <div className="space-y-1">
                        {Object.entries(berry.flavors).map(([flavor, potency]) => (
                          <div key={flavor} className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 dark:text-gray-400 w-16">
                              {flavor}
                            </span>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full ${flavorColors[flavor] || "bg-gray-500"} transition-all duration-500`}
                                style={{ width: `${(potency / 10) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-6 text-right">
                              {potency}
                            </span>
                          </div>
                        ))}
                      </div>
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
                  {loading ? "Loading..." : `Load More (${total - berries.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}

        {/* Loading State */}
        {loading && berries.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
