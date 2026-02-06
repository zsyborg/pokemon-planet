import { getPokemonCollection, getPokemonMovesCollection, getMovesCollection, getPokemonFormsCollection, getAbilitiesCollection, getPokemonAbilitiesCollection, getPokemonSpeciesCollection, getGenerationsCollection, getPokemonTypesCollection, getTypesCollection, getPokemonStatsCollection, getStatsCollection, getPokemonSpeciesFlavorTextCollection, getPokemonEvolutionCollection, getEvolutionChainsCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const pokemonCollection      = await getPokemonCollection();
    const pokemonMovesCollection = await getPokemonMovesCollection();
    const movesCollection        = await getMovesCollection();
    const pokemonFormsCollection = await getPokemonFormsCollection();
  
    // Pokemon Abilities Collections
    const abilitiesCollection = await getAbilitiesCollection();
    const pokemonAbilitiesCollection = await getPokemonAbilitiesCollection();

    const pokemon = await pokemonCollection.findOne({ id: id });

    if (!pokemon) {
      return NextResponse.json({ error: "Pokemon not found" }, { status: 404 });
    }

    // Fetch pokemon_moves
    const pokemonMoves = await pokemonMovesCollection.find({ pokemon_id: id, move_id: { $ne: null } }).toArray();

    // Get unique move_ids
    const moveIds = [...new Set(pokemonMoves.map(pm => pm.move_id).filter(Boolean))];

    // Fetch moves
    const moves = await movesCollection.find({ id: { $in: moveIds } }).toArray();

    // Fetch pokemon forms
    const forms = await pokemonFormsCollection.find({ pokemon_id: id }).toArray();


    
    // Fetch pokemon_abilities
    const pokemonAbilities = await pokemonAbilitiesCollection.find({ pokemon_id: id }).toArray();
    const abilitiesIds = [...new Set(pokemonAbilities.map(pa => pa.ability_id).filter(Boolean))];
    const abilities = await abilitiesCollection.find({ id: { $in: abilitiesIds } }).toArray();

    // Fetch species
    const pokemonSpeciesCollection = await getPokemonSpeciesCollection();
    const species = await pokemonSpeciesCollection.findOne({ id: pokemon.species_id });
    if (!species) {
      console.log('Species not found for pokemon', pokemon.id);
    }

    // Fetch generation
    const generationsCollection = await getGenerationsCollection();
    const generation = species ? await generationsCollection.findOne({ id: species.generation_id }) : null;

    // Fetch types
    const pokemonTypesCollection = await getPokemonTypesCollection();
    const typesCollection = await getTypesCollection();
    const pokemonTypes = await pokemonTypesCollection.find({ pokemon_id: id }).toArray();
    const typeIds = pokemonTypes.map(pt => pt.type_id);
    const types = await typesCollection.find({ id: { $in: typeIds } }).toArray();

    // Fetch stats
    const pokemonStatsCollection = await getPokemonStatsCollection();
    const statsCollection = await getStatsCollection();
    const pokemonStats = await pokemonStatsCollection.find({ pokemon_id: id }).toArray();
    const statIds = pokemonStats.map(ps => ps.stat_id);
    const stats = await statsCollection.find({ id: { $in: statIds } }).toArray();

    // Combine stats with values
    const statsWithNames = pokemonStats.map(ps => {
      const stat = stats.find(s => s.id === ps.stat_id);
      return { ...ps, name: stat ? stat.identifier : 'unknown' };
    });

    // Fetch flavor text
    const pokemonSpeciesFlavorTextCollection = await getPokemonSpeciesFlavorTextCollection();
    const flavorTexts = species ? await pokemonSpeciesFlavorTextCollection.find({ species_id: species.id, language_id: 9 }).toArray() : []; // English
    const flavorText = flavorTexts.length > 0 ? flavorTexts[0].flavor_text : 'No description available.';

    // Fetch evolves from
    let evolvesFrom = null;
    if (species?.evolves_from_species_id) {
      const evolvesFromSpecies = await pokemonSpeciesCollection.findOne({ id: species.evolves_from_species_id });
      if (evolvesFromSpecies) {
        const evolvesFromPokemon = await pokemonCollection.findOne({ species_id: evolvesFromSpecies.id });
        evolvesFrom = evolvesFromPokemon ? { ...evolvesFromPokemon, species: evolvesFromSpecies } : null;
      }
    }

    return NextResponse.json({
      ...pokemon,
      species,
      generation,
      types,
      stats: statsWithNames,
      flavorText,
      evolvesFrom,
      abilities,
      moves,
      forms,
      pokemonAbilities,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}