import { getPokemonCollection, getAbilitiesCollection, getPokemonAbilitiesCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const pokemonCollection = await getPokemonCollection();
    const abilitiesCollection = await getAbilitiesCollection();
    const pokemonAbilitiesCollection = await getPokemonAbilitiesCollection();

    const pokemon = await pokemonCollection.findOne({ id });

    if (!pokemon) {
      return NextResponse.json({ error: "Pokemon not found" }, { status: 404 });
    }

    // Fetch pokemon_abilities
    const pokemonAbilities = await pokemonAbilitiesCollection.find({ pokemon_id: id }).toArray();

    
    return NextResponse.json({
      ...pokemon,
      pokemonAbilities,
      
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}