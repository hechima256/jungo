import { describe, expect, it } from "vitest";
import {
  captureStones,
  countLiberties,
  countStones,
  createEmptyBoard,
  findGroup,
  getNeighbors,
  isValidPosition,
  placeStone,
  removeStones,
  wouldBeSuicide,
} from "../src/board.js";

describe("createEmptyBoard", () => {
  describe("正常系", () => {
    it.each([2, 7, 9, 13, 19])("%i路盤が作成できること", (size) => {
      const board = createEmptyBoard(size);
      expect(board).toHaveLength(size);
      expect(board[0]).toHaveLength(size);
    });

    it("全てのセルがnullであること", () => {
      const board = createEmptyBoard(9);
      for (const row of board) {
        for (const cell of row) {
          expect(cell).toBeNull();
        }
      }
    });
  });
});

describe("isValidPosition", () => {
  it("盤内の座標でtrueを返すこと", () => {
    expect(isValidPosition(9, { x: 0, y: 0 })).toBe(true);
    expect(isValidPosition(9, { x: 4, y: 4 })).toBe(true);
    expect(isValidPosition(9, { x: 8, y: 8 })).toBe(true);
  });

  it("負の座標でfalseを返すこと", () => {
    expect(isValidPosition(9, { x: -1, y: 0 })).toBe(false);
    expect(isValidPosition(9, { x: 0, y: -1 })).toBe(false);
    expect(isValidPosition(9, { x: -1, y: -1 })).toBe(false);
  });

  it("盤サイズ以上の座標でfalseを返すこと", () => {
    expect(isValidPosition(9, { x: 9, y: 0 })).toBe(false);
    expect(isValidPosition(9, { x: 0, y: 9 })).toBe(false);
    expect(isValidPosition(9, { x: 9, y: 9 })).toBe(false);
  });
});

describe("placeStone", () => {
  it("正しく石が配置されること", () => {
    const board = createEmptyBoard(9);
    const newBoard = placeStone(board, { x: 4, y: 4 }, "black");
    expect(newBoard[4][4]).toBe("black");
  });

  it("イミュータブル性：元の盤面が変更されないこと", () => {
    const board = createEmptyBoard(9);
    const newBoard = placeStone(board, { x: 4, y: 4 }, "black");
    expect(board[4][4]).toBeNull();
    expect(newBoard[4][4]).toBe("black");
  });

  it("構造共有：変更されていない行が同一参照であること", () => {
    const board = createEmptyBoard(9);
    const newBoard = placeStone(board, { x: 4, y: 4 }, "black");
    expect(newBoard[0]).toBe(board[0]);
    expect(newBoard[3]).toBe(board[3]);
    expect(newBoard[4]).not.toBe(board[4]);
  });

  it("複数の石を配置できること", () => {
    const board = createEmptyBoard(9);
    const board1 = placeStone(board, { x: 0, y: 0 }, "black");
    const board2 = placeStone(board1, { x: 1, y: 1 }, "white");
    expect(board2[0][0]).toBe("black");
    expect(board2[1][1]).toBe("white");
  });
});

describe("getNeighbors", () => {
  it("中央の座標で4方向の隣接座標が返ること", () => {
    const neighbors = getNeighbors(9, { x: 4, y: 4 });
    expect(neighbors).toHaveLength(4);
    expect(neighbors).toContainEqual({ x: 4, y: 3 }); // 上
    expect(neighbors).toContainEqual({ x: 5, y: 4 }); // 右
    expect(neighbors).toContainEqual({ x: 4, y: 5 }); // 下
    expect(neighbors).toContainEqual({ x: 3, y: 4 }); // 左
  });

  it("左上角の座標で2方向の隣接座標が返ること", () => {
    const neighbors = getNeighbors(9, { x: 0, y: 0 });
    expect(neighbors).toHaveLength(2);
    expect(neighbors).toContainEqual({ x: 1, y: 0 }); // 右
    expect(neighbors).toContainEqual({ x: 0, y: 1 }); // 下
  });

  it("右下角の座標で2方向の隣接座標が返ること", () => {
    const neighbors = getNeighbors(9, { x: 8, y: 8 });
    expect(neighbors).toHaveLength(2);
    expect(neighbors).toContainEqual({ x: 8, y: 7 }); // 上
    expect(neighbors).toContainEqual({ x: 7, y: 8 }); // 左
  });

  it("辺の座標で3方向の隣接座標が返ること", () => {
    const neighbors = getNeighbors(9, { x: 4, y: 0 });
    expect(neighbors).toHaveLength(3);
    expect(neighbors).toContainEqual({ x: 5, y: 0 }); // 右
    expect(neighbors).toContainEqual({ x: 4, y: 1 }); // 下
    expect(neighbors).toContainEqual({ x: 3, y: 0 }); // 左
  });
});

