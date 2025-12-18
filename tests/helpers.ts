import type { Cell, GameState } from '../src/types';

/**
 * 文字列から盤面を生成するヘルパー関数
 *
 * @param str - 盤面を表す文字列。以下の形式で記述:
 *   - 各セルをスペースで区切る
 *   - 先頭行に列番号を記述（任意）
 *   - 各行の先頭に行番号を記述（任意）
 *   - セル記号:
 *     - '.' : 空のセル (null)
 *     - 'B' : 黒石 ("black")
 *     - 'W' : 白石 ("white")
 *
 * @returns 盤面の2次元配列
 *
 * @example
 * ```ts
 * const board = createBoardFromString(`
 *     0 1 2 3 4
 *   0 . B . W .
 *   1 . . B . .
 *   2 B . . . .
 *   3 . W . B .
 *   4 . . . . .
 * `);
 * // board[0][1] === "black"
 * // board[0][3] === "white"
 * ```
 */
export function createBoardFromString(str: string): Cell[][] {
  // 前後の空白・改行を削除して行に分割
  const lines = str.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length === 0) {
    throw new Error('Empty board string');
  }
  
  // 最初の行が座標行かどうかを判定
  // (数字とスペースのみで構成されている場合は座標行とみなす)
  let startLineIndex = 0;
  const firstLine = lines[0];
  if (/^[\d\s]+$/.test(firstLine)) {
    startLineIndex = 1;
  }
  
  // 盤面データ行を抽出
  const boardLines = lines.slice(startLineIndex);
  
  if (boardLines.length === 0) {
    throw new Error('No board data found');
  }
  
  // 各行をパース
  const board: Cell[][] = [];
  for (const line of boardLines) {
    // スペースで分割
    const parts = line.split(/\s+/);
    
    // 最初の要素が数字（行番号）の場合はスキップ
    let startIndex = 0;
    if (parts.length > 0 && /^\d+$/.test(parts[0])) {
      startIndex = 1;
    }
    
    // セルデータを抽出
    const cellParts = parts.slice(startIndex);
    
    // セルが1つもない場合はスキップ
    if (cellParts.length === 0) {
      continue;
    }
    
    const row: Cell[] = [];
    for (const part of cellParts) {
      // スペース区切りの場合、各partは1文字のはず
      // 従来形式（スペースなし）の場合、各文字を個別に処理
      for (const char of part) {
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
    }
    
    board.push(row);
  }
  
  if (board.length === 0) {
    throw new Error('No valid board rows found');
  }
  
  // 盤面サイズを決定（最初の行の長さ）
  const size = board[0].length;
  
  // すべての行が同じ長さかチェック
  for (let i = 0; i < board.length; i++) {
    if (board[i].length !== size) {
      throw new Error(`All lines must have the same length. Expected ${size}, got ${board[i].length} at line ${i}`);
    }
  }
  
  // 行数と列数が一致するかチェック
  if (board.length !== size) {
    throw new Error(`Board must be square. Expected ${size} rows, got ${board.length}`);
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
 *     0 1 2 3 4
 *   0 . B . W .
 *   1 . . B . .
 *   2 B . . . .
 *   3 . W . B .
 *   4 . . . . .
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
