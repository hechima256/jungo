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
 * import { createGame, playMove, type GameState } from 'jungo-core-lib';
 *
 * // ゲームを作成
 * const game = createGame(9);
 *
 * // 手を打つ
 * const result = playMove(game, { row: 3, col: 3 });
 * if (!result.error) {
 *   console.log('着手成功！');
 * }
 * ```
 */

/**
 * ライブラリのバージョン番号
 *
 * セマンティックバージョニング（major.minor.patch）形式で表現されます。
 *
 * @example
 * ```ts
 * import { version } from 'jungo-core-lib';
 * console.log(`Version: ${version}`);
 * ```
 */
export const version = "0.1.0";

/**
 * ゲーム作成関数
 *
 * {@link createGame} 関数をエクスポートします。
 * 新しい純碁ゲームを指定したボードサイズで初期化します。
 *
 * @see {@link createGame} - 関数の詳細な説明
 */
export { createGame, playMove } from "./game.js";

/**
 * 型定義
 *
 * ライブラリで使用される全ての公開型定義をエクスポートします。
 *
 * - {@link Cell} - 碁盤のセルの状態
 * - {@link Color} - 石の色（黒または白）
 * - {@link GameState} - ゲームの状態
 * - {@link Move} - 着手の情報
 * - {@link MoveError} - 着手エラーの種類
 * - {@link MoveResult} - 着手結果
 * - {@link Position} - 碁盤上の位置
 */
export type {
  Cell,
  Color,
  GameState,
  Move,
  MoveError,
  MoveResult,
  Position
} from "./types.js";

