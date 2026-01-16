import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function PokemonModal({
  params,
}: {
  params: { id: string };
}) {
  const pokemon = await prisma.pokemon.findUnique({
    where: { id: params.id },
    include: {
      pokemon_moves: {
        include: { move: true },
      },
    },
  });

  if (!pokemon) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[500px] max-h-[80vh] overflow-y-auto relative">
        <Link
          href="/"
          className="absolute top-2 right-3 text-xl font-bold"
        >
          ×
        </Link>

        <Image
          src={`/sprites/sprites/pokemon/${pokemon.id}.png`}
          alt={pokemon.identifier ?? ""}
          width={120}
          height={120}
        />

        <h1 className="capitalize text-xl font-bold">
          {pokemon.identifier}
        </h1>

        <h2 className="mt-4 font-semibold">Moves</h2>
        <ul className="text-sm list-disc ml-4">
          {pokemon.pokemon_moves.map((pm) =>
            pm.move ? (
              <li key={pm.id}>{pm.move.identifier}</li>
            ) : null
          )}
        </ul>
      </div>
    </div>
  );
}
