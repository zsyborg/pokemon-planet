"use client"

import Image from "next/image";
import { useEffect, useState } from "react";
import 'animate.css';

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

export default function PokemonDetails({ pokemon, onClose }: { pokemon: any; onClose?: () => void }) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pokemon/${pokemon.id}`)
      .then(res => res.json())
      .then(data => {
        setDetails(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [pokemon.id]);

  if (loading) return <div className="text-center py-8 text-white">Loading...</div>;
  if (!details) return <div className="text-center py-8 text-white">Failed to load details.</div>;

  return (
    <div className="pokemon-details w-full h-full">
      <div className="text-center mb-6">
        <img
          src={`/sprites/sprites/pokemon/${details.id}.png`}
          alt={details.identifier ?? ""}
          width={150}
          height={150}
          className="mx-auto rounded-full border-4 border-yellow-400 shadow-lg bg-white p-2"
        />
        <h1 className="capitalize text-3xl font-bold text-gray-800 mt-4">
          {details.identifier}
        </h1>
        <div className="flex justify-center gap-2 mt-2">
          {details.types?.map((type: any) => (
            <span key={type.id} className="px-3 py-1 rounded-full text-white text-sm font-semibold bg-gray-500 capitalize">
              {type.identifier}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-700 mt-2 uppercase"> {details.generation?.identifier}</p>
      </div>

      <div className="bg-white/70 p-4 rounded-lg shadow-md mb-6">
        <p className="text-sm text-gray-700 italic">{details.flavorText}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/70 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Stats</h2>
          <div className="space-y-2">
            {details.stats?.map((stat: any) => (
              <div key={stat.stat_id} className="flex items-center text-gray-700">
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
          <p className="text-sm text-gray-700">
            <strong>Height:</strong> {details.height} dm
          </p>
          <p className="text-sm text-gray-700">
            <strong>Weight:</strong> {details.weight} hg
          </p>
          {details.abilities?.length > 0 && (
            <p className="text-sm text-gray-700 capitalize">
              <strong className="capitalize">Abilities:</strong> {details.abilities.map((a: any) => a.identifier).join(', ')}
            </p>
          )}

          {details.species && (
            <>
            <p className="text-sm text-gray-700">
              <strong>Capture Rate:</strong> {details.species.capture_rate}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Base Happiness:</strong> {details.species.base_hapiness}
            </p>
            </>
          )}
        </div>
      </div>

      {details.evolvesFrom && (
        <div className="bg-white/70 p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Evolution</h2>
          <div className="flex items-center gap-4">
            <img
              src={`/sprites/sprites/pokemon/${details.evolvesFrom.id}.png`}
              alt={details.evolvesFrom.identifier}
              width={60}
              height={60}
              className="rounded-full border-2 border-gray-300"
            />
            <span className="text-sm capitalize text-gray-700">{details.evolvesFrom.identifier}</span>
            <span className="text-gray-500">→</span>
            <img
              src={`/sprites/sprites/pokemon/${details.id}.png`}
              alt={details.identifier}
              width={60}
              height={60}
              className="rounded-full border-2 border-yellow-400"
            />
            <span className="text-sm capitalize font-semibold text-gray-700">{details.identifier}</span>
          </div>
        </div>
      )}

      <div className="bg-white/70 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Moves</h2>
        <ul className="text-sm grid grid-cols-2 gap-1">
          {details.moves?.slice(0, 20).map((move: any) => (
            <li key={move.id} className="capitalize text-gray-700">{move.identifier}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}