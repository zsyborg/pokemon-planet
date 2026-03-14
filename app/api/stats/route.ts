import { getPokemonStatsCollection, getStatNamesCollection, getPokemonSpeciesNamesCollection, getPokemonCollection, getPokemonTypesCollection, getTypesCollection, getTypeNamesCollection, getPokemonAbilitiesCollection, getAbilityNamesCollection, getPokemonSpeciesCollection, getEvolutionChainsCollection, getPokemonEvolutionCollection, getEvolutionTriggersCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface PokemonStat {
  pokemon_id: number;
  stat_id: number;
  base_stat: number;
  effort: number;
}

interface StatName {
  stat_id: number;
  local_language_id: number;
  name: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const skip = parseInt(searchParams.get("skip") ?? "0");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const sortBy = searchParams.get("sortBy") ?? "id";
  const sortOrder = searchParams.get("sortOrder") ?? "asc";

  const pokemonStatsCollection = await getPokemonStatsCollection();
  const statNamesCollection = await getStatNamesCollection();
  const pokemonSpeciesNamesCollection = await getPokemonSpeciesNamesCollection();
  const pokemonCollection = await getPokemonCollection();
  const pokemonTypesCollection = await getPokemonTypesCollection();
  const typesCollection = await getTypesCollection();
  const typeNamesCollection = await getTypeNamesCollection();
  const pokemonAbilitiesCollection = await getPokemonAbilitiesCollection();
  const abilityNamesCollection = await getAbilityNamesCollection();
  const pokemonSpeciesCollection = await getPokemonSpeciesCollection();
  const evolutionChainsCollection = await getEvolutionChainsCollection();
  const pokemonEvolutionCollection = await getPokemonEvolutionCollection();
  const evolutionTriggersCollection = await getEvolutionTriggersCollection();

  // Get all stat names (English - local_language_id: 9)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const statNamesRaw = await statNamesCollection
    .find({ local_language_id: 9 })
    .toArray();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const statNameMap = new Map<number, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  statNamesRaw.forEach((s: any) => statNameMap.set(Number(s.stat_id), s.name));

  // Get all type names (English - local_language_id: 9)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typeNamesRaw = await typeNamesCollection
    .find({ local_language_id: 9 })
    .toArray();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typeNameMap = new Map<number, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typeIdentifierMap = new Map<number, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeNamesRaw.forEach((t: any) => {
    typeNameMap.set(Number(t.type_id), t.name);
  });

  const types = await typesCollection.find({}).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  types.forEach((t: any) => {
    typeIdentifierMap.set(Number(t.id), String(t.identifier));
  });

  // Get all ability names (English - local_language_id: 9)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const abilityNamesRaw = await abilityNamesCollection
    .find({ local_language_id: 9 })
    .toArray();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const abilityNameMap = new Map<number, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abilityNamesRaw.forEach((a: any) => abilityNameMap.set(Number(a.ability_id), a.name));

  // Get all Pokemon species names (English - local_language_id: 9)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speciesNamesRaw = await pokemonSpeciesNamesCollection
    .find({ local_language_id: 9 })
    .toArray();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speciesNameMap = new Map<number, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  speciesNamesRaw.forEach((s: any) => speciesNameMap.set(Number(s.species_id), s.name));

  // Get all Pokemon species
  const allSpecies = await pokemonSpeciesCollection.find({}).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speciesMap = new Map<number, Record<string, any>>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allSpecies.forEach((s: any) => speciesMap.set(Number(s.id), s));

  // Get all Pokemon
  const allPokemon = await pokemonCollection.find({}).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pokemonMap = new Map<number, Record<string, any>>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allPokemon.forEach((p: any) => pokemonMap.set(Number(p.id), p));

  // Get all Pokemon stats
  const allPokemonStats = await pokemonStatsCollection.find({}).toArray();
  
  // Group stats by pokemon_id
  const statsByPokemon = new Map<number, PokemonStat[]>();
  allPokemonStats.forEach((stat) => {
    const existing = statsByPokemon.get(stat.pokemon_id as number) || [];
    existing.push({
      pokemon_id: stat.pokemon_id as number,
      stat_id: stat.stat_id as number,
      base_stat: stat.base_stat as number,
      effort: stat.effort as number,
    });
    statsByPokemon.set(stat.pokemon_id as number, existing);
  });

  // Get all Pokemon types
  const allPokemonTypes = await pokemonTypesCollection.find({}).toArray();
  const typesByPokemon = new Map<number, { type_id: number; slot: number }[]>();
  allPokemonTypes.forEach((pt) => {
    const existing = typesByPokemon.get(pt.pokemon_id as number) || [];
    existing.push({ type_id: pt.type_id as number, slot: pt.slot as number });
    typesByPokemon.set(pt.pokemon_id as number, existing);
  });

  // Get all Pokemon abilities
  const allPokemonAbilities = await pokemonAbilitiesCollection.find({}).toArray();
  const abilitiesByPokemon = new Map<number, { ability_id: number; is_hidden: boolean; slot: number }[]>();
  allPokemonAbilities.forEach((pa) => {
    const existing = abilitiesByPokemon.get(pa.pokemon_id as number) || [];
    existing.push({
      ability_id: pa.ability_id as number,
      is_hidden: pa.is_hidden as boolean,
      slot: pa.slot as number,
    });
    abilitiesByPokemon.set(pa.pokemon_id as number, existing);
  });

  // Get all evolution triggers
  const evolutionTriggers = await evolutionTriggersCollection.find({}).toArray();
  const triggerMap = new Map<number, string>();
  evolutionTriggers.forEach((t) => triggerMap.set(t.id as number, t.identifier as string));

  // Get all Pokemon evolutions
  const allEvolutions = await pokemonEvolutionCollection.find({}).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const evolutionsBySpecies = new Map<number, any[]>();
  allEvolutions.forEach((e) => {
    const existing = evolutionsBySpecies.get(Number(e.evolved_species_id)) || [];
    existing.push(e);
    evolutionsBySpecies.set(Number(e.evolved_species_id), existing);
  });

  // Build Pokemon stats data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pokemonStatsData: any[] = [];
  
  // Process first 1010 Pokemon (Gen 1-5)
  for (let pokemonId = 1; pokemonId <= 1010; pokemonId++) {
    const pokemon = pokemonMap.get(pokemonId);
    const species = speciesMap.get(pokemonId);
    const stats = statsByPokemon.get(pokemonId) || [];
    const pokemonTypes = typesByPokemon.get(pokemonId) || [];
    const pokemonAbilities = abilitiesByPokemon.get(pokemonId) || [];
    const evolutions = evolutionsBySpecies.get(pokemonId) || [];

    if (!pokemon && stats.length === 0) continue;

    // Build stats object
    const statsObj: Record<string, number> = {};
    let totalStats = 0;
    stats.forEach((stat) => {
      const statName = statNameMap.get(stat.stat_id) || `stat-${stat.stat_id}`;
      statsObj[statName] = stat.base_stat;
      if (stat.stat_id <= 6) { // Only count base stats 1-6
        totalStats += stat.base_stat;
      }
    });

    // Build types array
    const typesArray = pokemonTypes
      .sort((a, b) => a.slot - b.slot)
      .map((pt) => ({
        id: pt.type_id,
        name: typeNameMap.get(pt.type_id) || `type-${pt.type_id}`,
        identifier: typeIdentifierMap.get(pt.type_id) || `type-${pt.type_id}`,
      }));

    // Build abilities array
    const abilitiesArray = pokemonAbilities
      .sort((a, b) => a.slot - b.slot)
      .map((pa) => ({
        id: pa.ability_id,
        name: abilityNameMap.get(pa.ability_id) || `ability-${pa.ability_id}`,
        is_hidden: pa.is_hidden,
        slot: pa.slot,
      }));

    // Build evolutions
    const evolutionsArray = evolutions.map((e) => ({
      id: e.id,
      evolved_species_id: e.evolved_species_id,
      evolution_trigger_id: e.evolution_trigger_id,
      trigger_name: triggerMap.get(e.evolution_trigger_id) || "unknown",
      minimum_level: e.minimum_level || null,
      held_item_id: e.held_item_id || null,
      time_of_day: e.time_of_day || null,
      minimum_happiness: e.minimum_happiness || null,
    }));

    const name = speciesNameMap.get(pokemonId) || `pokemon-${pokemonId}`;

    pokemonStatsData.push({
      id: pokemonId,
      name,
      identifier: pokemon?.identifier || `pokemon-${pokemonId}`,
      height: pokemon?.height || 0,
      weight: pokemon?.weight || 0,
      base_experience: pokemon?.base_experience || 0,
      stats: statsObj,
      total_stats: totalStats,
      types: typesArray,
      abilities: abilitiesArray,
      evolutions: evolutionsArray,
      genus: species?.genus || null,
      generation_id: species?.generation_id || null,
    });
  }

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    pokemonStatsData = pokemonStatsData.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.identifier.toLowerCase().includes(searchLower)
    );
  }

  // Sort
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pokemonStatsData.sort((a, b) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let aVal: any, bVal: any;
    
    if (sortBy === "id") {
      aVal = a.id;
      bVal = b.id;
    } else if (sortBy === "name") {
      aVal = a.name;
      bVal = b.name;
    } else if (sortBy === "total_stats") {
      aVal = a.total_stats;
      bVal = b.total_stats;
    } else {
      aVal = a.stats[sortBy] || 0;
      bVal = b.stats[sortBy] || 0;
    }
    
    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const total = pokemonStatsData.length;
  pokemonStatsData = pokemonStatsData.slice(skip, skip + limit);

  return NextResponse.json({
    pokemon: pokemonStatsData,
    total,
    skip,
    limit,
  });
}
