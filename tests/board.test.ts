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
  it.each([
    2, 7, 9, 13, 19,
  ])("Given: 盤面サイズ%iを指定 / When: 空盤面を作成 / Then: 指定サイズの盤面が作成される", (size) => {
    // Arrange - 準備は不要（引数として渡すのみ）

    // Act
    const board = createEmptyBoard(size);

    // Assert
    expect(board).toHaveLength(size);
    expect(board[0]).toHaveLength(size);
  });

  it("Given: 9路盤を作成 / When: 盤面の全セルを確認 / Then: 全てのセルがnullである", () => {
    // Arrange & Act
    const board = createEmptyBoard(9);

    // Assert
    for (const row of board) {
      for (const cell of row) {
        expect(cell).toBeNull();
      }
    }
  });
});

describe("isValidPosition", () => {
  describe("盤内の座標", () => {
    it("Given: 9路盤 / When: 左上角(0,0)の座標を検証 / Then: trueを返す", () => {
      // Arrange
      const size = 9;
      const position = { x: 0, y: 0 };

      // Act
      const result = isValidPosition(size, position);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: 9路盤 / When: 中央(4,4)の座標を検証 / Then: trueを返す", () => {
      // Arrange
      const size = 9;
      const position = { x: 4, y: 4 };

      // Act
      const result = isValidPosition(size, position);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: 9路盤 / When: 右下角(8,8)の座標を検証 / Then: trueを返す", () => {
      // Arrange
      const size = 9;
      const position = { x: 8, y: 8 };

      // Act
      const result = isValidPosition(size, position);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("盤外の座標", () => {
    it("Given: 9路盤 / When: x座標が負(-1,0)の座標を検証 / Then: falseを返す", () => {
      // Arrange
      const size = 9;
      const position = { x: -1, y: 0 };

      // Act
      const result = isValidPosition(size, position);

      // Assert
      expect(result).toBe(false);
    });

    it("Given: 9路盤 / When: y座標が負(0,-1)の座標を検証 / Then: falseを返す", () => {
      // Arrange
      const size = 9;
      const position = { x: 0, y: -1 };

      // Act
      const result = isValidPosition(size, position);

      // Assert
      expect(result).toBe(false);
    });

    it("Given: 9路盤 / When: 両座標が負(-1,-1)の座標を検証 / Then: falseを返す", () => {
      // Arrange
      const size = 9;
      const position = { x: -1, y: -1 };

      // Act
      const result = isValidPosition(size, position);

      // Assert
      expect(result).toBe(false);
    });

    it("Given: 9路盤 / When: x座標が盤サイズ以上(9,0)の座標を検証 / Then: falseを返す", () => {
      // Arrange
      const size = 9;
      const position = { x: 9, y: 0 };

      // Act
      const result = isValidPosition(size, position);

      // Assert
      expect(result).toBe(false);
    });

    it("Given: 9路盤 / When: y座標が盤サイズ以上(0,9)の座標を検証 / Then: falseを返す", () => {
      // Arrange
      const size = 9;
      const position = { x: 0, y: 9 };

      // Act
      const result = isValidPosition(size, position);

      // Assert
      expect(result).toBe(false);
    });

    it("Given: 9路盤 / When: 両座標が盤サイズ以上(9,9)の座標を検証 / Then: falseを返す", () => {
      // Arrange
      const size = 9;
      const position = { x: 9, y: 9 };

      // Act
      const result = isValidPosition(size, position);

      // Assert
      expect(result).toBe(false);
    });
  });
});

describe("placeStone", () => {
  it("Given: 空の9路盤 / When: (4,4)に黒石を配置 / Then: 指定位置に黒石が配置される", () => {
    // Arrange
    const board = createEmptyBoard(9);

    // Act
    const newBoard = placeStone(board, { x: 4, y: 4 }, "black");

    // Assert
    expect(newBoard[4][4]).toBe("black");
  });

  it("Given: 空の9路盤 / When: (4,4)に黒石を配置 / Then: 元の盤面は変更されない（イミュータブル性）", () => {
    // Arrange
    const board = createEmptyBoard(9);

    // Act
    const newBoard = placeStone(board, { x: 4, y: 4 }, "black");

    // Assert
    expect(board[4][4]).toBeNull();
    expect(newBoard[4][4]).toBe("black");
  });

  it("Given: 空の9路盤 / When: (4,4)に黒石を配置 / Then: 変更されていない行は同一参照を保つ（構造共有）", () => {
    // Arrange
    const board = createEmptyBoard(9);

    // Act
    const newBoard = placeStone(board, { x: 4, y: 4 }, "black");

    // Assert
    expect(newBoard[0]).toBe(board[0]);
    expect(newBoard[3]).toBe(board[3]);
    expect(newBoard[4]).not.toBe(board[4]);
  });

  it("Given: 空の9路盤 / When: (0,0)に黒石、(1,1)に白石を順に配置 / Then: 両方の石が正しく配置される", () => {
    // Arrange
    const board = createEmptyBoard(9);

    // Act
    const board1 = placeStone(board, { x: 0, y: 0 }, "black");
    const board2 = placeStone(board1, { x: 1, y: 1 }, "white");

    // Assert
    expect(board2[0][0]).toBe("black");
    expect(board2[1][1]).toBe("white");
  });
});

describe("getNeighbors", () => {
  it("Given: 9路盤 / When: 中央(4,4)の隣接座標を取得 / Then: 4方向の隣接座標が返される", () => {
    // Arrange
    const size = 9;
    const position = { x: 4, y: 4 };

    // Act
    const neighbors = getNeighbors(size, position);

    // Assert
    expect(neighbors).toHaveLength(4);
    expect(neighbors).toContainEqual({ x: 4, y: 3 }); // 上
    expect(neighbors).toContainEqual({ x: 5, y: 4 }); // 右
    expect(neighbors).toContainEqual({ x: 4, y: 5 }); // 下
    expect(neighbors).toContainEqual({ x: 3, y: 4 }); // 左
  });

  it("Given: 9路盤 / When: 左上角(0,0)の隣接座標を取得 / Then: 2方向の隣接座標が返される", () => {
    // Arrange
    const size = 9;
    const position = { x: 0, y: 0 };

    // Act
    const neighbors = getNeighbors(size, position);

    // Assert
    expect(neighbors).toHaveLength(2);
    expect(neighbors).toContainEqual({ x: 1, y: 0 }); // 右
    expect(neighbors).toContainEqual({ x: 0, y: 1 }); // 下
  });

  it("Given: 9路盤 / When: 右下角(8,8)の隣接座標を取得 / Then: 2方向の隣接座標が返される", () => {
    // Arrange
    const size = 9;
    const position = { x: 8, y: 8 };

    // Act
    const neighbors = getNeighbors(size, position);

    // Assert
    expect(neighbors).toHaveLength(2);
    expect(neighbors).toContainEqual({ x: 8, y: 7 }); // 上
    expect(neighbors).toContainEqual({ x: 7, y: 8 }); // 左
  });

  it("Given: 9路盤 / When: 上辺(4,0)の隣接座標を取得 / Then: 3方向の隣接座標が返される", () => {
    // Arrange
    const size = 9;
    const position = { x: 4, y: 0 };

    // Act
    const neighbors = getNeighbors(size, position);

    // Assert
    expect(neighbors).toHaveLength(3);
    expect(neighbors).toContainEqual({ x: 5, y: 0 }); // 右
    expect(neighbors).toContainEqual({ x: 4, y: 1 }); // 下
    expect(neighbors).toContainEqual({ x: 3, y: 0 }); // 左
  });
});

describe("findGroup", () => {
  it("Given: (4,4)に黒石1個が配置された9路盤 / When: (4,4)のグループを検索 / Then: 1個の石を持つグループが返される", () => {
    // Arrange
    const board = placeStone(createEmptyBoard(9), { x: 4, y: 4 }, "black");

    // Act
    const group = findGroup(board, { x: 4, y: 4 });

    // Assert
    expect(group).toHaveLength(1);
    expect(group).toContainEqual({ x: 4, y: 4 });
  });

  it("Given: 空の9路盤 / When: (4,4)のグループを検索 / Then: 空配列が返される", () => {
    // Arrange
    const board = createEmptyBoard(9);

    // Act
    const group = findGroup(board, { x: 4, y: 4 });

    // Assert
    expect(group).toHaveLength(0);
  });

  it("Given: (4,4)と(5,4)に黒石が連結している9路盤 / When: (4,4)のグループを検索 / Then: 2個の石を持つグループが返される", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 4 }, "black");

    // Act
    const group = findGroup(board, { x: 4, y: 4 });

    // Assert
    expect(group).toHaveLength(2);
    expect(group).toContainEqual({ x: 4, y: 4 });
    expect(group).toContainEqual({ x: 5, y: 4 });
  });

  it("Given: L字型に連結した黒石3個の9路盤 / When: (4,4)のグループを検索 / Then: 3個の石を持つグループが返される", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 5 }, "black");

    // Act
    const group = findGroup(board, { x: 4, y: 4 });

    // Assert
    expect(group).toHaveLength(3);
    expect(group).toContainEqual({ x: 4, y: 4 });
    expect(group).toContainEqual({ x: 5, y: 4 });
    expect(group).toContainEqual({ x: 5, y: 5 });
  });

  it("Given: 白石5個が縦に連結した9路盤 / When: (4,2)のグループを検索 / Then: 5個の石を持つグループが返される", () => {
    // Arrange
    let board = createEmptyBoard(9);
    for (let y = 0; y < 5; y++) {
      board = placeStone(board, { x: 4, y }, "white");
    }

    // Act
    const group = findGroup(board, { x: 4, y: 2 });

    // Assert
    expect(group).toHaveLength(5);
  });

  it("Given: (4,4)に黒石、(5,4)に白石が配置された9路盤 / When: (4,4)のグループを検索 / Then: 黒石1個のみのグループが返される", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 4 }, "white");

    // Act
    const group = findGroup(board, { x: 4, y: 4 });

    // Assert
    expect(group).toHaveLength(1);
    expect(group).toContainEqual({ x: 4, y: 4 });
  });
});

