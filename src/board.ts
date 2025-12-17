import type { Cell, Color, Position } from "./types.js";

/**
 * 指定サイズの空の盤面を作成します。
 *
 * 新しいゲームを開始する際に使用します。
 * 返される盤面は、すべてのセルがnullで初期化された2次元配列です。
 *
 * @internal
 * @param size - 盤面のサイズ（通常は7, 9）
 * @returns すべてのセルがnullで初期化された2次元配列
 *
 * @example
 * ```typescript
 * const board = createEmptyBoard(19);
 * console.log(board.length); // 19
 * console.log(board[0][0]); // null
 * ```
 */
export function createEmptyBoard(size: number): Cell[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

/**
 * 座標が盤面内かどうかを検証します。
 *
 * 着手や座標アクセスの前に、座標の有効性を確認するために使用します。
 * 0-indexedの座標系を使用しているため、有効な範囲は0以上size未満です。
 *
 * @internal
 * @param size - 盤面のサイズ
 * @param position - 検証する座標（0-indexed）{@link Position}
 * @returns 座標が盤面内ならtrue、そうでなければfalse
 *
 * @example
 * ```typescript
 * const size = 19;
 * isValidPosition(size, { x: 0, y: 0 }); // true
 * isValidPosition(size, { x: 19, y: 0 }); // false
 * isValidPosition(size, { x: -1, y: 0 }); // false
 * ```
 */
export function isValidPosition(size: number, position: Position): boolean {
  return position.x >= 0 && position.x < size && position.y >= 0 && position.y < size;
}

/**
 * 指定位置に石を配置した新しい盤面を返します（イミュータブル）。
 *
 * 元の盤面は変更せず、新しい盤面を返します。
 * 構造共有を利用して効率的にメモリを使用しています。
 * 変更された行のみが新しく作成されます。
 *
 * @internal
 * @param board - 現在の盤面
 * @param position - 石を配置する座標（0-indexed）{@link Position}
 * @param color - 配置する石の色 {@link Color}
 * @returns 石を配置した新しい盤面（構造共有により元の盤面と一部のメモリを共有）
 *
 * @example
 * ```typescript
 * const board = createEmptyBoard(19);
 * const newBoard = placeStone(board, { x: 3, y: 3 }, "black");
 * console.log(newBoard[3][3]); // "black"
 * console.log(board[3][3]); // null (元の盤面は変更されない)
 * ```
 */
export function placeStone(board: Cell[][], position: Position, color: Color): Cell[][] {
  const newBoard = [...board];
  newBoard[position.y] = [...board[position.y]];
  newBoard[position.y][position.x] = color;
  return newBoard;
}

/**
 * 指定位置の隣接4方向（上下左右）の座標を返します。
 *
 * 隣接する座標を取得する際に使用します。
 * 盤面外の座標は含まれません。
 * 斜め方向は含まれず、上下左右のみが対象です。
 *
 * @internal
 * @param size - 盤面のサイズ
 * @param position - 基準となる座標（0-indexed）{@link Position}
 * @returns 盤面内の隣接座標の配列（0-indexed）{@link Position}の配列
 *
 * @example
 * ```typescript
 * const size = 19;
 * // 中央の場合は4つの隣接座標が返される
 * getNeighbors(size, { x: 3, y: 3 }); // [{ x: 3, y: 2 }, { x: 4, y: 3 }, { x: 3, y: 4 }, { x: 2, y: 3 }]
 *
 * // 角の場合は2つの隣接座標のみ
 * getNeighbors(size, { x: 0, y: 0 }); // [{ x: 1, y: 0 }, { x: 0, y: 1 }]
 * ```
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
 * 指定位置の石と連結しているグループを取得します。
 *
 * 同じ色の石が上下左右で連結している連を探索します。
 * 深さ優先探索（DFS）を使用して効率的に連を検出します。
 * 指定位置に石がない場合は空の配列を返します。
 *
 * @internal
 * @param board - 盤面
 * @param position - 基準となる座標（0-indexed）{@link Position}
 * @returns グループに属する座標の配列（0-indexed）{@link Position}の配列。石がない場合は空配列
 *
 * @example
 * ```typescript
 * const board = createEmptyBoard(19);
 * board = placeStone(board, { x: 3, y: 3 }, "black");
 * board = placeStone(board, { x: 4, y: 3 }, "black");
 * board = placeStone(board, { x: 5, y: 3 }, "black");
 *
 * const group = findGroup(board, { x: 3, y: 3 });
 * console.log(group.length); // 3 (連結している黒石3つ)
 * ```
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
 * 指定位置の石グループの呼吸点（自由度）を計算します。
 *
 * 石グループに隣接する空点の数を数えます。
 * 呼吸点が0になると、その石グループは取られます。
 * {@link findGroup}を使用してグループを特定し、その周囲の空点を数えます。
 *
 * @internal
 * @param board - 盤面
 * @param position - 基準となる座標（0-indexed）{@link Position}
 * @returns グループ全体の空点（呼吸点）の数。石がない場合は0
 *
 * @example
 * ```typescript
 * const board = createEmptyBoard(19);
 * board = placeStone(board, { x: 3, y: 3 }, "black");
 *
 * const liberties = countLiberties(board, { x: 3, y: 3 });
 * console.log(liberties); // 4 (上下左右が全て空点)
 * ```
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
 * 指定位置の石を削除した新しい盤面を返します（イミュータブル）。
 *
 * 元の盤面は変更せず、新しい盤面を返します。
 * 構造共有を利用し、変更された行のみを新しく作成します。
 * 空の配列が渡された場合は、元の盤面をそのまま返します。
 *
 * @internal
 * @param board - 現在の盤面
 * @param positions - 削除する石の座標配列（0-indexed）{@link Position}の配列
 * @returns 石を削除した新しい盤面（構造共有により元の盤面と一部のメモリを共有）
 *
 * @example
 * ```typescript
 * const board = createEmptyBoard(19);
 * board = placeStone(board, { x: 3, y: 3 }, "black");
 * board = placeStone(board, { x: 4, y: 3 }, "black");
 *
 * const newBoard = removeStones(board, [{ x: 3, y: 3 }]);
 * console.log(newBoard[3][3]); // null
 * console.log(newBoard[4][3]); // "black"
 * ```
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
 * 最後の着手後に取れる相手の石を検出して削除します。
 *
 * 着手後、その着手に隣接する相手の石グループの呼吸点を確認し、
 * 呼吸点が0になったグループを盤面から取り除きます。
 * 複数のグループが同時に取られる場合もあります。
 * 重複する座標は自動的に除去されます。
 *
 * @internal
 * @param board - 盤面
 * @param lastMove - 最後の着手位置（0-indexed）{@link Position}
 * @param color - 着手した石の色 {@link Color}
 * @returns 取った石の位置（0-indexed）{@link Position}の配列と新しい盤面のオブジェクト
 *
 * @example
 * ```typescript
 * const board = createEmptyBoard(19);
 * // 白石を囲む
 * board = placeStone(board, { x: 3, y: 3 }, "white");
 * board = placeStone(board, { x: 2, y: 3 }, "black");
 * board = placeStone(board, { x: 4, y: 3 }, "black");
 * board = placeStone(board, { x: 3, y: 2 }, "black");
 *
 * // 最後の一手で白石を取る
 * const result = captureStones(board, { x: 3, y: 4 }, "black");
 * console.log(result.captured.length); // 1 (白石が1つ取られた)
 * ```
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
 * 指定位置への着手が自殺手かどうかを判定します。
 *
 * 自殺手とは、着手した結果、自分の石グループの呼吸点が0になる手のことです。
 * ただし、相手の石を取れる場合は自殺手にはなりません。
 * この関数は仮想的に石を置いてシミュレーションすることで判定します。
 *
 * @internal
 * @param board - 盤面
 * @param position - 着手位置（0-indexed）{@link Position}
 * @param color - 着手する石の色 {@link Color}
 * @returns 自殺手ならtrue、そうでなければfalse
 *
 * @example
 * ```typescript
 * const board = createEmptyBoard(19);
 * // 相手に完全に囲まれた位置
 * board = placeStone(board, { x: 2, y: 3 }, "white");
 * board = placeStone(board, { x: 4, y: 3 }, "white");
 * board = placeStone(board, { x: 3, y: 2 }, "white");
 * board = placeStone(board, { x: 3, y: 4 }, "white");
 *
 * const isSuicide = wouldBeSuicide(board, { x: 3, y: 3 }, "black");
 * console.log(isSuicide); // true (呼吸点が0になる)
 * ```
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
 * 盤面上の黒石と白石の数を数えます。
 *
 * 盤面全体をスキャンして、黒石と白石の総数を集計します。
 * 終局時の地の計算や、ゲームの進行状況を把握する際に使用します。
 *
 * @internal
 * @param board - 盤面
 * @returns 黒石と白石の数を含むオブジェクト `{ black: number, white: number }`
 *
 * @example
 * ```typescript
 * const board = createEmptyBoard(19);
 * board = placeStone(board, { x: 3, y: 3 }, "black");
 * board = placeStone(board, { x: 4, y: 3 }, "black");
 * board = placeStone(board, { x: 5, y: 3 }, "white");
 *
 * const count = countStones(board);
 * console.log(count); // { black: 2, white: 1 }
 * ```
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
