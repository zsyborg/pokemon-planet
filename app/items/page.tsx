"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Item {
  id: number;
  identifier: string;
  category_id: number;
  cost: number;
  fling_power: number | null;
  name?: string;
  category?: string;
  flavor_text?: string;
}

interface ItemsResponse {
  items: Item[];
  total: number;
  skip: number;
  limit: number;
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const fetchItems = async (searchTerm: string, skipValue: number, reset: boolean = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      params.set("skip", skipValue.toString());
      params.set("limit", limit.toString());

      const response = await fetch(`/api/items?${params.toString()}`);
      const data: ItemsResponse = await response.json();

      if (reset) {
        setItems(data.items);
      } else {
        setItems((prev) => [...prev, ...data.items]);
      }
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to load items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(search, 0, true);
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    setSkip(0);
    fetchItems(value, 0, true);
  };

  const loadMore = () => {
    const newSkip = skip + limit;
    setSkip(newSkip);
    fetchItems(search, newSkip, false);
  };

  const formatCost = (cost: number) => {
    if (cost === 0) return "N/A";
    return cost.toLocaleString();
  };

  const hasMore = items.length < total;

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
              <h1 className="text-3xl font-bold">Pokémon Items</h1>
            </div>
            <span className="text-white/80">
              {total > 0 ? `${total} items` : "Loading..."}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search items by name..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Items Grid */}
      <div className="container mx-auto px-4 pb-8">
        {items.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No items found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Item Image */}
                  <div className="relative h-24 bg-gray-50 dark:bg-gray-700 flex items-center justify-center p-2">
                    <Image
                      src={`/sprites/sprites/items/${item.identifier}.png`}
                      alt={item.name || item.identifier}
                      width={64}
                      height={64}
                      className="object-contain"
                      unoptimized
                      onError={(e) => {
                        // Hide the image if it fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Item Details */}
                  <div className="p-3">
                    <h3 className="font-semibold uppercase text-gray-900 dark:text-white text-sm truncate">
                      {item.name || item.identifier}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">
                      {item.category?.replace(/-/g, " ") || "Unknown"}
                    </p>

                    {/* Cost */}
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Cost:</span>
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        {formatCost(item.cost)}
                      </span>
                    </div>

                    {/* Description */}
                    {item.flavor_text && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                        {item.flavor_text}
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
                  {loading ? "Loading..." : `Load More (${total - items.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}

        {/* Loading State */}
        {loading && items.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
