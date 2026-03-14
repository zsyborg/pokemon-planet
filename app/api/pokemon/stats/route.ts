import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

interface PokemonStats {
  pokemon_id: number;
  level: number;
  experience: number;
  abilities: { id: number; name: string }[];
  wins: number;
  losses: number;
}

// Get Pokemon stats (experience, level, abilities)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pokemonId = parseInt(searchParams.get("pokemonId") || "0");

  if (isNaN(pokemonId) || pokemonId === 0) {
    return NextResponse.json({ error: "Invalid Pokemon ID" }, { status: 400 });
  }

  try {
    const collection = await getCollection("pokemon", "pokemon_stats");
    const stats = await collection.findOne({ pokemon_id: pokemonId });

    const result: PokemonStats = stats ? {
      pokemon_id: stats.pokemon_id,
      level: stats.level || 1,
      experience: stats.experience || 0,
      abilities: stats.abilities || [],
      wins: stats.wins || 0,
      losses: stats.losses || 0,
    } : {
      pokemon_id: pokemonId,
      level: 1,
      experience: 0,
      abilities: [],
      wins: 0,
      losses: 0,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching Pokemon stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

// Update Pokemon stats after battle
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const pokemonId = parseInt(searchParams.get("pokemonId") || "0");

  if (isNaN(pokemonId) || pokemonId === 0) {
    return NextResponse.json({ error: "Invalid Pokemon ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { won, baseExperienceGain = 100 } = body;

    const collection = await getCollection("pokemon", "pokemon_stats");
    
    // Find existing stats
    const existingStats = await collection.findOne({ pokemon_id: pokemonId });
    
    // Get current values
    const currentLevel = existingStats?.level || 1;
    const currentExperience = existingStats?.experience || 0;
    const currentWins = existingStats?.wins || 0;
    const currentLosses = existingStats?.losses || 0;
    
    // Calculate new experience and level
    let newExperience = currentExperience + baseExperienceGain;
    let newLevel = currentLevel;
    
    // Simple level up formula - experience needed doubles each level
    const expNeeded = (level: number) => level * 100;
    
    while (newExperience >= expNeeded(newLevel) && newLevel < 100) {
      newExperience -= expNeeded(newLevel);
      newLevel++;
    }

    // Update stats
    await collection.updateOne(
      { pokemon_id: pokemonId },
      {
        $set: {
          level: newLevel,
          experience: newExperience,
          wins: won ? currentWins + 1 : currentWins,
          losses: won ? currentLosses : currentLosses + 1,
        },
      },
      { upsert: true }
    );

    const updatedStats = await collection.findOne({ pokemon_id: pokemonId });

    return NextResponse.json({
      success: true,
      message: won ? "Victory! Gained experience!" : "Defeat! Try again!",
      stats: {
        pokemon_id: pokemonId,
        level: newLevel,
        experience: newExperience,
        abilities: updatedStats?.abilities || [],
        wins: won ? currentWins + 1 : currentWins,
        losses: won ? currentLosses : currentLosses + 1,
      },
      leveledUp: newLevel > currentLevel,
    });
  } catch (error) {
    console.error("Error updating Pokemon stats:", error);
    return NextResponse.json({ error: "Failed to update stats" }, { status: 500 });
  }
}

// Add ability to Pokemon
export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const pokemonId = parseInt(searchParams.get("pokemonId") || "0");

  if (isNaN(pokemonId) || pokemonId === 0) {
    return NextResponse.json({ error: "Invalid Pokemon ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { abilityId, abilityName } = body;

    if (!abilityId || !abilityName) {
      return NextResponse.json({ error: "Missing ability info" }, { status: 400 });
    }

    const collection = await getCollection("pokemon", "pokemon_stats");
    
    // Add ability if not already present
    await collection.updateOne(
      { pokemon_id: pokemonId }, 
      { 
        $addToSet: { 
          abilities: { id: abilityId, name: abilityName } 
        },
        $setOnInsert: {
          level: 1,
          experience: 0,
          wins: 0,
          losses: 0,
        }
      },
      { upsert: true }
    );

    const updatedStats = await collection.findOne({ pokemon_id: pokemonId });

    return NextResponse.json({
      success: true,
      message: `Acquired ability: ${abilityName}!`,
      stats: {
        pokemon_id: pokemonId,
        level: updatedStats?.level || 1,
        experience: updatedStats?.experience || 0,
        abilities: updatedStats?.abilities || [],
        wins: updatedStats?.wins || 0,
        losses: updatedStats?.losses || 0,
      },
    });
  } catch (error) {
    console.error("Error adding ability:", error);
    return NextResponse.json({ error: "Failed to add ability" }, { status: 500 });
  }
}
