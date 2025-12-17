import {
  captureStones,
  createEmptyBoard,
  isValidPosition,
  placeStone,
  wouldBeSuicide,
} from "./board.js";
import { MIN_BOARD_SIZE } from "./constants.js";
import type { Cell, Color, GameState, Move, MoveResult } from "./types.js";

/**
 * 指定サイズの新規ゲームを作成します。
 *
 * 新しい囲碁ゲームを開始する際に使用します。
 * 盤面サイズは{@link MIN_BOARD_SIZE}以上の整数である必要があります。
 * 初期状態では黒番から開始し、盤面は全て空です。
 *
 * @param size - 盤面のサイズ（{@link MIN_BOARD_SIZE}以上の整数、通常は7, 9など）
 * @returns 初期化された{@link GameState}
 * @throws サイズが整数でないか、{@link MIN_BOARD_SIZE}未満の場合にエラーをスローします
 *
 * @example
 * ```ts
 * // 19路盤でゲームを開始
 * const game = createGame(19);
 * console.log(game.currentPlayer); // "black"
 * console.log(game.moveCount); // 0
 * ```
 *
 * @example
 * ```ts
 * // 9路盤でゲームを開始
 * const smallGame = createGame(9);
 * console.log(smallGame.size); // 9
 * console.log(smallGame.isOver); // false
 * ```
 */
export function createGame(size: number): GameState {
  if (!Number.isInteger(size) || size < MIN_BOARD_SIZE) {
    throw new Error(`Invalid board size: ${size}. Must be an integer >= ${MIN_BOARD_SIZE}.`);
  }
  return {
    board: createEmptyBoard(size),
    size,
    currentPlayer: "black",
    koPoint: null,
    moveCount: 0,
    lastMove: null,
    isOver: false,
    winner: null,
    stoneCount: { black: 0, white: 0 },
  };
}

/**
 * 着手を実行し、新しいゲーム状態を返します。
 *
 * 囲碁の着手（石を置く、パス、投了）を実行します。
 * 着手の有効性を検証し、盤面の状態を更新します。
 * 着手には以下の種類があります：
 * - `play`: 指定位置に石を置く
 * - `pass`: 手番をパスする（2連続パスで終局）
 * - `resign`: 投了する
 *
 * 着手が無効な場合は、エラー情報を含む{@link MoveResult}を返します。
 * エラーの種類については{@link MoveError}を参照してください。
 *
 * @param state - 現在の{@link GameState}
 * @param move - 実行する{@link Move}（play, pass, resignのいずれか）
 * @returns {@link MoveResult} - 成功時は新しい{@link GameState}、失敗時は{@link MoveError}
 *
 * @example
 * ```ts
 * // 石を置く
 * const game = createGame(19);
 * const result = playMove(game, { type: "play", position: { x: 3, y: 3 } });
 * if (result.success) {
 *   console.log(result.state.currentPlayer); // "white"
 *   console.log(result.state.board[3][3]); // "black"
 * }
 * ```
 *
 * @example
 * ```ts
 * // パスする
 * const game = createGame(19);
 * const result = playMove(game, { type: "pass" });
 * if (result.success) {
 *   console.log(result.state.currentPlayer); // "white"
 *   console.log(result.state.moveCount); // 1
 * }
 * ```
 *
 * @example
 * ```ts
 * // 投了する
 * const game = createGame(19);
 * const result = playMove(game, { type: "resign" });
 * if (result.success) {
 *   console.log(result.state.isOver); // true
 *   console.log(result.state.winner); // "white" (黒が投了したので白の勝ち)
 * }
 * ```
 *
 * @example
 * ```ts
 * // 無効な着手（既に石がある位置）
 * let game = createGame(19);
 * game = playMove(game, { type: "play", position: { x: 3, y: 3 } }).state!;
 * const result = playMove(game, { type: "play", position: { x: 3, y: 3 } });
 * console.log(result.success); // false
 * console.log(result.error); // "occupied"
 * ```
 */