describe("findGroup", () => {
  it("単独の石で1つの要素を返すこと", () => {
    const board = placeStone(createEmptyBoard(9), { x: 4, y: 4 }, "black");
    const group = findGroup(board, { x: 4, y: 4 });
    expect(group).toHaveLength(1);
    expect(group).toContainEqual({ x: 4, y: 4 });
  });

  it("空のセルで空配列を返すこと", () => {
    const board = createEmptyBoard(9);
    const group = findGroup(board, { x: 4, y: 4 });
    expect(group).toHaveLength(0);
  });

  it("2つ連結した石グループを正しく検出すること", () => {
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 4 }, "black");
    const group = findGroup(board, { x: 4, y: 4 });
    expect(group).toHaveLength(2);
    expect(group).toContainEqual({ x: 4, y: 4 });
    expect(group).toContainEqual({ x: 5, y: 4 });
  });

  it("L字型の連結グループを正しく検出すること", () => {
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 5 }, "black");
    const group = findGroup(board, { x: 4, y: 4 });
    expect(group).toHaveLength(3);
    expect(group).toContainEqual({ x: 4, y: 4 });
    expect(group).toContainEqual({ x: 5, y: 4 });
    expect(group).toContainEqual({ x: 5, y: 5 });
  });

  it("大きなグループを正しく検出すること", () => {
    let board = createEmptyBoard(9);
    // 5つの石を縦に並べる
    for (let y = 0; y < 5; y++) {
      board = placeStone(board, { x: 4, y }, "white");
    }
    const group = findGroup(board, { x: 4, y: 2 });
    expect(group).toHaveLength(5);
  });

  it("異なる色の石は別グループとして扱うこと", () => {
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 4 }, "white");
    const group = findGroup(board, { x: 4, y: 4 });
    expect(group).toHaveLength(1);
    expect(group).toContainEqual({ x: 4, y: 4 });
  });
});

describe("countLiberties", () => {
  it("中央の単独の石で4つの呼吸点を返すこと", () => {
    const board = placeStone(createEmptyBoard(9), { x: 4, y: 4 }, "black");
    const liberties = countLiberties(board, { x: 4, y: 4 });
    expect(liberties).toBe(4);
  });

  it("角の単独の石で2つの呼吸点を返すこと", () => {
    const board = placeStone(createEmptyBoard(9), { x: 0, y: 0 }, "black");
    const liberties = countLiberties(board, { x: 0, y: 0 });
    expect(liberties).toBe(2);
  });

  it("2つ連結した石グループで6つの呼吸点を返すこと", () => {
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 4 }, "black");
    const liberties = countLiberties(board, { x: 4, y: 4 });
    expect(liberties).toBe(6);
  });

  it("囲まれたグループで呼吸点0を返すこと", () => {
    let board = createEmptyBoard(9);
    // 中央に白石を置く
    board = placeStone(board, { x: 4, y: 4 }, "white");
    // 周囲を黒石で囲む
    board = placeStone(board, { x: 4, y: 3 }, "black");
    board = placeStone(board, { x: 5, y: 4 }, "black");
    board = placeStone(board, { x: 4, y: 5 }, "black");
    board = placeStone(board, { x: 3, y: 4 }, "black");
    const liberties = countLiberties(board, { x: 4, y: 4 });
    expect(liberties).toBe(0);
  });

  it("L字型グループの呼吸点を正しくカウントすること", () => {
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 5 }, "black");
    const liberties = countLiberties(board, { x: 4, y: 4 });
    expect(liberties).toBe(7);
  });

  it("敵の石で一部囲まれたグループの呼吸点を正しくカウントすること", () => {
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    board = placeStone(board, { x: 4, y: 3 }, "white"); // 上に白石
    const liberties = countLiberties(board, { x: 4, y: 4 });
    expect(liberties).toBe(3); // 右、下、左のみ
  });
});

