/**
 * 純碁ゲームロジックライブラリ
 *
 * このモジュールは純碁のゲームロジックを実装したライブラリです。
 * 純碁は囲碁の簡素化バージョンで、以下のルールに基づいています：
 * - 石を囲えば取れる
 * - 2連続パスで終局
 * - 石が多い方が勝ち
 * - 自殺手は禁止
 *
 * @module jungo-core-lib
 *
 * @example
 * ```ts
 * import { createGame, playMove } from 'jungo-core-lib';
 *
 * // 9路盤でゲームを作成
 * const game = createGame(9);
 *
 * // 黒が(3,3)に着手
 * const result = playMove(game, { type: "play", position: { x: 3, y: 3 } });
 * if (result.success) {
 *   console.log('着手成功！');
 * }
 * ```
 */


export { MIN_BOARD_SIZE } from "./constants.js";

export { createGame, playMove } from "./game.js";

export type {
  Cell,
  Color,
  GameState,
  Move,
  MoveError,
  MoveResult,
  Position
} from "./types.js";