describe("countLiberties", () => {
  it("Given: 中央(4,4)に黒石1個の9路盤 / When: 呼吸点を数える / Then: 4つの呼吸点が返される", () => {
    // Arrange
    const board = placeStone(createEmptyBoard(9), { x: 4, y: 4 }, "black");

    // Act
    const liberties = countLiberties(board, { x: 4, y: 4 });

    // Assert
    expect(liberties).toBe(4);
  });

  it("Given: 左上角(0,0)に黒石1個の9路盤 / When: 呼吸点を数える / Then: 2つの呼吸点が返される", () => {
    // Arrange
    const board = placeStone(createEmptyBoard(9), { x: 0, y: 0 }, "black");

    // Act
    const liberties = countLiberties(board, { x: 0, y: 0 });

    // Assert
    expect(liberties).toBe(2);
  });

  it("Given: (4,4)と(5,4)に黒石が連結した9路盤 / When: 呼吸点を数える / Then: 6つの呼吸点が返される", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 4 }, "black");

    // Act
    const liberties = countLiberties(board, { x: 4, y: 4 });

    // Assert
    expect(liberties).toBe(6);
  });

  it("Given: (4,4)の白石が黒石で完全に囲まれた9路盤 / When: 呼吸点を数える / Then: 0が返される", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "white");
    board = placeStone(board, { x: 4, y: 3 }, "black");
    board = placeStone(board, { x: 5, y: 4 }, "black");
    board = placeStone(board, { x: 4, y: 5 }, "black");
    board = placeStone(board, { x: 3, y: 4 }, "black");

    // Act
    const liberties = countLiberties(board, { x: 4, y: 4 });

    // Assert
    expect(liberties).toBe(0);
  });

  it("Given: L字型の黒石グループ3個の9路盤 / When: 呼吸点を数える / Then: 7つの呼吸点が返される", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 5 }, "black");

    // Act
    const liberties = countLiberties(board, { x: 4, y: 4 });

    // Assert
    expect(liberties).toBe(7);
  });

  it("Given: (4,4)の黒石の上に白石がある9路盤 / When: 呼吸点を数える / Then: 3つの呼吸点が返される", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    board = placeStone(board, { x: 4, y: 3 }, "white");

    // Act
    const liberties = countLiberties(board, { x: 4, y: 4 });

    // Assert
    expect(liberties).toBe(3);
  });
});

