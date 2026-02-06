import { MongoClient, Db, Collection } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";

let client: MongoClient;
let db: Db;

export async function getCollection(database: string, collection: string): Promise<Collection> {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();

    console.log("Connected to MongoDB");
  }

  db = client.db(database);
  return db.collection(collection);
}

export async function getAuctionCollection(): Promise<Collection> {
  return getCollection("pokemon", "auction");
}

export async function getPokemonCollection(): Promise<Collection> {
  return getCollection("pokemon", "pokemon");
}

export async function getMovesCollection(): Promise<Collection> {
  return getCollection("pokemon", "moves");
}

export async function getAbilitiesCollection(): Promise<Collection> {
  return getCollection("pokemon", "abilities");
}

export async function getPokemonAbilitiesCollection(): Promise<Collection> {
  return getCollection("pokemon", "pokemon_abilities");
}

export async function getPokemonFormsCollection(): Promise<Collection> {
  return getCollection("pokemon", "pokemon_forms");
}

export async function getPokemonMovesCollection(): Promise<Collection> {
  return getCollection("pokemon", "pokemon_moves");
}

export async function getPokemonSpeciesCollection(): Promise<Collection> {
  return getCollection("pokemon", "pokemon_species");
}

export async function getPokemonEvolutionCollection(): Promise<Collection> {
  return getCollection("pokemon", "pokemon_evolution");
}

export async function getEvolutionChainsCollection(): Promise<Collection> {
  return getCollection("pokemon", "evolution_chains");
}

export async function getGenerationsCollection(): Promise<Collection> {
  return getCollection("pokemon", "generations");
}

export async function getPokemonTypesCollection(): Promise<Collection> {
  return getCollection("pokemon", "pokemon_types");
}

export async function getPokemonStatsCollection(): Promise<Collection> {
  return getCollection("pokemon", "pokemon_stats");
}

export async function getPokemonSpeciesFlavorTextCollection(): Promise<Collection> {
  return getCollection("pokemon", "pokemon_species_flavor_text");
}

export async function getTypesCollection(): Promise<Collection> {
  return getCollection("pokemon", "types");
}

export async function getStatsCollection(): Promise<Collection> {
  return getCollection("pokemon", "stats");
}