describe("removeStones", () => {
  it("指定位置の石が削除されること", () => {
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    const newBoard = removeStones(board, [{ x: 4, y: 4 }]);
    expect(newBoard[4][4]).toBeNull();
  });

  it("イミュータブル性：元の盤面が変更されないこと", () => {
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    const newBoard = removeStones(board, [{ x: 4, y: 4 }]);
    expect(board[4][4]).toBe("black");
    expect(newBoard[4][4]).toBeNull();
  });

  it("複数の石を削除できること", () => {
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 5 }, "white");
    const newBoard = removeStones(board, [
      { x: 4, y: 4 },
      { x: 5, y: 5 },
    ]);
    expect(newBoard[4][4]).toBeNull();
    expect(newBoard[5][5]).toBeNull();
  });

  it("空配列を渡すと盤面がそのまま返ること", () => {
    const board = createEmptyBoard(9);
    const newBoard = removeStones(board, []);
    expect(newBoard).toBe(board);
  });

  it("構造共有：変更されていない行が同一参照であること", () => {
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    const newBoard = removeStones(board, [{ x: 4, y: 4 }]);
    expect(newBoard[0]).toBe(board[0]);
    expect(newBoard[3]).toBe(board[3]);
    expect(newBoard[4]).not.toBe(board[4]);
  });
});

describe("captureStones", () => {
  it("呼吸点0のグループが取られること", () => {
    let board = createEmptyBoard(9);
    // 白石を置く
    board = placeStone(board, { x: 4, y: 4 }, "white");
    // 周囲3方を黒石で囲む
    board = placeStone(board, { x: 4, y: 3 }, "black");
    board = placeStone(board, { x: 5, y: 4 }, "black");
    board = placeStone(board, { x: 3, y: 4 }, "black");
    // 最後の一手を置いてから取る
    board = placeStone(board, { x: 4, y: 5 }, "black");
    const result = captureStones(board, { x: 4, y: 5 }, "black");
    expect(result.captured).toHaveLength(1);
    expect(result.captured).toContainEqual({ x: 4, y: 4 });
    expect(result.board[4][4]).toBeNull();
  });

  it("呼吸点がある場合は取られないこと", () => {
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "white");
    board = placeStone(board, { x: 4, y: 3 }, "black");
    const result = captureStones(board, { x: 4, y: 3 }, "black");
    expect(result.captured).toHaveLength(0);
    expect(result.board[4][4]).toBe("white");
  });

  it("複数の石からなるグループを取れること", () => {
    let board = createEmptyBoard(9);
    // 白石2つを並べる (y=4, x=4,5)
    board = placeStone(board, { x: 4, y: 4 }, "white");
    board = placeStone(board, { x: 5, y: 4 }, "white");
    // 周囲を黒石で囲む
    board = placeStone(board, { x: 4, y: 3 }, "black"); // 上
    board = placeStone(board, { x: 5, y: 3 }, "black"); // 上
    board = placeStone(board, { x: 6, y: 4 }, "black"); // 右
    board = placeStone(board, { x: 5, y: 5 }, "black"); // 下
    board = placeStone(board, { x: 3, y: 4 }, "black"); // 左
    board = placeStone(board, { x: 4, y: 5 }, "black"); // 下
    // 最後の一手で白石2つを取る
    const result = captureStones(board, { x: 4, y: 5 }, "black");
    expect(result.captured).toHaveLength(2);
    expect(result.captured).toContainEqual({ x: 4, y: 4 });
    expect(result.captured).toContainEqual({ x: 5, y: 4 });
    expect(result.board[4][4]).toBeNull();
    expect(result.board[4][5]).toBeNull();
  });

  it("複数の異なるグループを同時に取れること", () => {
    let board = createEmptyBoard(9);
    // 2つの独立した白石
    board = placeStone(board, { x: 3, y: 4 }, "white");
    board = placeStone(board, { x: 5, y: 4 }, "white");
    // 両方を囲む
    board = placeStone(board, { x: 3, y: 3 }, "black");
    board = placeStone(board, { x: 2, y: 4 }, "black");
    board = placeStone(board, { x: 3, y: 5 }, "black");
    board = placeStone(board, { x: 5, y: 3 }, "black");
    board = placeStone(board, { x: 6, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 5 }, "black");
    // 中央に置いて両方を取る
    board = placeStone(board, { x: 4, y: 4 }, "black");
    const result = captureStones(board, { x: 4, y: 4 }, "black");
    expect(result.captured).toHaveLength(2);
    expect(result.board[3][4]).toBeNull();
    expect(result.board[5][4]).toBeNull();
  });

  it("自分の色の石は取られないこと", () => {
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 4 }, "black");
    const result = captureStones(board, { x: 5, y: 4 }, "black");
    expect(result.captured).toHaveLength(0);
    // 取られていないので元の盤面と同じ
    expect(result.board).toBe(board);
  });
});

