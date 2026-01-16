import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const pokemon = await prisma.pokemon.findMany({
    take: 20,
    orderBy: {
      id: "asc",
    },
  });

  return NextResponse.json(pokemon);
}
