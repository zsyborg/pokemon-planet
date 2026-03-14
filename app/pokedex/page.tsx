"use client";

import SearchInput from "../components/SearchInput";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import 'animate.css';

// Types for Pokemon
interface Pokemon {
  id: number;
  identifier: string;
  name?: string;
}

export default function Pokedex() {
  const router = useRouter();
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [query, setQuery] = useState("");
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const limit = 20;

  const loadPokemon = async (skipValue: number, append: boolean = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pokemon?q=${encodeURIComponent(query)}&skip=${skipValue}&limit=${limit}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      
      if (append) {
        setPokemon(prev => [...prev, ...data]);
      } else {
        setPokemon(data);
      }
      
      setHasMore(data.length === limit);
    } catch (error) {
      console.error("Failed to load Pokemon:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSkip(0);
    loadPokemon(0, false);
  }, [query]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (query !== "") return; // Disable infinite scroll during search
    if (!hasMore || loading) return;

    const sentinel = document.getElementById('scroll-sentinel');
    
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && query === "") {
          const newSkip = skip + limit;
          setSkip(newSkip);
          loadPokemon(newSkip, true);
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, skip, query, limit]);

  // Handle clicking on Pokemon to open modal
  const handlePokemonClick = (p: Pokemon) => {
    router.push(`/pokemon/${p.id}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-zinc-50 font-sans dark:bg-black p-6"
    >
      {/* Header */}
      <div className="mb-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <a href="/deckbuilder" className="text-2xl hover:scale-110 transition-transform" title="Back to Home">🏠</a>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Pokedex</h1>
        </div>
        <SearchInput onSearch={setQuery} />
      </div>

      {/* Pokemon Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {pokemon.map((p: Pokemon, index: number) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.03, ease: "easeOut" }}
              className="border border-amber-300 bg-white dark:bg-gray-800 dark:border-gray-700 p-4 rounded-lg hover:shadow-lg transition-all cursor-pointer hover:border-yellow-400 hover:ring-2 hover:ring-yellow-400/50"
              style={{
                backgroundImage: `url(/sprites/sprites/pokemon/${p.id}.png)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
              onClick={() => handlePokemonClick(p)}
            >
              <div className="relative z-10 bg-white/90 dark:bg-gray-900/90 rounded-lg p-2">
                <h2 className="font-bold capitalize text-lg text-gray-800 dark:text-white">{p.identifier}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">ID: {p.id}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Loading indicator and infinite scroll trigger */}
        <div className="col-span-2 flex justify-center py-8 mt-4">
          {loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
            >
              <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading more Pokemon...</span>
            </motion.div>
          )}
          {!hasMore && pokemon.length > 0 && (
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-gray-500 text-sm"
            >
              No more Pokemon to load
            </motion.p>
          )}
        </div>
        
        {/* Sentinel element for Intersection Observer */}
        <div id="scroll-sentinel" className="h-4" />
      </div>
    </motion.div>
  );
}
