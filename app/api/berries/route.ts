import { getBerriesCollection, getBerryFirmnessNamesCollection, getBerryFlavorsCollection, getItemNamesCollection, getTypesCollection, getTypeNamesCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const skip = parseInt(searchParams.get("skip") ?? "0");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const berriesCollection = await getBerriesCollection();
  const berryFirmnessNamesCollection = await getBerryFirmnessNamesCollection();
  const berryFlavorsCollection = await getBerryFlavorsCollection();
  const itemNamesCollection = await getItemNamesCollection();
  const typesCollection = await getTypesCollection();
  const typeNamesCollection = await getTypeNamesCollection();

  // Get all berry firmness names (English - local_language_id: 9)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firmnessRaw = await berryFirmnessNamesCollection.find({ local_language_id: 9 }).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firmnessMap = new Map<number, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  firmnessRaw.forEach((f: any) => firmnessMap.set(Number(f.berry_firmness_id), f.name));

  // Get all berry flavors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flavorsRaw = await berryFlavorsCollection.find({}).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flavorsByBerry = new Map<number, { contest_type_id: number; flavor: number }[]>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flavorsRaw.forEach((f: any) => {
    const existing = flavorsByBerry.get(Number(f.berry_id)) || [];
    existing.push({ contest_type_id: Number(f.contest_type_id), flavor: Number(f.flavor) });
    flavorsByBerry.set(Number(f.berry_id), existing);
  });

  // Flavor names (contest type IDs)
  const flavorNames: Record<number, string> = {
    1: "Spicy",
    2: "Dry",
    3: "Sweet",
    4: "Bitter",
    5: "Sour",
  };

  // Get all item names (English - local_language_id: 9)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemNamesRaw = await itemNamesCollection.find({ local_language_id: 9 }).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemNameMap = new Map<number, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  itemNamesRaw.forEach((i: any) => itemNameMap.set(Number(i.item_id), i.name));

  // Get all type names
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typeNamesRaw = await typeNamesCollection.find({ local_language_id: 9 }).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typeNameMap = new Map<number, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeNamesRaw.forEach((t: any) => typeNameMap.set(Number(t.type_id), t.name));

  // Get all types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typesRaw = await typesCollection.find({}).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typeIdentifierMap = new Map<number, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typesRaw.forEach((t: any) => typeIdentifierMap.set(Number(t.id), String(t.identifier)));

  // Get all berries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const berriesRaw = await berriesCollection.find({}).toArray();

  // Build berries data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const berriesData: any[] = berriesRaw.map((berry: any) => {
    const itemId = Number(berry.item_id);
    const berryId = Number(berry.id);
    const firmnessId = Number(berry.firmness_id);
    const naturalGiftTypeId = Number(berry.natural_gift_type_id);

    // Get flavors for this berry
    const flavors = flavorsByBerry.get(berryId) || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flavorData: Record<string, number> = {};
    flavors.forEach((f: { contest_type_id: number; flavor: number }) => {
      const flavorName = flavorNames[f.contest_type_id] || `flavor-${f.contest_type_id}`;
      flavorData[flavorName] = f.flavor;
    });

    return {
      id: berryId,
      item_id: itemId,
      name: itemNameMap.get(itemId) || `berry-${berryId}`,
      firmness: firmnessMap.get(firmnessId) || "Unknown",
      natural_gift_power: Number(berry.natural_gift_power) || 0,
      natural_gift_type: naturalGiftTypeId > 0 ? {
        id: naturalGiftTypeId,
        name: typeNameMap.get(naturalGiftTypeId) || `type-${naturalGiftTypeId}`,
        identifier: typeIdentifierMap.get(naturalGiftTypeId) || `type-${naturalGiftTypeId}`,
      } : null,
      size: Number(berry.size) || 0,
      max_harvest: Number(berry.max_harvest) || 0,
      growth_time: Number(berry.growth_time) || 0,
      soil_dryness: Number(berry.soil_dryness) || 0,
      smoothness: Number(berry.smoothness) || 0,
      flavors: flavorData,
    };
  });

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    berriesData.filter((berry: any) =>
      berry.name.toLowerCase().includes(searchLower)
    );
  }

  // Sort by id
  berriesData.sort((a, b) => a.id - b.id);

  const total = berriesData.length;
  const paginatedData = berriesData.slice(skip, skip + limit);

  return NextResponse.json({
    berries: paginatedData,
    total,
    skip,
    limit,
  });
}
