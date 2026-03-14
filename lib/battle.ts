// Battle Types and Interfaces
export interface PokemonBattleData {
  id: number;
  identifier: string;
  types: { id: number; identifier: string }[];
  stats: { stat_id: number; base_stat: number; name: string }[];
  moves: MoveData[];
}

export interface MoveData {
  id: number;
  identifier: string;
  type_id: number;
  type_identifier: string;
  power: number | null;
  pp: number;
  max_pp: number;
  accuracy: number | null;
  priority: number;
  damage_class_id: number;
  effect_id: number;
  effect_chance: number | null;
}

export interface BattlePokemon {
  id: number;
  identifier: string;
  name: string;
  types: string[];
  typeIds: number[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  maxHp: number;
  currentHp: number;
  moves: BattleMove[];
}

export interface BattleMove {
  id: number;
  name: string;
  type: string;
  power: number;
  accuracy: number;
  pp: number;
  maxPp: number;
  priority: number;
  damageClass: 'physical' | 'special' | 'status';
}

export interface BattleState {
  player1: BattlePokemon;
  player2: BattlePokemon;
  turn: number;
  currentPlayer: 1 | 2;
  battleLog: BattleLogEntry[];
  isOver: boolean;
  winner: number | null;
}

export interface BattleLogEntry {
  turn: number;
  message: string;
  damage?: number;
  effectiveness?: string;
}

// Type effectiveness map (damage_factor: 0=no effect, 50=not very effective, 100=normal, 200=super effective)
export const TYPE_EFFICACY: Record<number, Record<number, number>> = {};

// Initialize with default values (100)
for (let i = 1; i <= 18; i++) {
  TYPE_EFFICACY[i] = {};
  for (let j = 1; j <= 18; j++) {
    TYPE_EFFICACY[i][j] = 100;
  }
}

// Set up super effective (200)
const superEffective: [number, number][] = [
  [10, 12], [10, 15], [10, 7], [10, 9], // fire -> grass, ice, bug, steel
  [11, 10], [11, 5], [11, 6], // water -> fire, ground, rock
  [12, 11], [12, 5], [12, 6], // grass -> water, ground, rock
  [13, 11], [13, 3], // electric -> water, flying
  [15, 12], [15, 5], [15, 3], [15, 16], // ice -> grass, ground, flying, dragon
  [2, 1], [2, 15], [2, 6], [2, 17], [2, 9], // fighting -> normal, ice, rock, dark, steel
  [4, 12], [4, 18], // poison -> grass, fairy
  [5, 10], [5, 13], [5, 4], [5, 6], [5, 9], // ground -> fire, electric, poison, rock, steel
  [3, 12], [3, 2], [3, 7], // flying -> grass, fighting, bug
  [14, 2], [14, 4], // psychic -> fighting, poison
  [7, 12], [7, 14], [7, 17], // bug -> grass, psychic, dark
  [6, 10], [6, 15], [6, 3], [6, 7], // rock -> fire, ice, flying, bug
  [8, 14], [8, 8], // ghost -> psychic, ghost
  [16, 16], // dragon -> dragon
  [17, 14], [17, 8], // dark -> psychic, ghost
  [9, 15], [9, 6], [9, 18], // steel -> ice, rock, fairy
  [18, 2], [18, 16], [18, 17], // fairy -> fighting, dragon, dark
];

for (const [attacker, defender] of superEffective) {
  TYPE_EFFICACY[attacker][defender] = 200;
}

// Set up not very effective (50)
const notVeryEffective: [number, number][] = [
  [1, 6], [1, 8], // normal -> rock, ghost
  [2, 8], [2, 17], [2, 18], // fighting -> ghost, dark, fairy
  [3, 5], [3, 9], [3, 6], // flying -> ground, steel, rock
  [4, 6], [4, 8], [4, 17], [4, 18], // poison -> rock, ghost, dark, fairy
  [5, 12], [5, 7], [5, 3], // ground -> grass, bug, flying
  [6, 2], [6, 9], [6, 17], // rock -> fighting, steel, dark
  [7, 2], [7, 7], [7, 18], [7, 9], // bug -> fighting, ghost, fairy, steel
  [8, 17], // ghost -> dark
  [9, 10], [9, 11], [9, 12], [9, 13], [9, 14], [9, 16], [9, 18], // steel -> fire, water, grass, electric, psychic, dragon, fairy
  [10, 10], [10, 11], [10, 12], [10, 18], [10, 6], [10, 9], // fire -> fire, water, grass, fairy, rock, steel
  [11, 11], [11, 12], [11, 13], [11, 16], // water -> water, grass, dragon
  [12, 10], [12, 11], [12, 12], [12, 14], [12, 16], [12, 7], // grass -> fire, water, grass, dragon, bug
  [13, 13], [13, 16], [13, 9], // electric -> electric, dragon, steel
  [14, 14], [14, 16], [14, 18], // psychic -> psychic, dragon, fairy
  [15, 15], [15, 9], [15, 10], [15, 11], // ice -> ice, steel, fire, water
  [16, 18], // dragon -> fairy
  [17, 17], [17, 18], // dark -> fairy
];

for (const [attacker, defender] of notVeryEffective) {
  TYPE_EFFICACY[attacker][defender] = 50;
}

// Set up no effect (0)
const noEffect: [number, number][] = [
  [1, 8], // normal -> ghost
  [5, 3], // ground -> flying
  [8, 1], // ghost -> normal
];

for (const [attacker, defender] of noEffect) {
  TYPE_EFFICACY[attacker][defender] = 0;
}

// Type ID to name mapping
export const TYPE_NAMES: Record<number, string> = {
  1: 'normal',
  2: 'fighting',
  3: 'flying',
  4: 'poison',
  5: 'ground',
  6: 'rock',
  7: 'bug',
  8: 'ghost',
  9: 'steel',
  10: 'fire',
  11: 'water',
  12: 'grass',
  13: 'electric',
  14: 'psychic',
  15: 'ice',
  16: 'dragon',
  17: 'dark',
  18: 'fairy',
};

// Type name to ID mapping
export const TYPE_IDS: Record<string, number> = {
  normal: 1,
  fighting: 2,
  flying: 3,
  poison: 4,
  ground: 5,
  rock: 6,
  bug: 7,
  ghost: 8,
  steel: 9,
  fire: 10,
  water: 11,
  grass: 12,
  electric: 13,
  psychic: 14,
  ice: 15,
  dragon: 16,
  dark: 17,
  fairy: 18,
};

// Calculate type effectiveness
export function calculateEffectiveness(attackTypeId: number, defenderTypeIds: number[]): number {
  let effectiveness = 1;
  for (const defenderTypeId of defenderTypeIds) {
    const factor = TYPE_EFFICACY[attackTypeId]?.[defenderTypeId] ?? 100;
    effectiveness *= factor / 100;
  }
  return effectiveness;
}

// Get effectiveness message
export function getEffectivenessMessage(effectiveness: number): string {
  if (effectiveness === 0) return "It had no effect!";
  if (effectiveness >= 4) return "It's super effective!";
  if (effectiveness === 2) return "It's super effective!";
  if (effectiveness === 0.5) return "It's not very effective...";
  if (effectiveness === 0.25) return "It's not very effective...";
  return "";
}

// Calculate damage using standard Pokemon damage formula
export function calculateDamage(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: BattleMove,
  isFirst: boolean
): { damage: number; effectiveness: number; message: string } {
  // If move has no power, it deals no damage (status moves)
  if (!move.power || move.power === 0) {
    return { damage: 0, effectiveness: 1, message: "" };
  }

  // Get attack and defense stats based on move type
  const isPhysical = move.damageClass === 'physical';
  const attackStat = isPhysical ? attacker.stats.attack : attacker.stats.specialAttack;
  const defenseStat = isPhysical ? defender.stats.defense : defender.stats.specialDefense;

  // Level (fixed at 50 for simplicity)
  const level = 50;

  // Base power
  const power = move.power;

  // Attack / Defense
  const attack = Math.floor((2 * attackStat + 5) / 5 + 5);
  const defense = Math.floor((2 * defenseStat + 5) / 5 + 5);

  // Calculate base damage
  let damage = Math.floor(Math.floor(Math.floor(2 * level / 5 + 2) * power * attack / defense) / 50 + 2);

  // STAB (Same Type Attack Bonus)
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;

  // Type effectiveness
  const defenderTypeIds = defender.typeIds.map(t => TYPE_IDS[t] || 0);
  const attackTypeId = TYPE_IDS[move.type] || 0;
  const effectiveness = calculateEffectiveness(attackTypeId, defenderTypeIds);
  const effectivenessMessage = getEffectivenessMessage(effectiveness);

  // Random factor (85-100%)
  const random = (Math.floor(Math.random() * 16) + 85) / 100;

  // Final damage
  damage = Math.floor(damage * stab * effectiveness * random);

  return { damage, effectiveness, message: effectivenessMessage };
}

// Determine turn order based on speed and priority
export function getTurnOrder(
  pokemon1: BattlePokemon,
  move1: BattleMove,
  pokemon2: BattlePokemon,
  move2: BattleMove
): [BattlePokemon, BattleMove, BattlePokemon, BattleMove] {
  // Check priority first
  if (move1.priority > move2.priority) {
    return [pokemon1, move1, pokemon2, move2];
  }
  if (move2.priority > move1.priority) {
    return [pokemon2, move2, pokemon1, move1];
  }
  
  // If same priority, use speed
  if (pokemon1.stats.speed > pokemon2.stats.speed) {
    return [pokemon1, move1, pokemon2, move2];
  }
  if (pokemon2.stats.speed > pokemon1.stats.speed) {
    return [pokemon2, move2, pokemon1, move1];
  }
  
  // Random if speed is equal
  if (Math.random() < 0.5) {
    return [pokemon1, move1, pokemon2, move2];
  }
  return [pokemon2, move2, pokemon1, move1];
}

// Create a battle Pokemon from API data
export function createBattlePokemon(data: any): BattlePokemon {
  const statsMap: Record<number, number> = {};
  data.stats?.forEach((stat: any) => {
    statsMap[stat.stat_id] = stat.base_stat;
  });

  // Calculate HP using standard formula
  const hp = Math.floor((2 * (statsMap[1] || 50) + 31) * 50 / 100 + 50 + 10);

  const types = data.types?.map((t: any) => t.identifier) || [];
  const typeIds = data.types?.map((t: any) => t.id) || [];

  // Filter moves to only include those with power for battle
  const moves: BattleMove[] = (data.moves || [])
    .filter((m: any) => m.power && m.power > 0)
    .slice(0, 4) // Limit to 4 moves
    .map((m: any) => ({
      id: m.id,
      name: m.identifier,
      type: m.type_identifier,
      power: m.power,
      accuracy: m.accuracy || 100,
      pp: m.pp,
      maxPp: m.pp,
      priority: m.priority || 0,
      damageClass: m.damage_class_id === 2 ? 'physical' : m.damage_class_id === 3 ? 'special' : 'status',
    }));

  // If no moves with power, add a struggle-like move
  if (moves.length === 0) {
    moves.push({
      id: 0,
      name: 'tackle',
      type: 'normal',
      power: 40,
      accuracy: 100,
      pp: 999,
      maxPp: 999,
      priority: 0,
      damageClass: 'physical',
    });
  }

  return {
    id: data.id,
    identifier: data.identifier,
    name: data.identifier,
    types,
    typeIds,
    stats: {
      hp,
      attack: statsMap[2] || 50,
      defense: statsMap[3] || 50,
      specialAttack: statsMap[4] || 50,
      specialDefense: statsMap[5] || 50,
      speed: statsMap[6] || 50,
    },
    maxHp: hp,
    currentHp: hp,
    moves,
  };
}

// Create initial battle state
export function createBattleState(
  player1Data: any,
  player2Data: any
): BattleState {
  const player1 = createBattlePokemon(player1Data);
  const player2 = createBattlePokemon(player2Data);

  return {
    player1,
    player2,
    turn: 1,
    currentPlayer: 1,
    battleLog: [{
      turn: 0,
      message: `Battle started between ${player1.name} and ${player2.name}!`,
    }],
    isOver: false,
    winner: null,
  };
}

// Execute a turn
export function executeTurn(
  state: BattleState,
  player1MoveIndex: number,
  player2MoveIndex: number
): BattleState {
  const newState = JSON.parse(JSON.stringify(state)) as BattleState;
  
  const player1Move = newState.player1.moves[player1MoveIndex];
  const player2Move = newState.player2.moves[player2MoveIndex];

  // Determine turn order
  const [first, firstMove, second, secondMove] = getTurnOrder(
    newState.player1,
    player1Move,
    newState.player2,
    player2Move
  );

  const firstIsPlayer1 = first.id === newState.player1.id;
  const attacker1Name = firstIsPlayer1 ? newState.player1.name : newState.player2.name;
  const attacker2Name = firstIsPlayer1 ? newState.player2.name : newState.player1.name;
  const defender1 = firstIsPlayer1 ? newState.player2 : newState.player1;
  const defender2 = firstIsPlayer1 ? newState.player1 : newState.player2;

  // First attacker moves
  if (firstMove.pp > 0) {
    // Check accuracy
    const hitChance = firstMove.accuracy / 100;
    if (Math.random() < hitChance) {
      const result = calculateDamage(first, defender1, firstMove, true);
      defender1.currentHp = Math.max(0, defender1.currentHp - result.damage);
      
      newState.battleLog.push({
        turn: newState.turn,
        message: `${first.name} used ${firstMove.name}!`,
        damage: result.damage,
        effectiveness: result.message,
      });

      // Reduce PP
      firstMove.pp--;
    } else {
      newState.battleLog.push({
        turn: newState.turn,
        message: `${first.name} used ${firstMove.name}, but missed!`,
      });
      firstMove.pp--;
    }
  }

  // Check if battle is over after first attack
  if (defender1.currentHp <= 0) {
    newState.isOver = true;
    newState.winner = first.id;
    newState.battleLog.push({
      turn: newState.turn,
      message: `${defender1.name} fainted!`,
    });
    return newState;
  }

  // Second attacker moves
  if (secondMove.pp > 0) {
    const hitChance = secondMove.accuracy / 100;
    if (Math.random() < hitChance) {
      const result = calculateDamage(second, defender2, secondMove, false);
      defender2.currentHp = Math.max(0, defender2.currentHp - result.damage);
      
      newState.battleLog.push({
        turn: newState.turn,
        message: `${second.name} used ${secondMove.name}!`,
        damage: result.damage,
        effectiveness: result.message,
      });

      secondMove.pp--;
    } else {
      newState.battleLog.push({
        turn: newState.turn,
        message: `${second.name} used ${secondMove.name}, but missed!`,
      });
      secondMove.pp--;
    }
  }

  // Check if battle is over after second attack
  if (defender2.currentHp <= 0) {
    newState.isOver = true;
    newState.winner = second.id;
    newState.battleLog.push({
      turn: newState.turn,
      message: `${defender2.name} fainted!`,
    });
  }

  newState.turn++;
  return newState;
}
