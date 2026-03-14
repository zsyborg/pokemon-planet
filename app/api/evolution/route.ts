import { getPokemonEvolutionCollection, getEvolutionTriggersCollection, getPokemonSpeciesCollection, getPokemonSpeciesNamesCollection, getPokemonCollection, getPokemonTypesCollection, getTypesCollection, getTypeNamesCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const skip = parseInt(searchParams.get("skip") ?? "0");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const pokemonEvolutionCollection = await getPokemonEvolutionCollection();
  const evolutionTriggersCollection = await getEvolutionTriggersCollection();
  const pokemonSpeciesCollection = await getPokemonSpeciesCollection();
  const pokemonSpeciesNamesCollection = await getPokemonSpeciesNamesCollection();
  const pokemonCollection = await getPokemonCollection();
  const pokemonTypesCollection = await getPokemonTypesCollection();
  const typesCollection = await getTypesCollection();
  const typeNamesCollection = await getTypeNamesCollection();

  // Get all evolution triggers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const triggersRaw = await evolutionTriggersCollection.find({}).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const triggerMap = new Map<number, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  triggersRaw.forEach((t: any) => triggerMap.set(Number(t.id), String(t.identifier)));

  // Get all species names (English - local_language_id: 9)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speciesNamesRaw = await pokemonSpeciesNamesCollection
    .find({ local_language_id: 9 })
    .toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speciesNameMap = new Map<number, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  speciesNamesRaw.forEach((s: any) => speciesNameMap.set(Number(s.species_id), s.name));

  // Get all species
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allSpeciesRaw = await pokemonSpeciesCollection.find({}).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speciesMap = new Map<number, Record<string, any>>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allSpeciesRaw.forEach((s: any) => speciesMap.set(Number(s.id), s));

  // Get all Pokemon
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allPokemonRaw = await pokemonCollection.find({}).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pokemonMap = new Map<number, Record<string, any>>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allPokemonRaw.forEach((p: any) => pokemonMap.set(Number(p.id), p));

  // Get all type names
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typeNamesRaw = await typeNamesCollection.find({ local_language_id: 9 }).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typeNameMap = new Map<number, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeNamesRaw.forEach((t: any) => typeNameMap.set(Number(t.type_id), t.name));

  // Get all types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typesRaw = await typesCollection.find({}).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typeIdentifierMap = new Map<number, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typesRaw.forEach((t: any) => typeIdentifierMap.set(Number(t.id), String(t.identifier)));

  // Get all Pokemon evolutions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const evolutionsRaw = await pokemonEvolutionCollection.find({}).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const evolutionsBySpecies = new Map<number, any[]>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evolutionsRaw.forEach((e: any) => {
    const existing = evolutionsBySpecies.get(Number(e.evolved_species_id)) || [];
    existing.push(e);
    evolutionsBySpecies.set(Number(e.evolved_species_id), existing);
  });

  // Get all Pokemon types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allTypesRaw = await pokemonTypesCollection.find({}).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typesByPokemon = new Map<number, { type_id: number; slot: number }[]>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allTypesRaw.forEach((pt: any) => {
    const existing = typesByPokemon.get(Number(pt.pokemon_id)) || [];
    existing.push({ type_id: Number(pt.type_id), slot: Number(pt.slot) });
    typesByPokemon.set(Number(pt.pokemon_id), existing);
  });

  // Build evolution chains
  // Group species by evolution_chain_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chainsById = new Map<number, any[]>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allSpeciesRaw.forEach((s: any) => {
    const chainId = Number(s.evolution_chain_id);
    if (chainId > 0) {
      const existing = chainsById.get(chainId) || [];
      existing.push(s);
      chainsById.set(chainId, existing);
    }
  });

  // Build result
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const evolutionData: any[] = [];

  chainsById.forEach((speciesList, chainId) => {
    // Sort by order in chain (species without evolves_from_species_id is first)
    speciesList.sort((a, b) => {
      if (!a.evolves_from_species_id) return -1;
      if (!b.evolves_from_species_id) return 1;
      return 0;
    });

    // Build chain array
    const chain = speciesList.map((species) => {
      const speciesId = Number(species.id);
      const name = speciesNameMap.get(speciesId) || species.identifier;
      
      // Get first Pokemon for this species
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let pokemonData: any = null;
      for (const [pokemonId, pokemon] of pokemonMap) {
        if (Number(pokemon.species_id) === speciesId) {
          pokemonData = { id: pokemonId, ...pokemon };
          break;
        }
      }

      // Get types
      const pokemonTypes = typesByPokemon.get(pokemonData?.id) || [];
      const types = pokemonTypes
        .sort((a, b) => a.slot - b.slot)
        .map((pt) => ({
          id: pt.type_id,
          name: typeNameMap.get(pt.type_id) || `type-${pt.type_id}`,
          identifier: typeIdentifierMap.get(pt.type_id) || `type-${pt.type_id}`,
        }));

      // Get evolutions from this species
      const evolutions = evolutionsBySpecies.get(speciesId) || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const evolutionDetails = evolutions.map((e: any) => ({
        id: Number(e.id),
        evolved_species_id: Number(e.evolved_species_id),
        trigger: triggerMap.get(Number(e.evolution_trigger_id)) || "unknown",
        minimum_level: e.minimum_level ? Number(e.minimum_level) : null,
        held_item_id: e.held_item_id ? Number(e.held_item_id) : null,
        time_of_day: e.time_of_day || null,
        minimum_happiness: e.minimum_happiness ? Number(e.minimum_happiness) : null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }));

      // Get pre-evolution
      const evolvesFrom = species.evolves_from_species_id 
        ? {
            species_id: Number(species.evolves_from_species_id),
            name: speciesNameMap.get(Number(species.evolves_from_species_id)) || `species-${species.evolves_from_species_id}`,
          }
        : null;

      return {
        species_id: speciesId,
        name,
        identifier: species.identifier,
        pokemon_id: pokemonData?.id || null,
        sprite: pokemonData?.id 
          ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png`
          : null,
        types,
        evolves_from: evolvesFrom,
        evolution_details: evolutionDetails,
      };
    });

    evolutionData.push({
      chain_id: chainId,
      chain,
    });
  });

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredData = evolutionData.filter((chain: any) => 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chain.chain.some((pokemon: any) => 
        pokemon.name.toLowerCase().includes(searchLower) ||
        pokemon.identifier.toLowerCase().includes(searchLower)
      )
    );
    evolutionData.length = 0;
    evolutionData.push(...filteredData);
  }

  // Sort by chain_id
  evolutionData.sort((a, b) => a.chain_id - b.chain_id);

  const total = evolutionData.length;
  const paginatedData = evolutionData.slice(skip, skip + limit);

  return NextResponse.json({
    evolutions: paginatedData,
    total,
    skip,
    limit,
  });
}
