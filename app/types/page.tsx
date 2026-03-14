"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Type {
  id: number;
  identifier: string;
  name: string;
}

interface PokemonType {
  id: number;
  name: string;
  types: Type[];
}

interface TypeEffectiveness {
  type: Type;
  multiplier: number;
}

interface TypeChartResponse {
  types: Type[];
  effectivenessMatrix: Record<number, Record<number, number>>;
}

interface PokemonEffectivenessResponse {
  pokemon: {
    id: number;
    name: string;
    types: Type[];
  };
  weaknesses: TypeEffectiveness[];
  resistances: TypeEffectiveness[];
  immunities: TypeEffectiveness[];
  effectivenessMatrix: Record<number, Record<number, number>>;
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

export default function TypesPage() {
  const [typeChart, setTypeChart] = useState<TypeChartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchPokemon, setSearchPokemon] = useState("");
  const [pokemonResults, setPokemonResults] = useState<{ id: number; name: string }[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonEffectivenessResponse | null>(null);
  const [searching, setSearching] = useState(false);
  const [viewMode, setViewMode] = useState<"chart" | "pokemon">("chart");

  const fetchTypeChart = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/types");
      const data: TypeChartResponse = await response.json();
      setTypeChart(data);
    } catch (error) {
      console.error("Failed to load type chart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypeChart();
  }, []);

