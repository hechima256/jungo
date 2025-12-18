import type { Cell, GameState } from '../src/types';

/**
 * 文字列から盤面を生成するヘルパー関数
 * 
 * @param str - 盤面を表す文字列。各行は改行で区切られ、各セルは以下の文字で表現される:
 *   - '.' : 空のセル (null)
 *   - 'B' : 黒石 ("black")
 *   - 'W' : 白石 ("white")
 * 
 * @returns 盤面の2次元配列
 * 
 * @example
 * ```ts
 * const board = createBoardFromString(`
 * .B.W.
 * ..B..
 * B....
 * .W.B.
 * .....
 * `);
 * // board[0][1] === "black"
 * // board[0][3] === "white"
 * ```
 */
export function createBoardFromString(str: string): Cell[][] {
  // 前後の空白・改行を削除して行に分割
  const lines = str.trim().split('\n').map(line => line.trim());
  
  // 盤面サイズを決定（最初の行の長さ）
  const size = lines[0]?.length || 0;
  
  // すべての行が同じ長さかチェック
  for (const line of lines) {
    if (line.length !== size) {
      throw new Error(`All lines must have the same length. Expected ${size}, got ${line.length}`);
    }
  }
  
  // 行数と列数が一致するかチェック
  if (lines.length !== size) {
    throw new Error(`Board must be square. Expected ${size} rows, got ${lines.length}`);
  }
  
  // 盤面を構築
  const board: Cell[][] = [];
  for (const line of lines) {
    const row: Cell[] = [];
    for (const char of line) {
      switch (char) {
        case '.':
          row.push(null);
          break;
        case 'B':
          row.push('black');
          break;
        case 'W':
          row.push('white');
          break;
        default:
          throw new Error(`Invalid character '${char}'. Use '.', 'B', or 'W'.`);
      }
    }
    board.push(row);
  }
  
  return board;
}

/**
 * 盤面からGameStateを生成するヘルパー関数
 * 
 * @param board - 盤面の2次元配列
 * @param options - ゲーム状態のオプション設定
 * @param options.currentPlayer - 現在の手番 (デフォルト: "black")
 * @param options.koPoint - コウの位置 (デフォルト: null)
 * @param options.moveCount - 手数 (デフォルト: 盤面の石数)
 * @param options.isOver - ゲーム終了フラグ (デフォルト: false)
 * @param options.winner - 勝者 (デフォルト: null)
 * 
 * @returns GameState オブジェクト
 * 
 * @example
 * ```ts
 * const board = createBoardFromString(`
 * .B.W.
 * ..B..
 * B....
 * .W.B.
 * .....
 * `);
 * const game = createGameFromBoard(board, { currentPlayer: 'white' });
 * ```
 */
export function createGameFromBoard(
  board: Cell[][], 
  options?: {
    currentPlayer?: 'black' | 'white';
    koPoint?: { x: number; y: number } | null;
    moveCount?: number;
    isOver?: boolean;
    winner?: 'black' | 'white' | 'draw' | null;
  }
): GameState {
  const size = board.length;
  
  // 石数をカウント
  let blackCount = 0;
  let whiteCount = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === 'black') blackCount++;
      if (cell === 'white') whiteCount++;
    }
  }
  
  // デフォルト値を設定
  const currentPlayer = options?.currentPlayer ?? 'black';
  const koPoint = options?.koPoint ?? null;
  const moveCount = options?.moveCount ?? (blackCount + whiteCount);
  const isOver = options?.isOver ?? false;
  const winner = options?.winner ?? null;
  
  return {
    board,
    size,
    currentPlayer,
    koPoint,
    moveCount,
    lastMove: null,
    isOver,
    winner,
    stoneCount: { black: blackCount, white: whiteCount },
  };
}