describe("removeStones", () => {
  it("Given: (4,4)に黒石がある9路盤 / When: (4,4)の石を削除 / Then: (4,4)がnullになる", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");

    // Act
    const newBoard = removeStones(board, [{ x: 4, y: 4 }]);

    // Assert
    expect(newBoard[4][4]).toBeNull();
  });

  it("Given: (4,4)に黒石がある9路盤 / When: (4,4)の石を削除 / Then: 元の盤面は変更されない（イミュータブル性）", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");

    // Act
    const newBoard = removeStones(board, [{ x: 4, y: 4 }]);

    // Assert
    expect(board[4][4]).toBe("black");
    expect(newBoard[4][4]).toBeNull();
  });

  it("Given: (4,4)に黒石、(5,5)に白石がある9路盤 / When: 両方の石を削除 / Then: 両方の位置がnullになる", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 5 }, "white");

    // Act
    const newBoard = removeStones(board, [
      { x: 4, y: 4 },
      { x: 5, y: 5 },
    ]);

    // Assert
    expect(newBoard[4][4]).toBeNull();
    expect(newBoard[5][5]).toBeNull();
  });

  it("Given: 空の9路盤 / When: 空配列で削除 / Then: 同じ盤面参照が返される", () => {
    // Arrange
    const board = createEmptyBoard(9);

    // Act
    const newBoard = removeStones(board, []);

    // Assert
    expect(newBoard).toBe(board);
  });

  it("Given: (4,4)に黒石がある9路盤 / When: (4,4)の石を削除 / Then: 変更されていない行は同一参照を保つ（構造共有）", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");

    // Act
    const newBoard = removeStones(board, [{ x: 4, y: 4 }]);

    // Assert
    expect(newBoard[0]).toBe(board[0]);
    expect(newBoard[3]).toBe(board[3]);
    expect(newBoard[4]).not.toBe(board[4]);
  });
});