  const searchPokemonHandler = async (value: string) => {
    setSearchPokemon(value);
    if (value.length < 2) {
      setPokemonResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/pokemon?search=${encodeURIComponent(value)}&limit=10`);
      const data = await response.json();
      setPokemonResults(data.pokemon || []);
    } catch (error) {
      console.error("Failed to search pokemon:", error);
    } finally {
      setSearching(false);
    }
  };

  const selectPokemon = async (pokemonId: number) => {
    setSearching(true);
    try {
      const response = await fetch(`/api/types?pokemonId=${pokemonId}`);
      const data: PokemonEffectivenessResponse = await response.json();
      setSelectedPokemon(data);
      setViewMode("pokemon");
    } catch (error) {
      console.error("Failed to get pokemon effectiveness:", error);
    } finally {
      setSearching(false);
      setPokemonResults([]);
      setSearchPokemon("");
    }
  };

  const getEffectivenessColor = (damageFactor: number): string => {
    if (damageFactor === 0) return "bg-gray-900 text-white";
    if (damageFactor === 50) return "bg-green-200";
    if (damageFactor === 200) return "bg-red-500 text-white";
    if (damageFactor === 25) return "bg-green-400";
    if (damageFactor === 400) return "bg-red-700 text-white";
    return "";
  };

  const getEffectivenessText = (damageFactor: number): string => {
    if (damageFactor === 0) return "0×";
    if (damageFactor === 25) return "¼×";
    if (damageFactor === 50) return "½×";
    if (damageFactor === 100) return "1×";
    if (damageFactor === 200) return "2×";
    if (damageFactor === 400) return "4×";
    return `${damageFactor}×`;
  };

  const getTypeColor = (typeIdentifier: string): string => {
    return typeColors[typeIdentifier] || "bg-gray-400";
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
              <h1 className="text-3xl font-bold">Type Advantage Chart</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("chart")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "chart"
                    ? "bg-white text-red-600"
                    : "bg-red-700 hover:bg-red-800"
                }`}
              >
                Type Chart
              </button>
              <button
                onClick={() => setViewMode("pokemon")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "pokemon"
                    ? "bg-white text-red-600"
                    : "bg-red-700 hover:bg-red-800"
                }`}
              >
                Pokemon Checker
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pokemon Search */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto relative">
          <input
            type="text"
            placeholder="Search Pokemon to check type effectiveness..."
            value={searchPokemon}
            onChange={(e) => searchPokemonHandler(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {pokemonResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 z-10 max-h-60 overflow-y-auto">
              {pokemonResults.map((pokemon) => (
                <button
                  key={pokemon.id}
                  onClick={() => selectPokemon(pokemon.id)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                    alt={pokemon.name}
                    className="w-8 h-8"
                  />
                  <span className="capitalize text-gray-900 dark:text-white">{pokemon.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : viewMode === "pokemon" ? (
        /* Pokemon Type Effectiveness View */
        <div className="container mx-auto px-4 pb-8">
          {selectedPokemon ? (
            <div className="max-w-2xl mx-auto">
              {/* Selected Pokemon */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.pokemon.id}.png`}
                    alt={selectedPokemon.pokemon.name}
                    className="w-24 h-24"
                  />
                  <div>
                    <h2 className="text-2xl font-bold capitalize text-gray-900 dark:text-white">
                      {selectedPokemon.pokemon.name}
                    </h2>
                    <div className="flex gap-2 mt-2">
                      {selectedPokemon.pokemon.types.map((type) => (
                        <span
                          key={type.id}
                          className={`px-3 py-1 rounded-full text-white text-sm font-medium capitalize ${getTypeColor(
                            type.identifier
                          )}`}
                        >
                          {type.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Immunities */}
              {selectedPokemon.immunities.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                    <span className="w-4 h-4 rounded-full bg-gray-900"></span>
                    Immune To
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPokemon.immunities.map((immunity) => (
                      <span
                        key={immunity.type.id}
                        className={`px-3 py-2 rounded-lg text-white font-medium capitalize flex items-center gap-2 ${getTypeColor(
                          immunity.type.identifier
                        )}`}
                      >
                        {immunity.type.name}
                        <span className="text-xs opacity-80">{getEffectivenessText(immunity.multiplier)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resistances */}
              {selectedPokemon.resistances.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                    <span className="w-4 h-4 rounded-full bg-green-400"></span>
                    Resistant To
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPokemon.resistances.map((resistance) => (
                      <span
                        key={resistance.type.id}
                        className={`px-3 py-2 rounded-lg text-white font-medium capitalize flex items-center gap-2 ${getTypeColor(
                          resistance.type.identifier
                        )}`}
                      >
                        {resistance.type.name}
                        <span className="text-xs opacity-80">{getEffectivenessText(resistance.multiplier)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Weaknesses */}
              {selectedPokemon.weaknesses.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                    <span className="w-4 h-4 rounded-full bg-red-500"></span>
                    Weak To
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPokemon.weaknesses.map((weakness) => (
                      <span
                        key={weakness.type.id}
                        className={`px-3 py-2 rounded-lg text-white font-medium capitalize flex items-center gap-2 ${getTypeColor(
                          weakness.type.identifier
                        )}`}
                      >
                        {weakness.type.name}
                        <span className="text-xs opacity-80">{getEffectivenessText(weakness.multiplier)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedPokemon(null);
                  setViewMode("chart");
                }}
                className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Type Chart
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Search for a Pokemon to see its type advantages and disadvantages
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Type Chart Grid View */
        <div className="container mx-auto px-4 pb-8 overflow-x-auto">
          {typeChart && (
            <div className="min-w-max">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    How damage is calculated when attacking
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Rows show attacking type, columns show defending type
                  </p>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-red-500 text-white flex items-center justify-center text-xs font-bold">2×</span>
                    <span className="text-gray-600 dark:text-gray-400">Super Effective</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-green-200 flex items-center justify-center text-xs font-bold">½×</span>
                    <span className="text-gray-600 dark:text-gray-400">Not Very Effective</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-gray-900 text-white flex items-center justify-center text-xs font-bold">0×</span>
                    <span className="text-gray-600 dark:text-gray-400">No Effect</span>
                  </div>
                </div>

                {/* Type Chart Grid */}
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-xs text-gray-500 dark:text-gray-400">Attack ↓ / Defense →</th>
                      {typeChart.types.map((type) => (
                        <th
                          key={type.id}
                          className={`p-2 text-xs font-medium text-white rounded ${getTypeColor(type.identifier)}`}
                        >
                          {type.name.slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {typeChart.types.map((attackingType) => (
                      <tr key={attackingType.id}>
                        <th
                          className={`p-2 text-xs font-medium text-white rounded ${getTypeColor(attackingType.identifier)}`}
                        >
                          {attackingType.name}
                        </th>
                        {typeChart.types.map((defendingType) => {
                          const damageFactor =
                            typeChart.effectivenessMatrix[attackingType.id]?.[defendingType.id] || 100;
                          return (
                            <td
                              key={`${attackingType.id}-${defendingType.id}`}
                              className={`p-1 text-center text-xs font-bold border border-gray-200 dark:border-gray-700 ${getEffectivenessColor(
                                damageFactor
                              )}`}
                              title={`${attackingType.name} → ${defendingType.name}: ${getEffectivenessText(damageFactor)}`}
                            >
                              {getEffectivenessText(damageFactor)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Full Type List */}
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">All Types</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {typeChart.types.map((type) => (
                    <div
                      key={type.id}
                      className={`px-4 py-3 rounded-lg text-white font-medium capitalize text-center ${getTypeColor(
                        type.identifier
                      )}`}
                    >
                      {type.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
