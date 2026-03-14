import { getMovesCollection, getMoveNamesCollection, getMoveFlavorTextCollection, getMoveMetaCollection, getMoveDamageClassesCollection, getMoveDamageClassProseCollection, getPokemonMovesCollection, getPokemonSpeciesCollection, getPokemonSpeciesNamesCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";

interface Move {
  id: number;
  identifier: string;
  type_id: number;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  damage_class_id: number | null;
  name?: string;
  flavor_text?: string;
  damage_class?: string;
  category?: string;
  pokemon?: {
    id: number;
    name: string;
    sprite: string;
  }[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const skip = parseInt(searchParams.get("skip") ?? "0");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const movesCollection = await getMovesCollection();
  const moveNamesCollection = await getMoveNamesCollection();
  const moveFlavorTextCollection = await getMoveFlavorTextCollection();
  const moveMetaCollection = await getMoveMetaCollection();
  const moveDamageClassesCollection = await getMoveDamageClassesCollection();
  const moveDamageClassProseCollection = await getMoveDamageClassProseCollection();
  const pokemonMovesCollection = await getPokemonMovesCollection();
  const pokemonSpeciesCollection = await getPokemonSpeciesCollection();
  const pokemonSpeciesNamesCollection = await getPokemonSpeciesNamesCollection();

  // Get all move names (English - local_language_id: 9)
  const moveNames = await moveNamesCollection
    .find({ local_language_id: 9 })
    .toArray();
  
  // Create name map
  const nameMap = new Map<number, string>();
  moveNames.forEach((n) => nameMap.set(n.move_id, n.name));

  // Get all flavor text (English - language_id: 9, latest version group 18)
  const moveFlavorTexts = await moveFlavorTextCollection
    .find({ version_group_id: 18, language_id: 9 })
    .toArray();
  
  // Create flavor text map (use first available for each move)
  const flavorMap = new Map<number, string>();
  moveFlavorTexts.forEach((f) => {
    if (!flavorMap.has(f.move_id)) {
      flavorMap.set(f.move_id, f.flavor_text);
    }
  });

  // Get all move meta data
  const moveMetas = await moveMetaCollection.find({}).toArray();
  
  // Create meta map
  const metaMap = new Map<number, Record<string, unknown>>();
  moveMetas.forEach((m) => metaMap.set(m.move_id as number, m as Record<string, unknown>));

  // Get all damage classes
  const damageClasses = await moveDamageClassesCollection.find({}).toArray();
  
  // Create damage class map
  const damageClassMap = new Map<number, number>();
  damageClasses.forEach((d) => damageClassMap.set(d.id, d.id));

  // Get all damage class prose (English - local_language_id: 9)
  const damageClassProse = await moveDamageClassProseCollection
    .find({ local_language_id: 9 })
    .toArray();
  
  // Create damage class name map
  const damageClassNameMap = new Map<number, string>();
  damageClassProse.forEach((d) => damageClassNameMap.set(d.move_damage_class_id, d.name));

  // Get all Pokemon species names (English - local_language_id: 9)
  const pokemonSpeciesNames = await pokemonSpeciesNamesCollection
    .find({ local_language_id: 9 })
    .toArray();
  
  // Create species name map (species_id -> name)
  const speciesNameMap = new Map<number, string>();
  pokemonSpeciesNames.forEach((s) => speciesNameMap.set(s.species_id, s.name));

  // Get all Pokemon to get species_id mapping
  const allPokemon = await pokemonSpeciesCollection.find({}).toArray();
  
  // Create Pokemon ID to species ID map and species ID to name map
  const pokemonToSpeciesMap = new Map<number, number>();
  allPokemon.forEach((p) => {
    pokemonToSpeciesMap.set(p.id, p.id);
  });

  // Get all Pokemon moves (latest version group 18)
  const allPokemonMoves = await pokemonMovesCollection
    .find({ version_group_id: 18 })
    .toArray();
  
  // Group Pokemon moves by move_id
  const movesToPokemonMap = new Map<number, number[]>();
  allPokemonMoves.forEach((pm) => {
    const existing = movesToPokemonMap.get(pm.move_id) || [];
    existing.push(pm.pokemon_id);
    movesToPokemonMap.set(pm.move_id, existing);
  });

  // Get all moves from MongoDB
  const moves = await movesCollection
    .find({})
    .sort({ id: 1 })
    .toArray();

  // Build result moves with joined data
  let result: Move[] = moves.map((move) => {
    const meta = metaMap.get(move.id);
    const damageClassId = move.damage_class_id;
    
    // Get Pokemon that can learn this move (limit to 10)
    const pokemonIds = movesToPokemonMap.get(move.id as number) || [];
    const limitedPokemonIds = pokemonIds.slice(0, 10);
    const pokemonList = limitedPokemonIds.map((pokemonId) => {
      const speciesName = speciesNameMap.get(pokemonId) || `pokemon-${pokemonId}`;
      return {
        id: pokemonId,
        name: speciesName,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
      };
    });
    
    return {
      id: move.id as number,
      identifier: move.identifier as string,
      type_id: move.type_id as number,
      power: move.power as number | null,
      accuracy: move.accuracy as number | null,
      pp: move.pp as number | null,
      priority: move.priority as number,
      damage_class_id: damageClassId as number | null,
      name: nameMap.get(move.id as number) || (move.identifier as string),
      flavor_text: flavorMap.get(move.id as number) || "",
      damage_class: damageClassId ? damageClassNameMap.get(damageClassId) || "unknown" : "status",
      pokemon: pokemonList,
    };
  });

  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase();
    result = result.filter(
      (move) =>
        move.name?.toLowerCase().includes(searchLower) ||
        move.identifier.toLowerCase().includes(searchLower)
    );
  }

  // Get total count before pagination
  const total = result.length;

  // Apply pagination
  result = result.slice(skip, skip + limit);

  return NextResponse.json({
    moves: result,
    total,
    skip,
    limit,
  });
}
