import { describe, expect, it } from "vitest";
import { createGame, playMove } from "../src/game.js";
import type { GameState, Move } from "../src/types.js";

describe("createGame", () => {
  describe("正常系", () => {
    describe("盤面サイズの検証", () => {
      it.each([2, 3, 7, 19])("Given: %d路盤を指定 / When: ゲームを作成 / Then: 指定サイズの盤面が作成される", (size) => {
        // Arrange - 準備は不要（引数として渡すのみ）

        // Act - 実行
        const game = createGame(size);

        // Assert - 検証
        expect(game.size).toBe(size);
        expect(game.board).toHaveLength(size);
        expect(game.board[0]).toHaveLength(size);
      });
    });

    describe("初期状態の検証", () => {
      it("Given: 9路盤でゲームを作成 / When: 初期状態を確認 / Then: 黒の先手である", () => {
        // Arrange & Act
        const game = createGame(9);

        // Assert
        expect(game.currentPlayer).toBe("black");
      });

      it("Given: 9路盤でゲームを作成 / When: 初期状態を確認 / Then: moveCountが0である", () => {
        // Arrange & Act
        const game = createGame(9);

        // Assert
        expect(game.moveCount).toBe(0);
      });

      it("Given: 9路盤でゲームを作成 / When: 初期状態を確認 / Then: ゲームが終了していない", () => {
        // Arrange & Act
        const game = createGame(9);

        // Assert
        expect(game.isOver).toBe(false);
        expect(game.winner).toBeNull();
      });

      it("Given: 9路盤でゲームを作成 / When: 初期状態を確認 / Then: koPointがnullである", () => {
        // Arrange & Act
        const game = createGame(9);

        // Assert
        expect(game.koPoint).toBeNull();
      });

      it("Given: 9路盤でゲームを作成 / When: 初期状態を確認 / Then: lastMoveがnullである", () => {
        // Arrange & Act
        const game = createGame(9);

        // Assert
        expect(game.lastMove).toBeNull();
      });

      it("Given: 9路盤でゲームを作成 / When: 初期状態を確認 / Then: 石数が0:0である", () => {
        // Arrange & Act
        const game = createGame(9);

        // Assert
        expect(game.stoneCount).toEqual({ black: 0, white: 0 });
      });

      it("Given: 7路盤でゲームを作成 / When: 初期状態を確認 / Then: 全セルがnullである", () => {
        // Arrange & Act
        const game = createGame(7);

        // Assert
        for (const row of game.board) {
          for (const cell of row) {
            expect(cell).toBeNull();
          }
        }
      });
    });
  });

  describe("異常系", () => {
    describe("不正な盤面サイズの検証", () => {
      it.each([1, 0, -1])(
        "Given: 盤面サイズに%dを指定 / When: ゲームを作成 / Then: Invalid board sizeエラーが発生",
        (size) => {
          // Arrange - 準備は不要

          // Act & Assert
          expect(() => createGame(size)).toThrow("Invalid board size");
        }
      );

      it.each([4.5, -2.1, NaN, Infinity])(
        "Given: 盤面サイズに%sを指定 / When: ゲームを作成 / Then: Must be an integerエラーが発生",
        (size) => {
          // Arrange - 準備は不要

          // Act & Assert
          expect(() => createGame(size)).toThrow("Must be an integer");
        }
      );
    });
  });
});

