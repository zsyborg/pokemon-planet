import { getMovesCollection, getMoveNamesCollection, getMoveDamageClassesCollection, getTypeEfficacyCollection, getTypeNamesCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";

interface Move {
  id: number;
  identifier: string;
  type_id: number;
  power: number | null;
  pp: number | null;
  accuracy: number | null;
  damage_class_id: number;
}

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

interface MoveDamageResult {
  type: Type;
  multiplier: number;
  multiplierLabel: string;
  damageClass: string;
  effectiveness: string;
  color: string;
}

interface MoveDamageResponse {
  move: {
    id: number;
    name: string;
    identifier: string;
    type: Type;
    damageClass: string;
    power: number | null;
    pp: number | null;
    accuracy: number | null;
  };
  typeEffectiveness: MoveDamageResult[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const moveId = searchParams.get("moveId");
  const search = searchParams.get("search");

  try {
    const movesCollection = await getMovesCollection();
    const moveNamesCollection = await getMoveNamesCollection();
    const moveDamageClassesCollection = await getMoveDamageClassesCollection();
    const typeEfficacyCollection = await getTypeEfficacyCollection();
    const typeNamesCollection = await getTypeNamesCollection();

    // Get type names (English - local_language_id: 9)
    const typeNames = await typeNamesCollection
      .find({ local_language_id: 9 })
      .toArray();

    // Get move damage classes
    const damageClasses = await moveDamageClassesCollection.find({}).toArray();

    // Get type efficacy data
    const typeEfficacyData = await typeEfficacyCollection.find({}).toArray();

    // Create type map
    const typeMap = new Map<number, Type>();
    typeNames.forEach((t) => {
      typeMap.set(t.type_id as number, {
        id: t.type_id as number,
        identifier: t.type_identifier || t.type_id?.toString() || "",
        name: t.name as string,
      });
    });

    // Create damage class map
    const damageClassMap = new Map<number, string>();
    damageClasses.forEach((dc) => {
      damageClassMap.set(dc.id as number, dc.identifier as string);
    });

    // If searching for moves
    if (search) {
      const moveNames = await moveNamesCollection
        .find({ 
          local_language_id: 9,
          name: { $regex: search, $options: "i" }
        })
        .limit(20)
        .toArray();

      const moveIds = moveNames.map(mn => mn.move_id);
      
      const moves = await movesCollection
        .find({ id: { $in: moveIds } })
        .toArray();

      const searchResults = moves.map(move => {
        const moveName = moveNames.find(mn => mn.move_id === move.id)?.name || move.identifier;
        const type = typeMap.get(move.type_id as number) || { id: move.type_id as number, identifier: "", name: "Unknown" };
        
        return {
          id: move.id,
          name: moveName,
          identifier: move.identifier,
          type,
          damageClass: damageClassMap.get(move.damage_class_id as number) || "unknown",
          power: move.power,
        };
      });

      return NextResponse.json({ moves: searchResults });
    }

    // If no moveId provided, return list of all moves
    if (!moveId) {
      const allMoveNames = await moveNamesCollection
        .find({ local_language_id: 9 })
        .toArray();

      const allMoves = await movesCollection
        .find({})
        .toArray();

      const movesList = allMoves.map(move => {
        const moveName = allMoveNames.find(mn => mn.move_id === move.id)?.name || move.identifier;
        const type = typeMap.get(move.type_id as number) || { id: move.type_id as number, identifier: "", name: "Unknown" };
        
        return {
          id: move.id,
          name: moveName,
          identifier: move.identifier,
          type,
          damageClass: damageClassMap.get(move.damage_class_id as number) || "unknown",
          power: move.power,
        };
      });

      return NextResponse.json({ moves: movesList });
    }

    // Get specific move data
    const moveIdNum = parseInt(moveId);
    const move = await movesCollection.findOne({ id: moveIdNum });

    if (!move) {
      return NextResponse.json({ error: "Move not found" }, { status: 404 });
    }

    const moveName = await moveNamesCollection.findOne({ 
      move_id: moveIdNum, 
      local_language_id: 9 
    });

    const moveType = typeMap.get(move.type_id as number) || { 
      id: move.type_id as number, 
      identifier: "", 
      name: "Unknown" 
    };

    const moveDamageClass = damageClassMap.get(move.damage_class_id as number) || "unknown";

    // Build effectiveness results for all 18 types
    const typeEffectiveness: MoveDamageResult[] = [];
    
    // Get efficacy data for the move's type
    const moveTypeEfficacy = typeEfficacyData.filter(
      (e) => e.damage_type_id === move.type_id
    );

    // Create a map of target type to damage factor
    const efficacyMap = new Map<number, number>();
    moveTypeEfficacy.forEach((e) => {
      efficacyMap.set(e.target_type_id as number, e.damage_factor as number);
    });

    // Iterate through all 18 types
    for (let i = 1; i <= 18; i++) {
      const targetType = typeMap.get(i);
      if (!targetType) continue;

      const damageFactor = efficacyMap.get(i) || 100;
      
      let multiplier: number;
      let multiplierLabel: string;
      let effectiveness: string;
      let color: string;

      if (damageFactor === 0) {
        multiplier = 0;
        multiplierLabel = "0×";
        effectiveness = "No Effect";
        color = "bg-gray-800";
      } else if (damageFactor === 50) {
        multiplier = 0.5;
        multiplierLabel = "0.5×";
        effectiveness = "Not Very Effective";
        color = "bg-blue-400";
      } else if (damageFactor === 100) {
        multiplier = 1;
        multiplierLabel = "1×";
        effectiveness = "Normal";
        color = "bg-gray-400";
      } else if (damageFactor === 200) {
        multiplier = 2;
        multiplierLabel = "2×";
        effectiveness = "Super Effective";
        color = "bg-red-500";
      } else if (damageFactor === 400) {
        multiplier = 4;
        multiplierLabel = "4×";
        effectiveness = "Super Effective";
        color = "bg-red-700";
      } else {
        multiplier = damageFactor / 100;
        multiplierLabel = `${damageFactor / 100}×`;
        effectiveness = damageFactor > 100 ? "Super Effective" : "Not Very Effective";
        color = damageFactor > 100 ? "bg-red-500" : "bg-blue-400";
      }

      typeEffectiveness.push({
        type: targetType,
        multiplier,
        multiplierLabel,
        damageClass: moveDamageClass,
        effectiveness,
        color,
      });
    }

    const response: MoveDamageResponse = {
      move: {
        id: move.id,
        name: moveName?.name || move.identifier,
        identifier: move.identifier,
        type: moveType,
        damageClass: moveDamageClass,
        power: move.power,
        pp: move.pp,
        accuracy: move.accuracy,
      },
      typeEffectiveness,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching move damage data:", error);
    return NextResponse.json({ error: "Failed to fetch move damage data" }, { status: 500 });
  }
}
