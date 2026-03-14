"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Location {
  id: number;
  name: string;
  identifier: string;
  region_id: number;
  region: string;
  generation: string | null;
}

interface LocationsResponse {
  locations: Location[];
  total: number;
  skip: number;
  limit: number;
}

const regionColors: Record<string, string> = {
  "1": "bg-red-500",
  "2": "bg-orange-500",
  "3": "bg-yellow-500",
  "4": "bg-green-500",
  "5": "bg-blue-500",
  "6": "bg-purple-500",
  "7": "bg-pink-500",
  "8": "bg-gray-500",
  "9": "bg-cyan-500",
};

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const fetchLocations = async (searchTerm: string, skipValue: number, reset: boolean = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      params.set("skip", skipValue.toString());
      params.set("limit", limit.toString());

      const response = await fetch(`/api/locations?${params.toString()}`);
      const data: LocationsResponse = await response.json();

      if (reset) {
        setLocations(data.locations);
      } else {
        setLocations((prev) => [...prev, ...data.locations]);
      }
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to load locations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations(search, 0, true);
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    setSkip(0);
    fetchLocations(value, 0, true);
  };

  const loadMore = () => {
    const newSkip = skip + limit;
    setSkip(newSkip);
    fetchLocations(search, newSkip, false);
  };

  const hasMore = locations.length < total;

  const formatIdentifier = (identifier: string): string => {
    return identifier.replace(/-/g, " ");
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
              <h1 className="text-3xl font-bold">Pokémon Locations</h1>
            </div>
            <span className="text-white/80">
              {total > 0 ? `${total} locations` : "Loading..."}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search locations by name..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Locations Grid */}
      <div className="container mx-auto px-4 pb-8">
        {locations.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No locations found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Location Header */}
                  <div className={`bg-gradient-to-r ${regionColors[location.region_id.toString()] || "bg-gray-500"} to-gray-600 p-4`}>
                    <span className="text-white/80 text-xs">#{location.id}</span>
                    <h3 className="font-semibold uppercase text-white truncate">
                      {location.name}
                    </h3>
                  </div>

                  {/* Location Details */}
                  <div className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {formatIdentifier(location.identifier)}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                        Region {location.region_id}
                      </span>
                      {location.generation && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs text-blue-600 dark:text-blue-300 capitalize">
                          {location.generation}
                        </span>
                      )}
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
                  {loading ? "Loading..." : `Load More (${total - locations.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}

        {/* Loading State */}
        {loading && locations.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