describe("playMove - 基本機能", () => {
  it("着手が成功すること", () => {
    const game = createGame(9);
    const move: Move = { type: "play", position: { x: 4, y: 4 } };
    const result = playMove(game, move);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.board[4][4]).toBe("black");
    }
  });

  it("着手後に手番が交代すること", () => {
    const game = createGame(9);
    const move: Move = { type: "play", position: { x: 4, y: 4 } };
    const result = playMove(game, move);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.currentPlayer).toBe("white");
    }
  });

  it("着手後にmoveCountが増加すること", () => {
    const game = createGame(9);
    const move: Move = { type: "play", position: { x: 4, y: 4 } };
    const result = playMove(game, move);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.moveCount).toBe(1);
    }
  });

  it("着手後にlastMoveが記録されること", () => {
    const game = createGame(9);
    const move: Move = { type: "play", position: { x: 4, y: 4 } };
    const result = playMove(game, move);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.lastMove).toEqual({
        type: "play",
        position: { x: 4, y: 4 },
        color: "black",
      });
    }
  });

  it("着手後に石数が更新されること", () => {
    const game = createGame(9);
    const move: Move = { type: "play", position: { x: 4, y: 4 } };
    const result = playMove(game, move);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.stoneCount).toEqual({ black: 1, white: 0 });
    }
  });

  it("パスが成功すること", () => {
    const game = createGame(9);
    const move: Move = { type: "pass" };
    const result = playMove(game, move);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.currentPlayer).toBe("white");
      expect(result.state.isOver).toBe(false);
    }
  });

  it("パス後にkoPointがnullになること", () => {
    const game = createGame(9);
    const move: Move = { type: "pass" };
    const result = playMove(game, move);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.koPoint).toBeNull();
    }
  });

  it("投了が成功すること", () => {
    const game = createGame(9);
    const move: Move = { type: "resign" };
    const result = playMove(game, move);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.isOver).toBe(true);
      expect(result.state.winner).toBe("white");
    }
  });

  it("白番での投了で黒が勝つこと", () => {
    let game = createGame(9);
    const blackMove: Move = { type: "play", position: { x: 0, y: 0 } };
    const result1 = playMove(game, blackMove);
    expect(result1.success).toBe(true);
    if (result1.success) {
      game = result1.state;
      const whiteResign: Move = { type: "resign" };
      const result2 = playMove(game, whiteResign);
      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.state.winner).toBe("black");
      }
    }
  });

  it("2連続パスで終局すること", () => {
    let game = createGame(9);
    const pass1: Move = { type: "pass" };
    const result1 = playMove(game, pass1);
    expect(result1.success).toBe(true);
    if (result1.success) {
      game = result1.state;
      const pass2: Move = { type: "pass" };
      const result2 = playMove(game, pass2);
      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.state.isOver).toBe(true);
      }
    }
  });
});

describe("playMove - エラーケース", () => {
  it("ゲーム終了後の着手でgame_overエラーが返ること", () => {
    let game = createGame(9);
    const resign: Move = { type: "resign" };
    const result1 = playMove(game, resign);
    expect(result1.success).toBe(true);
    if (result1.success) {
      game = result1.state;
      const move: Move = { type: "play", position: { x: 4, y: 4 } };
      const result2 = playMove(game, move);
      expect(result2.success).toBe(false);
      if (!result2.success) {
        expect(result2.error).toBe("game_over");
      }
    }
  });

  it("盤外への着手でinvalid_positionエラーが返ること（x座標が負）", () => {
    const game = createGame(9);
    const move: Move = { type: "play", position: { x: -1, y: 4 } };
    const result = playMove(game, move);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("invalid_position");
    }
  });

  it("盤外への着手でinvalid_positionエラーが返ること（y座標が負）", () => {
    const game = createGame(9);
    const move: Move = { type: "play", position: { x: 4, y: -1 } };
    const result = playMove(game, move);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("invalid_position");
    }
  });

  it("盤外への着手でinvalid_positionエラーが返ること（x座標が盤サイズ以上）", () => {
    const game = createGame(9);
    const move: Move = { type: "play", position: { x: 9, y: 4 } };
    const result = playMove(game, move);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("invalid_position");
    }
  });

  it("盤外への着手でinvalid_positionエラーが返ること（y座標が盤サイズ以上）", () => {
    const game = createGame(9);
    const move: Move = { type: "play", position: { x: 4, y: 9 } };
    const result = playMove(game, move);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("invalid_position");
    }
  });

  it("既に石がある位置への着手でoccupiedエラーが返ること", () => {
    let game = createGame(9);
    const move1: Move = { type: "play", position: { x: 4, y: 4 } };
    const result1 = playMove(game, move1);
    expect(result1.success).toBe(true);
    if (result1.success) {
      game = result1.state;
      const move2: Move = { type: "play", position: { x: 4, y: 4 } };
      const result2 = playMove(game, move2);
      expect(result2.success).toBe(false);
      if (!result2.success) {
        expect(result2.error).toBe("occupied");
      }
    }
  });

  it("自殺手でsuicideエラーが返ること", () => {
    let game = createGame(9);
    // 白石で囲む
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 4, y: 3 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 4, y: 3 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 5, y: 4 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 5, y: 4 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 4, y: 5 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 4, y: 5 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 3, y: 4 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 3, y: 4 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;

    // 黒番で囲まれた場所に置く
    const move: Move = { type: "play", position: { x: 4, y: 4 } };
    const result = playMove(game, move);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("suicide");
    }
  });
});