describe("captureStones", () => {
  it("Given: (4,4)の白石が黒石で完全に囲まれた9路盤 / When: 最後の包囲点(4,5)に黒石を配置 / Then: 白石が取られる", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "white");
    board = placeStone(board, { x: 4, y: 3 }, "black");
    board = placeStone(board, { x: 5, y: 4 }, "black");
    board = placeStone(board, { x: 3, y: 4 }, "black");
    board = placeStone(board, { x: 4, y: 5 }, "black");

    // Act
    const result = captureStones(board, { x: 4, y: 5 }, "black");

    // Assert
    expect(result.captured).toHaveLength(1);
    expect(result.captured).toContainEqual({ x: 4, y: 4 });
    expect(result.board[4][4]).toBeNull();
  });

  it("Given: (4,4)の白石の上に黒石がある9路盤 / When: 黒石を配置 / Then: 白石は取られない", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "white");
    board = placeStone(board, { x: 4, y: 3 }, "black");

    // Act
    const result = captureStones(board, { x: 4, y: 3 }, "black");

    // Assert
    expect(result.captured).toHaveLength(0);
    expect(result.board[4][4]).toBe("white");
  });

  it("Given: (4,4)と(5,4)の白石2個が黒石で囲まれた9路盤 / When: 最後の包囲点(4,5)に黒石を配置 / Then: 白石グループ2個が取られる", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "white");
    board = placeStone(board, { x: 5, y: 4 }, "white");
    board = placeStone(board, { x: 4, y: 3 }, "black");
    board = placeStone(board, { x: 5, y: 3 }, "black");
    board = placeStone(board, { x: 6, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 5 }, "black");
    board = placeStone(board, { x: 3, y: 4 }, "black");
    board = placeStone(board, { x: 4, y: 5 }, "black");

    // Act
    const result = captureStones(board, { x: 4, y: 5 }, "black");

    // Assert
    expect(result.captured).toHaveLength(2);
    expect(result.captured).toContainEqual({ x: 4, y: 4 });
    expect(result.captured).toContainEqual({ x: 5, y: 4 });
    expect(result.board[4][4]).toBeNull();
    expect(result.board[4][5]).toBeNull();
  });

  it("Given: (3,4)と(5,4)の独立した白石2個が黒石で囲まれた9路盤 / When: 中央(4,4)に黒石を配置 / Then: 両方の白石グループが取られる", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 3, y: 4 }, "white");
    board = placeStone(board, { x: 5, y: 4 }, "white");
    board = placeStone(board, { x: 3, y: 3 }, "black");
    board = placeStone(board, { x: 2, y: 4 }, "black");
    board = placeStone(board, { x: 3, y: 5 }, "black");
    board = placeStone(board, { x: 5, y: 3 }, "black");
    board = placeStone(board, { x: 6, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 5 }, "black");
    board = placeStone(board, { x: 4, y: 4 }, "black");

    // Act
    const result = captureStones(board, { x: 4, y: 4 }, "black");

    // Assert
    expect(result.captured).toHaveLength(2);
    expect(result.board[3][4]).toBeNull();
    expect(result.board[5][4]).toBeNull();
  });

  it("Given: (4,4)と(5,4)に黒石がある9路盤 / When: (5,4)に黒石を配置 / Then: 自分の色の石は取られない", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 4 }, "black");

    // Act
    const result = captureStones(board, { x: 5, y: 4 }, "black");

    // Assert
    expect(result.captured).toHaveLength(0);
    expect(result.board).toBe(board);
  });
});

