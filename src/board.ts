import type { Cell, Color, Position } from "./types.js";


/**
 * 指定サイズの空の盤面を作成
 * @param size 盤面のサイズ
 * @returns すべてのセルがnullで初期化された2次元配列
 */
export function createEmptyBoard(size: number): Cell[][] {

  return Array.from({ length: size }, () => Array(size).fill(null));
}

/**
 * 座標が盤面内かどうかを検証
 * @param size 盤面のサイズ
 * @param position 検証する座標（0-indexed）
 * @returns 座標が盤面内ならtrue
 */
export function isValidPosition(size: number, position: Position): boolean {
  return position.x >= 0 && position.x < size && position.y >= 0 && position.y < size;
}

/**
 * 指定位置に石を配置した新しい盤面を返す（イミュータブル）
 * @param board 現在の盤面
 * @param position 石を配置する座標（0-indexed）
 * @param color 配置する石の色
 * @returns 石を配置した新しい盤面（構造共有）
 */
export function placeStone(board: Cell[][], position: Position, color: Color): Cell[][] {
  const newBoard = [...board];
  newBoard[position.y] = [...board[position.y]];
  newBoard[position.y][position.x] = color;
  return newBoard;
}

/**
 * 指定位置の隣接4方向（上下左右）の座標を返す
 * @param size 盤面のサイズ
 * @param position 基準となる座標（0-indexed）
 * @returns 盤面内の隣接座標の配列（0-indexed）
 */
export function getNeighbors(size: number, position: Position): Position[] {
  const neighbors: Position[] = [];
  const directions = [
    { x: 0, y: -1 }, // 上
    { x: 1, y: 0 }, // 右
    { x: 0, y: 1 }, // 下
    { x: -1, y: 0 }, // 左
  ];

  for (const dir of directions) {
    const newPos = { x: position.x + dir.x, y: position.y + dir.y };
    if (isValidPosition(size, newPos)) {
      neighbors.push(newPos);
    }
  }

  return neighbors;
}

/**
 * 指定位置の石と連結しているグループを取得
 * @param board 盤面
 * @param position 基準となる座標（0-indexed）
 * @returns グループに属する座標の配列（0-indexed）
 */
export function findGroup(board: Cell[][], position: Position): Position[] {
  const color = board[position.y]?.[position.x];
  if (color === null || color === undefined) {
    return [];
  }

  const size = board.length;
  const group: Position[] = [];
  const visited = new Set<string>();
  const stack: Position[] = [position];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    const key = `${current.x},${current.y}`;
    if (visited.has(key)) continue;

    visited.add(key);

    if (board[current.y]?.[current.x] === color) {
      group.push(current);

      for (const neighbor of getNeighbors(size, current)) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        if (!visited.has(neighborKey)) {
          stack.push(neighbor);
        }
      }
    }
  }

  return group;
}

/**
 * 指定位置の石グループの呼吸点（自由度）を計算
 * @param board 盤面
 * @param position 基準となる座標（0-indexed）
 * @returns グループ全体の空点の数
 */
export function countLiberties(board: Cell[][], position: Position): number {
  const group = findGroup(board, position);
  const size = board.length;
  const liberties = new Set<string>();

  for (const pos of group) {
    for (const neighbor of getNeighbors(size, pos)) {
      if (board[neighbor.y][neighbor.x] === null) {
        liberties.add(`${neighbor.x},${neighbor.y}`);
      }
    }
  }

  return liberties.size;
}

/**
 * 指定位置の石を削除した新しい盤面を返す（イミュータブル）
 * @param board 現在の盤面
 * @param positions 削除する石の座標配列（0-indexed）
 * @returns 石を削除した新しい盤面（構造共有）
 */
export function removeStones(board: Cell[][], positions: Position[]): Cell[][] {
  if (positions.length === 0) {
    return board;
  }

  const newBoard = [...board];
  const rowsToUpdate = new Set(positions.map((p) => p.y));

  for (const y of rowsToUpdate) {
    newBoard[y] = [...board[y]];
  }

  for (const pos of positions) {
    newBoard[pos.y][pos.x] = null;
  }

  return newBoard;
}

/**
 * 最後の着手後に取れる相手の石を検出して削除
 * @param board 盤面
 * @param lastMove 最後の着手位置（0-indexed）
 * @param color 着手した石の色
 * @returns 取った石の位置（0-indexed）と新しい盤面
 */
export function captureStones(
  board: Cell[][],
  lastMove: Position,
  color: Color
): { board: Cell[][]; captured: Position[] } {
  const size = board.length;
  const opponentColor: Color = color === "black" ? "white" : "black";
  const captured: Position[] = [];

  for (const neighbor of getNeighbors(size, lastMove)) {
    if (board[neighbor.y][neighbor.x] === opponentColor) {
      if (countLiberties(board, neighbor) === 0) {
        const group = findGroup(board, neighbor);
        captured.push(...group);
      }
    }
  }

  // 重複を除去
  const uniqueCaptured = Array.from(new Map(captured.map((p) => [`${p.x},${p.y}`, p])).values());

  return {
    board: removeStones(board, uniqueCaptured),
    captured: uniqueCaptured,
  };
}

/**
 * 指定位置への着手が自殺手かどうかを判定
 * @param board 盤面
 * @param position 着手位置（0-indexed）
 * @param color 着手する石の色
 * @returns 自殺手ならtrue
 */
export function wouldBeSuicide(board: Cell[][], position: Position, color: Color): boolean {
  // 仮に石を置いてみる
  const testBoard = placeStone(board, position, color);

  // 相手の石を取れるかチェック
  const { captured } = captureStones(testBoard, position, color);
  if (captured.length > 0) {
    // 相手の石を取れるなら自殺手ではない
    return false;
  }

  // 自分のグループの呼吸点が0なら自殺手
  return countLiberties(testBoard, position) === 0;
}

/**
 * 盤面上の黒石と白石の数を数える
 * @param board 盤面
 * @returns 黒石と白石の数
 */
export function countStones(board: Cell[][]): { black: number; white: number } {
  let black = 0;
  let white = 0;

  for (const row of board) {
    for (const cell of row) {
      if (cell === "black") {
        black++;
      } else if (cell === "white") {
        white++;
      }
    }
  }

  return { black, white };
}
