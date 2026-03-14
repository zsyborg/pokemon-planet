import { getPokemonCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const skip = parseInt(searchParams.get("skip") ?? "0");
  const limit = parseInt(searchParams.get("limit") ?? "20");

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
    .skip(skip)
    .limit(limit)
    .toArray();

  return NextResponse.json(pokemon);
}
