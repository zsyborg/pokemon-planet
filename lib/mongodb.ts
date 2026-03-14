import { MongoClient, Db, Collection } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/pokemon";

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

export async function getItemsCollection(): Promise<Collection> {
  return getCollection("pokemon", "items");
}

export async function getItemNamesCollection(): Promise<Collection> {
  return getCollection("pokemon", "item_names");
}

export async function getItemFlavorTextCollection(): Promise<Collection> {
  return getCollection("pokemon", "item_flavor_text");
}

export async function getItemCategoriesCollection(): Promise<Collection> {
  return getCollection("pokemon", "item_categories");
}

export async function getMoveNamesCollection(): Promise<Collection> {
  return getCollection("pokemon", "move_names");
}

export async function getMoveFlavorTextCollection(): Promise<Collection> {
  return getCollection("pokemon", "move_flavor_text");
}

export async function getMoveMetaCollection(): Promise<Collection> {
  return getCollection("pokemon", "move_meta");
}

export async function getMoveDamageClassesCollection(): Promise<Collection> {
  return getCollection("pokemon", "move_damage_classes");
}

export async function getMoveDamageClassProseCollection(): Promise<Collection> {
  return getCollection("pokemon", "move_damage_class_prose");
}

export async function getPokemonSpeciesNamesCollection(): Promise<Collection> {
  return getCollection("pokemon", "pokemon_species_names");
}

export async function getAbilityNamesCollection(): Promise<Collection> {
  return getCollection("pokemon", "ability_names");
}

export async function getAbilityFlavorTextCollection(): Promise<Collection> {
  return getCollection("pokemon", "ability_flavor_text");
}

export async function getAbilityProseCollection(): Promise<Collection> {
  return getCollection("pokemon", "ability_prose");
}

export async function getTypeEfficacyCollection(): Promise<Collection> {
  return getCollection("pokemon", "type_efficacy");
}

export async function getTypeNamesCollection(): Promise<Collection> {
  return getCollection("pokemon", "type_names");
}

export async function getStatNamesCollection(): Promise<Collection> {
  return getCollection("pokemon", "stat_names");
}

export async function getEvolutionTriggersCollection(): Promise<Collection> {
  return getCollection("pokemon", "evolution_triggers");
}

export async function getBerriesCollection(): Promise<Collection> {
  return getCollection("pokemon", "berries");
}

export async function getBerryFirmnessNamesCollection(): Promise<Collection> {
  return getCollection("pokemon", "berry_firmness_names");
}

export async function getBerryFlavorsCollection(): Promise<Collection> {
  return getCollection("pokemon", "berry_flavors");
}

export async function getLocationsCollection(): Promise<Collection> {
  return getCollection("pokemon", "locations");
}

export async function getLocationNamesCollection(): Promise<Collection> {
  return getCollection("pokemon", "location_names");
}

export async function getNaturesCollection(): Promise<Collection> {
  return getCollection("pokemon", "natures");
}

export async function getNatureNamesCollection(): Promise<Collection> {
  return getCollection("pokemon", "nature_names");
}
