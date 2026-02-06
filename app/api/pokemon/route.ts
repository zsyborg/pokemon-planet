import { getPokemonCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const pokemonCollection = await getPokemonCollection();

  let filter = {};
  if (query) {
    filter = {
      identifier: { $regex: query, $options: "i" }
    };
  }

  const pokemon = await pokemonCollection
    .find(filter)
    .sort({ id: 1 })
    .limit(20)
    .toArray();

  return NextResponse.json(pokemon);
}
