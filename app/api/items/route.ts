import { getItemsCollection, getItemNamesCollection, getItemFlavorTextCollection, getItemCategoriesCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";

interface Item {
  id: number;
  identifier: string;
  category_id: number;
  cost: number;
  fling_power: number | null;
  name?: string;
  category?: string;
  flavor_text?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const skip = parseInt(searchParams.get("skip") ?? "0");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const itemsCollection = await getItemsCollection();
  const itemNamesCollection = await getItemNamesCollection();
  const itemFlavorTextCollection = await getItemFlavorTextCollection();
  const itemCategoriesCollection = await getItemCategoriesCollection();

  // Get all item names (English - local_language_id: 9)
  const itemNames = await itemNamesCollection
    .find({ local_language_id: 9 })
    .toArray();
  
  // Create name map
  const nameMap = new Map<number, string>();
  itemNames.forEach((n) => nameMap.set(n.item_id, n.name));

  // Get all flavor text (English - language_id: 9, latest version group 18)
  const itemFlavorTexts = await itemFlavorTextCollection
    .find({ version_group_id: 18, language_id: 9 })
    .toArray();
  
  // Create flavor text map (use first available for each item)
  const flavorMap = new Map<number, string>();
  itemFlavorTexts.forEach((f) => {
    if (!flavorMap.has(f.item_id)) {
      flavorMap.set(f.item_id, f.flavor_text);
    }
  });

  // Get all item categories
  const itemCategories = await itemCategoriesCollection.find({}).toArray();
  
  // Create category map
  const categoryMap = new Map<number, string>();
  itemCategories.forEach((c) => categoryMap.set(c.id, c.identifier));

  // Build filter for items
  let filter = {};
  if (search) {
    // We'll search in memory after fetching since we need to join with names
    filter = {};
  }

  // Get all items from MongoDB
  const items = await itemsCollection
    .find(filter)
    .sort({ id: 1 })
    .toArray();

  // Build result items with joined data
  let result: Item[] = items.map((item) => ({
    id: item.id as number,
    identifier: item.identifier as string,
    category_id: item.category_id as number,
    cost: item.cost as number,
    fling_power: item.fling_power as number | null,
    name: nameMap.get(item.id as number) || (item.identifier as string),
    category: categoryMap.get(item.category_id as number) || "unknown",
    flavor_text: flavorMap.get(item.id as number) || "",
  }));

  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase();
    result = result.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchLower) ||
        item.identifier.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower)
    );
  }

  // Get total count before pagination
  const total = result.length;

  // Apply pagination
  result = result.slice(skip, skip + limit);

  return NextResponse.json({
    items: result,
    total,
    skip,
    limit,
  });
}
