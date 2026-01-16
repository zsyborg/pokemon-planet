import Image from "next/image";
import { prisma } from "@/lib/prisma";
import Link from "next/link";



export default async function Home() {
  
   const pokemon = await prisma.pokemon.findMany({
    take: 20,
    orderBy: { id: "asc" },
  });





  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black">
        
        <div className="grid grid-cols-6">

          {pokemon.map((p: any) => (
            <Link key={p.id} href={`/pokemon/${p.id}`}> 
            <div key={p.id} className="border border-amber-300 p-3">
              <Image
                className=""
                src={`https://sochtechnologies.com/pokemon/sprites/sprites/pokemon/${p.id}.png`}
                alt={p.identifier}
                width={100}
                height={20}
                priority
                />
              <h2 className="font-bold capitalize">{p.identifier}</h2>
              <p>Height: {p.height}</p>
              <p>Weight: {p.weight}</p>
            </div>
          </Link>
          ))}
          </div>
      </main>
    </div>
  );
}