export function playMove(state: GameState, move: Move): MoveResult {
  // ゲーム終了済みならエラー
  if (state.isOver) {
    return { success: false, error: "game_over" };
  }

  const currentColor = state.currentPlayer;
  const nextColor: Color = currentColor === "black" ? "white" : "black";

  switch (move.type) {
    case "resign":
      return {
        success: true,
        state: {
          ...state,
          lastMove: { ...move, color: currentColor },
          moveCount: state.moveCount + 1,
          isOver: true,
          winner: nextColor,
        },
      };

    case "pass": {
      // 2連続パスで終局
      const isConsecutivePass = state.lastMove?.type === "pass";
      const isOver = isConsecutivePass;
      let winner: Color | "draw" | null = null;

      if (isOver) {
        // 終局時に石数で勝敗判定
        if (state.stoneCount.black > state.stoneCount.white) {
          winner = "black";
        } else if (state.stoneCount.white > state.stoneCount.black) {
          winner = "white";
        } else {
          winner = "draw";
        }
      }

      return {
        success: true,
        state: {
          ...state,
          currentPlayer: nextColor,
          koPoint: null,
          moveCount: state.moveCount + 1,
          lastMove: { ...move, color: currentColor },
          isOver,
          winner,
        },
      };
    }

    case "play": {
      const position = move.position;

      // 1. invalid_position チェック
      if (!isValidPosition(state.size, position)) {
        return { success: false, error: "invalid_position" };
      }

      // 2. occupied チェック
      if (state.board[position.y][position.x] !== null) {
        return { success: false, error: "occupied" };
      }

      // 3. コウルールチェック
      if (state.koPoint !== null) {
        if (position.x === state.koPoint.x && position.y === state.koPoint.y) {
          return { success: false, error: "ko" };
        }
      }

      // 4. 仮配置して自殺手チェック
      if (wouldBeSuicide(state.board as Cell[][], position, currentColor)) {
        return { success: false, error: "suicide" };
      }

      // 5. 石を配置
      let newBoard = placeStone(state.board as Cell[][], position, currentColor);

      // 6. 相手の石を取る処理
      const { board: boardAfterCapture, captured } = captureStones(
        newBoard,
        position,
        currentColor
      );
      newBoard = boardAfterCapture;

      // 7. コウチェック（1石取って1石残る場合のみkoPoint設定）
      let newKoPoint: typeof state.koPoint = null;
      if (captured.length === 1) {
        // 1石取った場合、自分の石が1石だけかチェック
        const myGroupSize = countStonesInGroup(newBoard, position);
        if (myGroupSize === 1) {
          // コウの可能性がある位置を記録
          newKoPoint = captured[0];
        }
      }

      // 8. stoneCountを差分更新
      const newStoneCount = {
        black: state.stoneCount.black,
        white: state.stoneCount.white,
      };

      // 自分の石を1つ追加
      if (currentColor === "black") {
        newStoneCount.black += 1;
      } else {
        newStoneCount.white += 1;
      }

      // 取った石の分を減らす
      if (captured.length > 0) {
        const capturedColor = nextColor; // 相手の色
        if (capturedColor === "black") {
          newStoneCount.black -= captured.length;
        } else {
          newStoneCount.white -= captured.length;
        }
      }

      // 9. 手番交代
      return {
        success: true,
        state: {
          ...state,
          board: newBoard,
          currentPlayer: nextColor,
          koPoint: newKoPoint,
          moveCount: state.moveCount + 1,
          lastMove: { ...move, color: currentColor },
          stoneCount: newStoneCount,
        },
      };
    }

    default: {
      // Exhaustive check: すべてのケースを網羅していることを保証
      throw new Error(`Unexpected move type: ${JSON.stringify(move satisfies never)}`);
    }
  }
}

/**
 * 指定位置のグループに含まれる石の数を数えます。
 *
 * コウの判定に使用される内部関数です。
 * 深さ優先探索（DFS）を使用して、同じ色で連結している石の数を数えます。
 * 指定位置に石がない場合は0を返します。
 *
 * @internal
 * @param board - 盤面
 * @param position - 基準となる座標（0-indexed）{@link Position}
 * @returns グループ内の石の数。石がない場合は0
 *
 * @example
 * ```ts
 * const board = createEmptyBoard(19);
 * board = placeStone(board, { x: 3, y: 3 }, "black");
 * board = placeStone(board, { x: 4, y: 3 }, "black");
 * const count = countStonesInGroup(board, { x: 3, y: 3 });
 * console.log(count); // 2
 * ```
 */
function countStonesInGroup(
  board: ReadonlyArray<ReadonlyArray<Color | null>>,
  position: { readonly x: number; readonly y: number }
): number {
  const color = board[position.y]?.[position.x];
  if (color === null || color === undefined) {
    return 0;
  }

  const size = board.length;
  const visited = new Set<string>();
  const stack: Array<{ x: number; y: number }> = [position];
  let count = 0;

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    const key = `${current.x},${current.y}`;
    if (visited.has(key)) continue;

    visited.add(key);

    if (board[current.y]?.[current.x] === color) {
      count++;

      const directions = [
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
      ];

      for (const dir of directions) {
        const newPos = { x: current.x + dir.x, y: current.y + dir.y };
        if (newPos.x >= 0 && newPos.x < size && newPos.y >= 0 && newPos.y < size) {
          const neighborKey = `${newPos.x},${newPos.y}`;
          if (!visited.has(neighborKey)) {
            stack.push(newPos);
          }
        }
      }
    }
  }

  return count;
}
