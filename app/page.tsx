"use client";

import Image from "next/image";
import SearchInput from "./components/SearchInput";
import { useEffect, useState } from "react";
import PokemonDetails from "./components/PokemonDetails";


export default function Home() {
  const [pokemon, setPokemon] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  useEffect(() => {
    fetch(`/api/pokemon?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(setPokemon);

      console.log(selectedPokemon);
  }, [query]);

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      {/* Left Side - Pokemon List */}
      <div className="w-1/2 min-h-screen p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Pokemon List</h1>
          <SearchInput onSearch={setQuery} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {pokemon.map((p: any) => (
            <div
              key={p.id}
              className={`border p-4 rounded-lg hover:shadow-lg transition-shadow cursor-pointer ${
                selectedPokemon?.id === p.id 
                  ? 'border-yellow-400 bg-yellow-50' 
                  : 'border-amber-300 bg-white dark:bg-gray-800 dark:border-gray-700'
              }`}
              onClick={() => setSelectedPokemon(p)}
            >
              <h2 className="font-bold capitalize text-lg text-gray-800 dark:text-white">{p.identifier}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">ID: {p.id}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Pokemon Details */}
      <div className="w-1/2 min-h-screen p-6 bg-gray-100 dark:bg-gray-900 overflow-y-auto">
        {selectedPokemon ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <PokemonDetails pokemon={selectedPokemon} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-xl">Select a Pokemon to see details</p>
          </div>
        )}
      </div>
    </div>
  );
}
