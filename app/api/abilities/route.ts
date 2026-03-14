import { getAbilitiesCollection, getAbilityNamesCollection, getAbilityFlavorTextCollection, getAbilityProseCollection, getPokemonAbilitiesCollection, getPokemonSpeciesNamesCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";

interface Ability {
  id: number;
  identifier: string;
  is_main_series: boolean;
  name?: string;
  flavor_text?: string;
  short_description?: string;
  description?: string;
  pokemon?: {
    id: number;
    name: string;
    sprite: string;
    is_hidden: boolean;
    slot: number;
  }[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const skip = parseInt(searchParams.get("skip") ?? "0");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const abilitiesCollection = await getAbilitiesCollection();
  const abilityNamesCollection = await getAbilityNamesCollection();
  const abilityFlavorTextCollection = await getAbilityFlavorTextCollection();
  const abilityProseCollection = await getAbilityProseCollection();
  const pokemonAbilitiesCollection = await getPokemonAbilitiesCollection();
  const pokemonSpeciesNamesCollection = await getPokemonSpeciesNamesCollection();

  // Get all ability names (English - local_language_id: 9)
  const abilityNames = await abilityNamesCollection
    .find({ local_language_id: 9 })
    .toArray();
  
  // Create name map
  const nameMap = new Map<number, string>();
  abilityNames.forEach((n) => nameMap.set(n.ability_id, n.name));

  // Get all flavor text (English - language_id: 9, latest version group 18)
  const abilityFlavorTexts = await abilityFlavorTextCollection
    .find({ version_group_id: 18, language_id: 9 })
    .toArray();
  
  // Create flavor text map (use first available for each ability)
  const flavorMap = new Map<number, string>();
  abilityFlavorTexts.forEach((f) => {
    if (!flavorMap.has(f.ability_id)) {
      flavorMap.set(f.ability_id, f.flavor_text);
    }
  });

  // Get all ability prose (English - local_language_id: 9)
  const abilityProse = await abilityProseCollection
    .find({ local_language_id: 9 })
    .toArray();
  
  // Create short description map
  const shortDescMap = new Map<number, string>();
  const descMap = new Map<number, string>();
  abilityProse.forEach((p) => {
    shortDescMap.set(p.ability_id, p.short_description || "");
    descMap.set(p.ability_id, p.description || "");
  });

  // Get all Pokemon species names (English - local_language_id: 9)
  const pokemonSpeciesNames = await pokemonSpeciesNamesCollection
    .find({ local_language_id: 9 })
    .toArray();
  
  // Create species name map (species_id -> name)
  const speciesNameMap = new Map<number, string>();
  pokemonSpeciesNames.forEach((s) => speciesNameMap.set(s.species_id, s.name));

  // Get all Pokemon abilities
  const allPokemonAbilities = await pokemonAbilitiesCollection
    .find({})
    .toArray();
  
  // Group Pokemon abilities by ability_id
  const abilitiesToPokemonMap = new Map<number, Array<{ pokemon_id: number; is_hidden: boolean; slot: number }>>();
  allPokemonAbilities.forEach((pa) => {
    const existing = abilitiesToPokemonMap.get(pa.ability_id) || [];
    existing.push({
      pokemon_id: pa.pokemon_id,
      is_hidden: pa.is_hidden,
      slot: pa.slot
    });
    abilitiesToPokemonMap.set(pa.ability_id, existing);
  });

  // Get all abilities from MongoDB
  const abilities = await abilitiesCollection
    .find({})
    .sort({ id: 1 })
    .toArray();

  // Build result abilities with joined data
  let result: Ability[] = abilities.map((ability) => {
    // Get Pokemon that have this ability (limit to 10)
    const pokemonData = abilitiesToPokemonMap.get(ability.id as number) || [];
    const limitedPokemonData = pokemonData.slice(0, 10);
    const pokemonList = limitedPokemonData.map((p) => {
      const speciesName = speciesNameMap.get(p.pokemon_id) || `pokemon-${p.pokemon_id}`;
      return {
        id: p.pokemon_id,
        name: speciesName,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.pokemon_id}.png`,
        is_hidden: p.is_hidden,
        slot: p.slot,
      };
    });
    
    return {
      id: ability.id as number,
      identifier: ability.identifier as string,
      is_main_series: ability.is_main_series as boolean,
      name: nameMap.get(ability.id as number) || (ability.identifier as string),
      flavor_text: flavorMap.get(ability.id as number) || "",
      short_description: shortDescMap.get(ability.id as number) || "",
      description: descMap.get(ability.id as number) || "",
      pokemon: pokemonList,
    };
  });

  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase();
    result = result.filter(
      (ability) =>
        ability.name?.toLowerCase().includes(searchLower) ||
        ability.identifier.toLowerCase().includes(searchLower)
    );
  }

  // Get total count before pagination
  const total = result.length;

  // Apply pagination
  result = result.slice(skip, skip + limit);

  return NextResponse.json({
    abilities: result,
    total,
    skip,
    limit,
  });
}
