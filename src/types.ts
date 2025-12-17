export type Color = "black" | "white";
export type Cell = Color | null;
export type Position = { readonly x: number; readonly y: number };

export type Move =
  | { readonly type: "play"; readonly position: Position }
  | { readonly type: "pass" }
  | { readonly type: "resign" };

export type GameState = {
  readonly board: ReadonlyArray<ReadonlyArray<Cell>>;
  readonly size: number;
  readonly currentPlayer: Color;
  readonly koPoint: Position | null;
  readonly moveCount: number;
  readonly lastMove: (Move & { readonly color: Color }) | null;
  readonly isOver: boolean;
  readonly winner: Color | "draw" | null;
  
  readonly stoneCount: { readonly black: number; readonly white: number };
};

export type MoveResult =
  | { readonly success: true; readonly state: GameState }
  | { readonly success: false; readonly error: MoveError };

export type MoveError = "invalid_position" | "occupied" | "suicide" | "ko" | "game_over";
