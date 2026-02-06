import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function PokemonPage({
  params,
}: {
  params: { id: string };
}) {
  console.log("PARAMS:", params); // ← temporary debug

  const pokemon = await prisma.pokemon.findUnique({
    where: { id: params.id },
    include: {
      pokemon_moves: {
        include: {
          move: true,
        },
      },
    },
  });

  if (!pokemon) {
    return <div>Not found</div>;
  }

  return (
    <main className="p-8">
      <Image
        src={`/sprites/sprites/pokemon/${pokemon.id}.png`}
        alt={pokemon.identifier ?? ""}
        width={150}
        height={150}
      />

      <h1 className="text-2xl font-bold capitalize">
        {pokemon.identifier}
      </h1>

      <h2 className="mt-6 font-semibold">Moves</h2>
      <ul className="list-disc ml-6">
        {pokemon.pokemon_moves.map((pm) =>
          pm.move ? (
            <li key={pm.id}>{pm.move.identifier}</li>
          ) : null
        )}
      </ul>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="mt-4 font-semibold">Moves</h2>
            <ul className="text-sm list-disc ml-4">
              {pokemon.pokemon_moves.map((pm) =>
                pm.move ? (
                  <li key={pm.id}>{pm.move.identifier}</li>
                ) : null
              )}
            </ul>
          </div>
          <div>
              <h2 className="mt-4 font-semibold">Details</h2>
              <p className="text-sm">
                <strong>Height:</strong> {pokemon.height}
              </p>
              <p className="text-sm">
                <strong>Weight:</strong> {pokemon.weight}
              </p>
            </div>
          </div>
            
    </main>
  );
}