describe("wouldBeSuicide", () => {
  it("Given: (4,4)が白石で完全に囲まれた9路盤 / When: (4,4)に黒石を置く判定 / Then: 自殺手と判定される", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 3 }, "white");
    board = placeStone(board, { x: 5, y: 4 }, "white");
    board = placeStone(board, { x: 4, y: 5 }, "white");
    board = placeStone(board, { x: 3, y: 4 }, "white");

    // Act
    const isSuicide = wouldBeSuicide(board, { x: 4, y: 4 }, "black");

    // Assert
    expect(isSuicide).toBe(true);
  });

  it("Given: (4,4)の白石が黒石で3方向から囲まれた9路盤 / When: 最後の包囲点(4,5)に黒石を置く判定 / Then: 自殺手ではないと判定される（相手を取る手）", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "white");
    board = placeStone(board, { x: 4, y: 3 }, "black");
    board = placeStone(board, { x: 5, y: 4 }, "black");
    board = placeStone(board, { x: 3, y: 4 }, "black");

    // Act
    const isSuicide = wouldBeSuicide(board, { x: 4, y: 5 }, "black");

    // Assert
    expect(isSuicide).toBe(false);
  });

  it("Given: (5,4)に黒石があり(4,4)が白石で3方向から囲まれた9路盤 / When: (4,4)に黒石を置く判定 / Then: 自殺手ではないと判定される（既存グループと繋がる）", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 5, y: 4 }, "black");
    board = placeStone(board, { x: 4, y: 3 }, "white");
    board = placeStone(board, { x: 4, y: 5 }, "white");
    board = placeStone(board, { x: 3, y: 4 }, "white");

    // Act
    const isSuicide = wouldBeSuicide(board, { x: 4, y: 4 }, "black");

    // Assert
    expect(isSuicide).toBe(false);
  });

  it("Given: 空の9路盤 / When: (4,4)に黒石を置く判定 / Then: 自殺手ではないと判定される", () => {
    // Arrange
    const board = createEmptyBoard(9);

    // Act
    const isSuicide = wouldBeSuicide(board, { x: 4, y: 4 }, "black");

    // Assert
    expect(isSuicide).toBe(false);
  });

  it("Given: 左上角(0,0)が白石で囲まれた9路盤 / When: (0,0)に黒石を置く判定 / Then: 自殺手と判定される", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 1, y: 0 }, "white");
    board = placeStone(board, { x: 0, y: 1 }, "white");

    // Act
    const isSuicide = wouldBeSuicide(board, { x: 0, y: 0 }, "black");

    // Assert
    expect(isSuicide).toBe(true);
  });
});

describe("countStones", () => {
  it("Given: 空の9路盤 / When: 石をカウント / Then: 黒0:白0が返される", () => {
    // Arrange
    const board = createEmptyBoard(9);

    // Act
    const count = countStones(board);

    // Assert
    expect(count).toEqual({ black: 0, white: 0 });
  });

  it("Given: (4,4)に黒石1個がある9路盤 / When: 石をカウント / Then: 黒1:白0が返される", () => {
    // Arrange
    const board = placeStone(createEmptyBoard(9), { x: 4, y: 4 }, "black");

    // Act
    const count = countStones(board);

    // Assert
    expect(count).toEqual({ black: 1, white: 0 });
  });

  it("Given: (4,4)に白石1個がある9路盤 / When: 石をカウント / Then: 黒0:白1が返される", () => {
    // Arrange
    const board = placeStone(createEmptyBoard(9), { x: 4, y: 4 }, "white");

    // Act
    const count = countStones(board);

    // Assert
    expect(count).toEqual({ black: 0, white: 1 });
  });

  it("Given: 黒石1個と白石1個がある9路盤 / When: 石をカウント / Then: 黒1:白1が返される", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 4, y: 4 }, "black");
    board = placeStone(board, { x: 5, y: 5 }, "white");

    // Act
    const count = countStones(board);

    // Assert
    expect(count).toEqual({ black: 1, white: 1 });
  });

  it("Given: 黒石3個と白石2個がある9路盤 / When: 石をカウント / Then: 黒3:白2が返される", () => {
    // Arrange
    let board = createEmptyBoard(9);
    board = placeStone(board, { x: 0, y: 0 }, "black");
    board = placeStone(board, { x: 1, y: 1 }, "black");
    board = placeStone(board, { x: 2, y: 2 }, "black");
    board = placeStone(board, { x: 3, y: 3 }, "white");
    board = placeStone(board, { x: 4, y: 4 }, "white");

    // Act
    const count = countStones(board);

    // Assert
    expect(count).toEqual({ black: 3, white: 2 });
  });

  it("Given: 3路盤全体に黒5個と白4個の石がある盤面 / When: 石をカウント / Then: 黒5:白4が返される", () => {
    // Arrange
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

    // Act
    const count = countStones(board);

    // Assert
    expect(count).toEqual({ black: 5, white: 4 });
  });
});
