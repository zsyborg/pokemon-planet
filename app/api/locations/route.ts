import { getLocationsCollection, getLocationNamesCollection, getGenerationsCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const skip = parseInt(searchParams.get("skip") ?? "0");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const locationsCollection = await getLocationsCollection();
  const locationNamesCollection = await getLocationNamesCollection();
  const generationsCollection = await getGenerationsCollection();

  // Get all location names (English - local_language_id: 9)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locationNamesRaw = await locationNamesCollection.find({ local_language_id: 9 }).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locationNameMap = new Map<number, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  locationNamesRaw.forEach((l: any) => locationNameMap.set(Number(l.location_id), l.name));

  // Get all generations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generationsRaw = await generationsCollection.find({}).toArray();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generationMap = new Map<number, string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generationsRaw.forEach((g: any) => generationMap.set(Number(g.id), g.identifier));

  // Get all locations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locationsRaw = await locationsCollection.find({}).toArray();

  // Build locations data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locationsData: any[] = locationsRaw.map((location: any) => {
    const locationId = Number(location.id);
    const regionId = Number(location.region_id);

    return {
      id: locationId,
      name: locationNameMap.get(locationId) || location.identifier,
      identifier: location.identifier,
      region_id: regionId,
      region: regionId > 0 ? `Region ${regionId}` : "Unknown",
      generation: regionId > 0 ? generationMap.get(regionId) || `Gen ${regionId}` : null,
    };
  });

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    locationsData.filter((location: any) =>
      location.name.toLowerCase().includes(searchLower) ||
      location.identifier.toLowerCase().includes(searchLower)
    );
  }

  // Sort by id
  locationsData.sort((a, b) => a.id - b.id);

  const total = locationsData.length;
  const paginatedData = locationsData.slice(skip, skip + limit);

  return NextResponse.json({
    locations: paginatedData,
    total,
    skip,
    limit,
  });
}
