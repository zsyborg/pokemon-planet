import { NextResponse } from "next/server";
import { getPokemonCollection, getMovesCollection, getPokemonMovesCollection, getPokemonTypesCollection, getTypesCollection, getPokemonStatsCollection, getStatsCollection } from "@/lib/mongodb";

interface PokemonData {
  id: number;
  identifier: string;
  species_id?: number;
  height?: number;
  weight?: number;
  types?: { id: number; identifier: string }[];
  stats?: { stat_id: number; base_stat: number; name: string }[];
  moves?: any[];
  [key: string]: any;
}

// Get Pokemon with full battle data
async function getPokemonBattleData(pokemonId: number): Promise<PokemonData | null> {
  const pokemonCollection = await getPokemonCollection();
  const pokemon = await pokemonCollection.findOne({ id: pokemonId });
  
  if (!pokemon) return null;

  // Fetch types
  const pokemonTypesCollection = await getPokemonTypesCollection();
  const typesCollection = await getTypesCollection();
  const pokemonTypes = await pokemonTypesCollection.find({ pokemon_id: pokemonId }).toArray();
  const typeIds = pokemonTypes.map(pt => pt.type_id);
  const types = await typesCollection.find({ id: { $in: typeIds } }).toArray();
  const typesWithNames = types.map(t => ({ id: t.id, identifier: t.identifier }));

  // Fetch stats
  const pokemonStatsCollection = await getPokemonStatsCollection();
  const statsCollection = await getStatsCollection();
  const pokemonStats = await pokemonStatsCollection.find({ pokemon_id: pokemonId }).toArray();
  const statIds = pokemonStats.map(ps => ps.stat_id);
  const stats = await statsCollection.find({ id: { $in: statIds } }).toArray();
  const statsWithNames = pokemonStats.map(ps => {
    const stat = stats.find(s => s.id === ps.stat_id);
    return { stat_id: ps.stat_id, base_stat: ps.base_stat, name: stat?.identifier || 'unknown' };
  });

  // Fetch moves with type info
  const pokemonMovesCollection = await getPokemonMovesCollection();
  const movesCollection = await getMovesCollection();
  const pokemonMoves = await pokemonMovesCollection.find({ pokemon_id: pokemonId }).toArray();
  const moveIds = [...new Set(pokemonMoves.map(pm => pm.move_id).filter(Boolean))];
  const moves = await movesCollection.find({ id: { $in: moveIds } }).toArray();
  
  // Get type IDs for moves
  const movesWithTypes = moves.map(m => {
    const type = types.find(t => t.id === m.type_id);
    return {
      ...m,
      type_identifier: type?.identifier || 'normal',
    };
  });

  return {
    ...pokemon,
    types: typesWithNames,
    stats: statsWithNames,
    moves: movesWithTypes,
  } as unknown as PokemonData;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { player1PokemonId, player2PokemonId } = body;

    if (!player1PokemonId || !player2PokemonId) {
      return NextResponse.json(
        { error: "Missing required pokemon IDs" },
        { status: 400 }
      );
    }

    // Get both Pokemon with full battle data
    const player1Data = await getPokemonBattleData(player1PokemonId);
    const player2Data = await getPokemonBattleData(player2PokemonId);

    if (!player1Data || !player2Data) {
      return NextResponse.json(
        { error: "One or both Pokemon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      player1: player1Data,
      player2: player2Data,
    });
  } catch (error) {
    console.error("Battle API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get Pokemon list for selection
export async function GET() {
  try {
    const pokemonCollection = await getPokemonCollection();
    const pokemon = await pokemonCollection.find({}).limit(151).toArray(); // First generation for simplicity
    
    return NextResponse.json(pokemon);
  } catch (error) {
    console.error("Error fetching Pokemon:", error);
    return NextResponse.json(
      { error: "Failed to fetch Pokemon" },
      { status: 500 }
    );
  }
}