describe("playMove - 石の取得", () => {
  it("1つの石を取ること", () => {
    let game = createGame(9);
    // 白石を置く
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 4, y: 4 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 4, y: 4 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    // 黒石で囲む
    game = playMove(game, { type: "play", position: { x: 4, y: 3 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 4, y: 3 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 5, y: 4 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 5, y: 4 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 3, y: 4 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 3, y: 4 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    // 最後の一手で白石を取る
    const result = playMove(game, { type: "play", position: { x: 4, y: 5 } });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.board[4][4]).toBeNull();
      expect(result.state.stoneCount).toEqual({ black: 4, white: 0 });
    }
  });

  it("複数の石（グループ）を取ること", () => {
    let game = createGame(9);
    // 白石2つを並べる
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 4, y: 4 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 4, y: 4 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 5, y: 4 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 5, y: 4 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    // 黒石で囲む
    game = playMove(game, { type: "play", position: { x: 4, y: 3 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 4, y: 3 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 5, y: 3 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 5, y: 3 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 6, y: 4 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 6, y: 4 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 3, y: 4 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 3, y: 4 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 4, y: 5 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 4, y: 5 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    // 最後の一手で白石2つを取る
    const result = playMove(game, { type: "play", position: { x: 5, y: 5 } });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.board[4][4]).toBeNull();
      expect(result.state.board[4][5]).toBeNull();
      expect(result.state.stoneCount).toEqual({ black: 6, white: 0 });
    }
  });

  it("大きなグループを取ること", () => {
    let game = createGame(9);
    // 白石5つを縦に並べる (x=4, y=0-4)
    for (let y = 0; y < 5; y++) {
      game = playMove(game, { type: "pass" }).success
        ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
        : game;
      game = playMove(game, { type: "play", position: { x: 4, y } }).success
        ? (
            playMove(game, { type: "play", position: { x: 4, y } }) as {
              success: true;
              state: GameState;
            }
          ).state
        : game;
    }
    // 黒石で囲む (左側)
    for (let y = 0; y < 5; y++) {
      game = playMove(game, { type: "play", position: { x: 3, y } }).success
        ? (
            playMove(game, { type: "play", position: { x: 3, y } }) as {
              success: true;
              state: GameState;
            }
          ).state
        : game;
      game = playMove(game, { type: "pass" }).success
        ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
        : game;
    }
    // 黒石で囲む (右側)
    for (let y = 0; y < 5; y++) {
      game = playMove(game, { type: "play", position: { x: 5, y } }).success
        ? (
            playMove(game, { type: "play", position: { x: 5, y } }) as {
              success: true;
              state: GameState;
            }
          ).state
        : game;
      game = playMove(game, { type: "pass" }).success
        ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
        : game;
    }
    // 最後の一手
    const result = playMove(game, { type: "play", position: { x: 4, y: 5 } });
    expect(result.success).toBe(true);
    if (result.success) {
      for (let y = 0; y < 5; y++) {
        expect(result.state.board[y][4]).toBeNull();
      }
      expect(result.state.stoneCount.white).toBe(0);
    }
  });

  it("複数グループを同時に取ること", () => {
    let game = createGame(9);
    // 2つの独立した白石
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 3, y: 4 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 3, y: 4 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 5, y: 4 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 5, y: 4 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    // 両方を黒石で囲む
    game = playMove(game, { type: "play", position: { x: 3, y: 3 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 3, y: 3 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 2, y: 4 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 2, y: 4 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 3, y: 5 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 3, y: 5 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 5, y: 3 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 5, y: 3 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 6, y: 4 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 6, y: 4 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    game = playMove(game, { type: "play", position: { x: 5, y: 5 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 5, y: 5 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    // 中央に置いて両方を取る
    const result = playMove(game, { type: "play", position: { x: 4, y: 4 } });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.board[4][3]).toBeNull();
      expect(result.state.board[4][5]).toBeNull();
      expect(result.state.stoneCount).toEqual({ black: 7, white: 0 });
    }
  });
});

describe("playMove - 勝敗判定", () => {
  it("2連続パスでの終局で引き分けになること", () => {
    let game = createGame(9);
    const pass1: Move = { type: "pass" };
    const result1 = playMove(game, pass1);
    expect(result1.success).toBe(true);
    if (result1.success) {
      game = result1.state;
      const pass2: Move = { type: "pass" };
      const result2 = playMove(game, pass2);
      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.state.isOver).toBe(true);
        expect(result2.state.winner).toBe("draw");
      }
    }
  });

  it("2連続パスでの終局で黒勝ちになること", () => {
    let game = createGame(9);
    // 黒が1つ置く
    game = playMove(game, { type: "play", position: { x: 4, y: 4 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 4, y: 4 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    // パス2回
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    const result = playMove(game, { type: "pass" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.isOver).toBe(true);
      expect(result.state.winner).toBe("black");
    }
  });

  it("2連続パスでの終局で白勝ちになること", () => {
    let game = createGame(9);
    // 黒パス
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    // 白が1つ置く
    game = playMove(game, { type: "play", position: { x: 4, y: 4 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 4, y: 4 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    // パス2回
    game = playMove(game, { type: "pass" }).success
      ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
      : game;
    const result = playMove(game, { type: "pass" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.isOver).toBe(true);
      expect(result.state.winner).toBe("white");
    }
  });

  it("投了で相手が勝つこと（黒投了）", () => {
    const game = createGame(9);
    const resign: Move = { type: "resign" };
    const result = playMove(game, resign);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.isOver).toBe(true);
      expect(result.state.winner).toBe("white");
    }
  });

  it("投了で相手が勝つこと（白投了）", () => {
    let game = createGame(9);
    // 黒番で適当に置く
    game = playMove(game, { type: "play", position: { x: 0, y: 0 } }).success
      ? (
          playMove(game, { type: "play", position: { x: 0, y: 0 } }) as {
            success: true;
            state: GameState;
          }
        ).state
      : game;
    // 白番で投了
    const resign: Move = { type: "resign" };
    const result = playMove(game, resign);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.isOver).toBe(true);
      expect(result.state.winner).toBe("black");
    }
  });
});

describe("playMove - イミュータブル性", () => {
  it("元のGameStateが変更されないこと", () => {
    const game = createGame(9);
    const originalBoard = game.board;
    const originalPlayer = game.currentPlayer;
    const originalMoveCount = game.moveCount;

    const move: Move = { type: "play", position: { x: 4, y: 4 } };
    playMove(game, move);

    expect(game.board).toBe(originalBoard);
    expect(game.currentPlayer).toBe(originalPlayer);
    expect(game.moveCount).toBe(originalMoveCount);
    expect(game.board[4][4]).toBeNull();
  });

  it("新しいGameStateが返されること", () => {
    const game = createGame(9);
    const move: Move = { type: "play", position: { x: 4, y: 4 } };
    const result = playMove(game, move);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state).not.toBe(game);
      expect(result.state.board).not.toBe(game.board);
    }
  });

  it("連続した着手でイミュータブル性が保たれること", () => {
    const game1 = createGame(9);
    const result1 = playMove(game1, { type: "play", position: { x: 0, y: 0 } });
    expect(result1.success).toBe(true);

    if (result1.success) {
      const game2 = result1.state;
      const result2 = playMove(game2, { type: "play", position: { x: 1, y: 1 } });
      expect(result2.success).toBe(true);

      // game1は変更されていない
      expect(game1.board[0][0]).toBeNull();
      expect(game1.board[1][1]).toBeNull();

      // game2は1手目だけ反映
      expect(game2.board[0][0]).toBe("black");
      expect(game2.board[1][1]).toBeNull();

      // result2.stateは2手とも反映
      if (result2.success) {
        expect(result2.state.board[0][0]).toBe("black");
        expect(result2.state.board[1][1]).toBe("white");
      }
    }
  });
});
