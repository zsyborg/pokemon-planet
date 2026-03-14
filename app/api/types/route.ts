import { getTypeEfficacyCollection, getTypeNamesCollection, getTypesCollection, getPokemonTypesCollection, getPokemonSpeciesNamesCollection, getPokemonCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";

interface Type {
  id: number;
  identifier: string;
  name: string;
}

interface TypeEfficacy {
  damage_type_id: number;
  target_type_id: number;
  damage_factor: number;
}

interface PokemonType {
  pokemon_id: number;
  type_id: number;
  slot: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pokemonId = searchParams.get("pokemonId");

  const typeEfficacyCollection = await getTypeEfficacyCollection();
  const typeNamesCollection = await getTypeNamesCollection();
  const typesCollection = await getTypesCollection();

  // Get all type names (English - local_language_id: 9)
  const typeNames = await typeNamesCollection
    .find({ local_language_id: 9 })
    .toArray();

  // Get all types
  const types = await typesCollection
    .find({})
    .toArray();

  // Create type map
  const typeMap = new Map<number, Type>();
  types.forEach((t) => {
    const name = typeNames.find((n) => n.type_id === t.id)?.name || t.identifier;
    typeMap.set(t.id as number, {
      id: t.id as number,
      identifier: t.identifier as string,
      name,
    });
  });

  // Get all type efficacy data
  const typeEfficacyDataRaw = await typeEfficacyCollection
    .find({})
    .toArray();

  const typeEfficacyData = typeEfficacyDataRaw.map(item => ({
    damage_type_id: Number(item.damage_type_id),
    target_type_id: Number(item.target_type_id),
    damage_factor: Number(item.damage_factor),
  }));

  // Build effectiveness matrix
  // damage_factor: 0 = no effect, 50 = not very effective, 100 = normal, 200 = super effective
  const effectivenessMatrix: Record<number, Record<number, number>> = {};
  
  typeEfficacyData.forEach((efficacy) => {
    const attackingType = efficacy.damage_type_id;
    const defendingType = efficacy.target_type_id;
    const damageFactor = efficacy.damage_factor;

    if (!effectivenessMatrix[attackingType]) {
      effectivenessMatrix[attackingType] = {};
    }
    effectivenessMatrix[attackingType][defendingType] = damageFactor;
  });

  // If pokemonId is provided, return type effectiveness for that Pokemon
  if (pokemonId) {
    const pokemonTypesCollection = await getPokemonTypesCollection();
    const pokemonSpeciesNamesCollection = await getPokemonSpeciesNamesCollection();
    const pokemonCollection = await getPokemonCollection();

    // Get Pokemon's types
    const pokemonTypes = await pokemonTypesCollection
      .find({ pokemon_id: parseInt(pokemonId) })
      .sort({ slot: 1 })
      .toArray();

    if (pokemonTypes.length === 0) {
      return NextResponse.json({ error: "Pokemon not found" }, { status: 404 });
    }

    const typeIds = pokemonTypes.map(pt => pt.type_id);
    const typeInfo = typeIds.map(id => typeMap.get(id)).filter(Boolean);

    // Calculate weaknesses and resistances
    const weaknesses: { type: Type; multiplier: number }[] = [];
    const resistances: { type: Type; multiplier: number }[] = [];
    const immunities: { type: Type; multiplier: number }[] = [];

    // For each defending type, calculate the combined effectiveness
    typeMap.forEach((defendingType, defendingTypeId) => {
      if (defendingTypeId > 18) return; // Skip unknown/shadow types

      let totalMultiplier = 1;
      typeIds.forEach(attackingTypeId => {
        const efficacy = effectivenessMatrix[attackingTypeId]?.[defendingTypeId];
        if (efficacy !== undefined) {
          totalMultiplier *= efficacy / 100;
        }
      });

      if (totalMultiplier === 0) {
        immunities.push({ type: defendingType, multiplier: 0 });
      } else if (totalMultiplier > 1) {
        weaknesses.push({ type: defendingType, multiplier: totalMultiplier });
      } else if (totalMultiplier < 1) {
        resistances.push({ type: defendingType, multiplier: totalMultiplier });
      }
    });

    // Sort by multiplier
    weaknesses.sort((a, b) => b.multiplier - a.multiplier);
    resistances.sort((a, b) => a.multiplier - b.multiplier);

    // Get Pokemon name
    const pokemon = await pokemonCollection.findOne({ id: parseInt(pokemonId) });
    const speciesNames = await pokemonSpeciesNamesCollection
      .find({ species_id: parseInt(pokemonId), local_language_id: 9 })
      .toArray();
    
    const pokemonName = speciesNames[0]?.name || pokemon?.name || `pokemon-${pokemonId}`;

    return NextResponse.json({
      pokemon: {
        id: parseInt(pokemonId),
        name: pokemonName,
        types: typeInfo,
      },
      weaknesses,
      resistances,
      immunities,
      effectivenessMatrix,
    });
  }

  // Return all types and effectiveness matrix
  const typeList = Array.from(typeMap.values())
    .filter(t => t.id <= 18) // Only main types
    .sort((a, b) => a.id - b.id);

  return NextResponse.json({
    types: typeList,
    effectivenessMatrix,
  });
}
