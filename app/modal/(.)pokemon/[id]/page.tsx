'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const typeColors: { [key: string]: string } = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-blue-200',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-green-400',
  rock: 'bg-yellow-800',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-700',
  dark: 'bg-gray-800',
  steel: 'bg-gray-500',
  fairy: 'bg-pink-300',
};

export default function PokemonModal({
  params,
}: {
  params: { id: string };
}) {
  const [pokemon, setPokemon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pokemon/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setPokemon(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="text-white">Loading...</div></div>;
  if (!pokemon) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 bg-opacity-90 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 p-8 rounded-2xl shadow-2xl border border-gray-200 w-[600px] max-h-[85vh] overflow-y-auto relative animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out">
        <Link
          href="/"
          className="absolute top-4 right-4 text-2xl font-bold text-gray-600 hover:text-gray-800 transition-colors"
        >
          ×
        </Link>

        <div className="text-center mb-6">
          <Image
            src={`/sprites/sprites/pokemon/${pokemon.id}.png`}
            alt={pokemon.identifier ?? ""}
            width={150}
            height={150}
            className="mx-auto rounded-full border-4 border-yellow-400 shadow-lg bg-white p-2"
          />
          <h1 className="capitalize text-3xl font-bold text-gray-800 mt-4">
            {pokemon.identifier}
          </h1>
          <div className="flex justify-center gap-2 mt-2">
            {pokemon.types?.map((type: any) => (
              <span key={type.id} className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${typeColors[type.identifier] || 'bg-gray-500'}`}>
                {type.identifier}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">Generation {pokemon.generation?.identifier}</p>
        </div>

        <div className="bg-white/70 p-4 rounded-lg shadow-md mb-6">
          <p className="text-sm text-gray-700 italic">{pokemon.flavorText}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div className="bg-white/70 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Stats</h2>
            <div className="space-y-2">
              {pokemon.stats?.map((stat: any) => (
                <div key={stat.stat_id} className="flex items-center">
                  <span className="w-20 text-sm capitalize">{stat.name}:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(stat.base_stat / 255 * 100, 100)}%` }}></div>
                  </div>
                  <span className="ml-2 text-sm">{stat.base_stat}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/70 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Details</h2>
            <p className="text-sm text-gray-600">
              <strong>Height:</strong> {pokemon.height} dm
            </p>
            <p className="text-sm text-gray-600">
              <strong>Weight:</strong> {pokemon.weight} hg
            </p>
            {pokemon.abilities?.length > 0 && (
              <p className="text-sm text-gray-600">
                <strong>Abilities:</strong> {pokemon.abilities.map((a: any) => a.identifier).join(', ')}
              </p>
            )}
          </div>
        </div>

        {pokemon.evolvesFrom && (
          <div className="bg-white/70 p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Evolution</h2>
            <div className="flex items-center gap-4">
              <Image
                src={`/sprites/sprites/pokemon/${pokemon.evolvesFrom.id}.png`}
                alt={pokemon.evolvesFrom.identifier}
                width={60}
                height={60}
                className="rounded-full border-2 border-gray-300"
              />
              <span className="text-sm capitalize">{pokemon.evolvesFrom.identifier}</span>
              <span className="text-gray-500">→</span>
              <Image
                src={`/sprites/sprites/pokemon/${pokemon.id}.png`}
                alt={pokemon.identifier}
                width={60}
                height={60}
                className="rounded-full border-2 border-yellow-400"
              />
              <span className="text-sm capitalize font-semibold">{pokemon.identifier}</span>
            </div>
          </div>
        )}

        <div className="bg-white/70 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Moves</h2>
          <ul className="text-sm grid grid-cols-2 gap-1">
            {pokemon.moves?.slice(0, 20).map((move: any) => (
              <li key={move.id} className="capitalize">{move.identifier}</li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
