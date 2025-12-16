/**
 * jungo
 * A pure Go (Jungo) game library
 */

export const version = "0.1.0";

// Export types from types.ts
export type {
  Cell,
  Color,
  GameState,
  Move,
  MoveError,
  MoveResult,
  Position
} from "./types.js";

// Export functions from game.ts
export { createGame, playMove } from "./game.js";
