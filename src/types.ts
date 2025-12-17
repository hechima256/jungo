/**
 * 石の色を表す型
 *
 * 囲碁では黒と白の2色の石を使用します。
 *
 * @example
 * ```ts
 * const blackColor: Color = "black";
 * const whiteColor: Color = "white";
 * ```
 */
export type Color = "black" | "white";

/**
 * 盤面のセルの状態を表す型
 *
 * セルには黒石、白石、または何も置かれていない状態（null）があります。
 *
 * @example
 * ```ts
 * const emptyCell: Cell = null;
 * const blackStone: Cell = "black";
 * const whiteStone: Cell = "white";
 * ```
 */
export type Cell = Color | null;

/**
 * 盤面上の座標を表す型
 *
 * @property x - X座標（0-indexed、左から右へ0からsize-1）
 * @property y - Y座標（0-indexed、上から下へ0からsize-1）
 *
 * @example
 * ```ts
 * const position: Position = { x: 3, y: 5 };
 * ```
 */
export type Position = { readonly x: number; readonly y: number };

/**
 * 手を表す型
 *
 * 囲碁の手には、石を置く（play）、パス（pass）、投了（resign）の3種類があります。
 *
 * @example
 * ```ts
 * const playMove: Move = { type: "play", position: { x: 3, y: 3 } };
 * const passMove: Move = { type: "pass" };
 * const resignMove: Move = { type: "resign" };
 * ```
 */
export type Move =
  | { readonly type: "play"; readonly position: Position }
  | { readonly type: "pass" }
  | { readonly type: "resign" };

/**
 * ゲームの状態を表す型
 *
 * 囲碁ゲームの現在の状態を保持します。盤面、手番、コウの位置などの情報を含みます。
 *
 * @property board - 盤面の状態を表す2次元配列（{@link Cell}の配列）
 * @property size - 盤面のサイズ（9, 13, 19など）
 * @property currentPlayer - 現在の手番のプレイヤーの色（{@link Color}）
 * @property koPoint - コウの位置（{@link Position}）。コウでない場合はnull
 * @property moveCount - 手数
 * @property lastMove - 直前の手（{@link Move}と{@link Color}の組み合わせ）。ゲーム開始時はnull
 * @property isOver - ゲームが終了しているかどうか
 * @property winner - 勝者の色（{@link Color}）、引き分け（"draw"）、またはnull（ゲーム中）
 * @property stoneCount - 盤面上の黒石と白石の数
 *
 * @example
 * ```ts
 * const gameState: GameState = {
 *   board: [[null, "black"], ["white", null]],
 *   size: 2,
 *   currentPlayer: "white",
 *   koPoint: null,
 *   moveCount: 2,
 *   lastMove: { type: "play", position: { x: 1, y: 0 }, color: "black" },
 *   isOver: false,
 *   winner: null,
 *   stoneCount: { black: 1, white: 1 }
 * };
 * ```
 */
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

/**
 * 手の実行結果を表す型
 *
 * 手の実行が成功した場合は新しい{@link GameState}を、失敗した場合はエラー情報（{@link MoveError}）を返します。
 *
 * @example
 * ```ts
 * const successResult: MoveResult = {
 *   success: true,
 *   state: gameState
 * };
 *
 * const failureResult: MoveResult = {
 *   success: false,
 *   error: "occupied"
 * };
 * ```
 */
export type MoveResult =
  | { readonly success: true; readonly state: GameState }
  | { readonly success: false; readonly error: MoveError };

/**
 * 手の実行が失敗した際のエラーの種類
 *
 * - `invalid_position`: 盤面外の座標を指定した
 * - `occupied`: 既に石が置かれている位置を指定した
 * - `suicide`: 自殺手（自分の石を取られる手）を指定した
 * - `ko`: コウのルールに違反する手を指定した
 * - `game_over`: ゲームが既に終了している
 *
 * @example
 * ```ts
 * const error1: MoveError = "invalid_position";
 * const error2: MoveError = "occupied";
 * const error3: MoveError = "suicide";
 * ```
 */
export type MoveError = "invalid_position" | "occupied" | "suicide" | "ko" | "game_over";
