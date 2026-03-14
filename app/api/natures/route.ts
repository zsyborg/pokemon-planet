import { getNaturesCollection, getNatureNamesCollection, getStatNamesCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";

  const naturesCollection = await getNaturesCollection();
  const natureNamesCollection = await getNatureNamesCollection();
  const statNamesCollection = await getStatNamesCollection();

  // Get all stat names (English - local_language_id: 9)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const statNamesRaw = await statNamesCollection.find({ local_language_id: 9 }).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const statNameMap = new Map<number, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  statNamesRaw.forEach((s: any) => statNameMap.set(Number(s.stat_id), s.name));

  // Get all nature names (English - local_language_id: 9)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const natureNamesRaw = await natureNamesCollection.find({ local_language_id: 9 }).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const natureNameMap = new Map<number, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  natureNamesRaw.forEach((n: any) => natureNameMap.set(Number(n.nature_id), n.name));

  // Get all natures
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const naturesRaw = await naturesCollection.find({}).toArray();

  // Build natures data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const naturesData: any[] = naturesRaw.map((nature: any) => {
    const natureId = Number(nature.id);
    const decreasedStatId = Number(nature.decreased_stat_id);
    const increasedStatId = Number(nature.increased_stat_id);
    const hatesFlavorId = Number(nature.hates_flavor_id);
    const likesFlavorId = Number(nature.likes_flavor_id);

    // Flavor names (contest type IDs)
    const flavorNames: Record<number, string> = {
      1: "Spicy",
      2: "Dry",
      3: "Sweet",
      4: "Bitter",
      5: "Sour",
    };

    // Determine stat changes
    let increasedStat = "";
    let decreasedStat = "";
    let effect = "";

    if (increasedStatId > 0 && decreasedStatId > 0 && increasedStatId !== decreasedStatId) {
      increasedStat = statNameMap.get(increasedStatId) || `Stat ${increasedStatId}`;
      decreasedStat = statNameMap.get(decreasedStatId) || `Stat ${decreasedStatId}`;
      effect = `+10% ${increasedStat} / -10% ${decreasedStat}`;
    } else if (natureId === 1) { // Hardy - no stat changes
      effect = "No stat changes";
    } else if (natureId === 13) { // Bashful - no stat changes
      effect = "No stat changes";
    } else if (natureId === 19) { // Quirky - no stat changes
      effect = "No stat changes";
    } else if (natureId === 25) { // Serious - no stat changes
      effect = "No stat changes";
    }

    return {
      id: natureId,
      name: natureNameMap.get(natureId) || nature.identifier,
      identifier: nature.identifier,
      increased_stat: increasedStat,
      decreased_stat: decreasedStat,
      effect,
      hates_flavor: flavorNames[hatesFlavorId] || null,
      likes_flavor: flavorNames[likesFlavorId] || null,
      game_index: Number(nature.game_index) || 0,
    };
  });

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    naturesData.filter((nature: any) =>
      nature.name.toLowerCase().includes(searchLower) ||
      nature.identifier.toLowerCase().includes(searchLower) ||
      nature.effect.toLowerCase().includes(searchLower)
    );
  }

  // Sort by id
  naturesData.sort((a, b) => a.id - b.id);

  return NextResponse.json({
    natures: naturesData,
  });
}