describe("wouldBeSuicide", () => {
  it("囲まれた位置への着手は自殺手と判定されること", () => {
    let board = createEmptyBoard(9);
    // 4方を白石で囲む
    board = placeStone(board, { x: 4, y: 3 }, "white");
    board = placeStone(board, { x: 5, y: 4 }, "white");
    board = placeStone(board, { x: 4, y: 5 }, "white");
    board = placeStone(board, { x: 3, y: 4 }, "white");
    const isSuicide = wouldBeSuicide(board, { x: 4, y: 4 }, "black");
    expect(isSuicide).toBe(true);
  });

  it("相手を取る手は自殺手でないこと", () => {
    let board = createEmptyBoard(9);
    // 白石を置く
    board = placeStone(board, { x: 4, y: 4 }, "white");
    // 周囲3方を黒石で囲む
    board = placeStone(board, { x: 4, y: 3 }, "black");
    board = placeStone(board, { x: 5, y: 4 }, "black");
    board = placeStone(board, { x: 3, y: 4 }, "black");
    // 最後の一手は白石を取るので自殺手ではない
    const isSuicide = wouldBeSuicide(board, { x: 4, y: 5 }, "black");
    expect(isSuicide).toBe(false);
  });

  it("既存グループと繋がる手は自殺手でないこと", () => {
    let board = createEmptyBoard(9);
    // 黒石のグループを作る
    board = placeStone(board, { x: 5, y: 4 }, "black");
    // 周囲を白石で囲む
    board = placeStone(board, { x: 4, y: 3 }, "white");
    board = placeStone(board, { x: 4, y: 5 }, "white");
    board = placeStone(board, { x: 3, y: 4 }, "white");
    // (4,4)に置くと(5,4)と繋がり、グループとして呼吸点があるので自殺手ではない
    const isSuicide = wouldBeSuicide(board, { x: 4, y: 4 }, "black");
    expect(isSuicide).toBe(false);
  });

  it("呼吸点がある位置は自殺手でないこと", () => {
    const board = createEmptyBoard(9);
    const isSuicide = wouldBeSuicide(board, { x: 4, y: 4 }, "black");
    expect(isSuicide).toBe(false);
  });

  it("角で囲まれた位置は自殺手と判定されること", () => {
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 1, y: 0 }, "white");
    board = placeStone(board, { x: 0, y: 1 }, "white");
    const isSuicide = wouldBeSuicide(board, { x: 0, y: 0 }, "black");
    expect(isSuicide).toBe(true);
  });
});

describe("countStones", () => {
  it("空盤面で0:0を返すこと", () => {
    const board = createEmptyBoard(9);
    const count = countStones(board);
    expect(count).toEqual({ black: 0, white: 0 });
  });

  it("黒石1つを配置した後のカウントが正しいこと", () => {
    const board = placeStone(createEmptyBoard(9), { x: 4, y: 4 }, "black");
    const count = countStones(board);
    expect(count).toEqual({ black: 1, white: 0 });
  });

  it("白石1つを配置した後のカウントが正しいこと", () => {
    const board = placeStone(createEmptyBoard(9), { x: 4, y: 4 }, "white");
    const count = countStones(board);
    expect(count).toEqual({ black: 0, white: 1 });
  });

  it("黒白両方の石を配置した後のカウントが正しいこと", () => {
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 5 }, "white");
    const count = countStones(board);
    expect(count).toEqual({ black: 1, white: 1 });
  });

  it("複数の石を配置した後のカウントが正しいこと", () => {
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 0, y: 0 }, "black");
    board = placeStone(board, { x: 1, y: 1 }, "black");
    board = placeStone(board, { x: 2, y: 2 }, "black");
    board = placeStone(board, { x: 3, y: 3 }, "white");
    board = placeStone(board, { x: 4, y: 4 }, "white");
    const count = countStones(board);
    expect(count).toEqual({ black: 3, white: 2 });
  });

  it("盤面全体に石を配置した後のカウントが正しいこと", () => {
    let board = createEmptyBoard(3);
    board = placeStone(board, { x: 0, y: 0 }, "black");
    board = placeStone(board, { x: 1, y: 0 }, "white");
    board = placeStone(board, { x: 2, y: 0 }, "black");
    board = placeStone(board, { x: 0, y: 1 }, "white");
    board = placeStone(board, { x: 1, y: 1 }, "black");
    board = placeStone(board, { x: 2, y: 1 }, "white");
    board = placeStone(board, { x: 0, y: 2 }, "black");
    board = placeStone(board, { x: 1, y: 2 }, "white");
    board = placeStone(board, { x: 2, y: 2 }, "black");
    const count = countStones(board);
    expect(count).toEqual({ black: 5, white: 4 });
  });
});
