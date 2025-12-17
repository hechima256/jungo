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
  describe("着手（play）の検証", () => {
    it("Given: 初期状態の9路盤 / When: (4,4)に黒石を打つ / Then: 着手が成功し石が配置される", () => {
      // Arrange
      const game = createGame(9);
      const move: Move = { type: "play", position: { x: 4, y: 4 } };

      // Act
      const result = playMove(game, move);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.state.board[4][4]).toBe("black");
      }
    });

    it("Given: 初期状態の9路盤 / When: (4,4)に黒石を打つ / Then: 手番が白に交代する", () => {
      // Arrange
      const game = createGame(9);
      const move: Move = { type: "play", position: { x: 4, y: 4 } };

      // Act
      const result = playMove(game, move);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.state.currentPlayer).toBe("white");
      }
    });

    it("Given: 初期状態の9路盤 / When: (4,4)に黒石を打つ / Then: moveCountが1に増加する", () => {
      // Arrange
      const game = createGame(9);
      const move: Move = { type: "play", position: { x: 4, y: 4 } };

      // Act
      const result = playMove(game, move);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.state.moveCount).toBe(1);
      }
    });

    it("Given: 初期状態の9路盤 / When: (4,4)に黒石を打つ / Then: lastMoveが記録される", () => {
      // Arrange
      const game = createGame(9);
      const move: Move = { type: "play", position: { x: 4, y: 4 } };

      // Act
      const result = playMove(game, move);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.state.lastMove).toEqual({
          type: "play",
          position: { x: 4, y: 4 },
          color: "black",
        });
      }
    });

    it("Given: 初期状態の9路盤 / When: (4,4)に黒石を打つ / Then: 黒の石数が1に増加する", () => {
      // Arrange
      const game = createGame(9);
      const move: Move = { type: "play", position: { x: 4, y: 4 } };

      // Act
      const result = playMove(game, move);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.state.stoneCount).toEqual({ black: 1, white: 0 });
      }
    });
  });

  describe("パス（pass）の検証", () => {
    it("Given: 初期状態の9路盤 / When: 黒がパスする / Then: パスが成功し手番が交代する", () => {
      // Arrange
      const game = createGame(9);
      const move: Move = { type: "pass" };

      // Act
      const result = playMove(game, move);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.state.currentPlayer).toBe("white");
        expect(result.state.isOver).toBe(false);
      }
    });

    it("Given: 初期状態の9路盤 / When: 黒がパスする / Then: koPointがnullになる", () => {
      // Arrange
      const game = createGame(9);
      const move: Move = { type: "pass" };

      // Act
      const result = playMove(game, move);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.state.koPoint).toBeNull();
      }
    });

    it("Given: 初期状態の9路盤 / When: 2連続でパスする / Then: ゲームが終局する", () => {
      // Arrange
      let game = createGame(9);
      const pass1: Move = { type: "pass" };

      // Act - 1回目のパス
      const result1 = playMove(game, pass1);
      expect(result1.success).toBe(true);
      if (!result1.success) return;
      
      game = result1.state;
      const pass2: Move = { type: "pass" };
      const result2 = playMove(game, pass2);

      // Assert
      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.state.isOver).toBe(true);
      }
    });
  });

  describe("投了（resign）の検証", () => {
    it("Given: 初期状態の9路盤 / When: 黒が投了する / Then: 白が勝利する", () => {
      // Arrange
      const game = createGame(9);
      const move: Move = { type: "resign" };

      // Act
      const result = playMove(game, move);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.state.isOver).toBe(true);
        expect(result.state.winner).toBe("white");
      }
    });

    it("Given: 黒が1手打った後の状態 / When: 白が投了する / Then: 黒が勝利する", () => {
      // Arrange
      let game = createGame(9);
      const blackMove: Move = { type: "play", position: { x: 0, y: 0 } };
      const result1 = playMove(game, blackMove);
      expect(result1.success).toBe(true);
      if (!result1.success) return;

      game = result1.state;
      const whiteResign: Move = { type: "resign" };

      // Act
      const result2 = playMove(game, whiteResign);

      // Assert
      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.state.winner).toBe("black");
      }
    });
  });
});

describe("playMove - エラーケース", () => {
  describe("ゲーム状態エラー", () => {
    it("Given: 投了でゲーム終了した状態 / When: 着手を試みる / Then: game_overエラーが返される", () => {
      // Arrange
      let game = createGame(9);
      const resign: Move = { type: "resign" };
      const result1 = playMove(game, resign);
      expect(result1.success).toBe(true);
      if (!result1.success) return;

      game = result1.state;
      const move: Move = { type: "play", position: { x: 4, y: 4 } };

      // Act
      const result2 = playMove(game, move);

      // Assert
      expect(result2.success).toBe(false);
      if (!result2.success) {
        expect(result2.error).toBe("game_over");
      }
    });
  });

  describe("盤外への着手エラー", () => {
    it("Given: 初期状態の9路盤 / When: x座標が負の位置(-1,4)に打つ / Then: invalid_positionエラーが返される", () => {
      // Arrange
      const game = createGame(9);
      const move: Move = { type: "play", position: { x: -1, y: 4 } };

      // Act
      const result = playMove(game, move);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("invalid_position");
      }
    });

    it("Given: 初期状態の9路盤 / When: y座標が負の位置(4,-1)に打つ / Then: invalid_positionエラーが返される", () => {
      // Arrange
      const game = createGame(9);
      const move: Move = { type: "play", position: { x: 4, y: -1 } };

      // Act
      const result = playMove(game, move);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("invalid_position");
      }
    });

    it("Given: 初期状態の9路盤 / When: x座標が盤サイズ以上の位置(9,4)に打つ / Then: invalid_positionエラーが返される", () => {
      // Arrange
      const game = createGame(9);
      const move: Move = { type: "play", position: { x: 9, y: 4 } };

      // Act
      const result = playMove(game, move);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("invalid_position");
      }
    });

    it("Given: 初期状態の9路盤 / When: y座標が盤サイズ以上の位置(4,9)に打つ / Then: invalid_positionエラーが返される", () => {
      // Arrange
      const game = createGame(9);
      const move: Move = { type: "play", position: { x: 4, y: 9 } };

      // Act
      const result = playMove(game, move);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("invalid_position");
      }
    });
  });

  describe("着手禁止エラー", () => {
    it("Given: (4,4)に石が置かれた状態 / When: 同じ位置(4,4)に打つ / Then: occupiedエラーが返される", () => {
      // Arrange
      let game = createGame(9);
      const move1: Move = { type: "play", position: { x: 4, y: 4 } };
      const result1 = playMove(game, move1);
      expect(result1.success).toBe(true);
      if (!result1.success) return;

      game = result1.state;
      const move2: Move = { type: "play", position: { x: 4, y: 4 } };

      // Act
      const result2 = playMove(game, move2);

      // Assert
      expect(result2.success).toBe(false);
      if (!result2.success) {
        expect(result2.error).toBe("occupied");
      }
    });

    it("Given: (4,4)が白石で完全に囲まれた状態 / When: 黒が(4,4)に打つ / Then: suicideエラーが返される", () => {
      // Arrange - (4,4)を白石で四方から囲む
      let game = createGame(9);
      
      // 白石を(4,3)に配置
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
      
      // 白石を(5,4)に配置
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
      
      // 白石を(4,5)に配置
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
      
      // 白石を(3,4)に配置
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

      const move: Move = { type: "play", position: { x: 4, y: 4 } };

      // Act - 黒番で囲まれた場所に置く
      const result = playMove(game, move);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("suicide");
      }
    });
  });
});

describe("playMove - 石の取得", () => {
  it("Given: (4,4)の白石1個が黒石で囲まれた状態 / When: 最後の包囲点(4,5)に黒石を打つ / Then: 白石が取られる", () => {
    // Arrange - (4,4)の白石を黒石で四方から囲む準備
    let game = createGame(9);
    
    // 白石を(4,4)に配置
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
    
    // 黒石で3方向から囲む
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

    // Act - 最後の一手で白石を取る
    const result = playMove(game, { type: "play", position: { x: 4, y: 5 } });

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.board[4][4]).toBeNull();
      expect(result.state.stoneCount).toEqual({ black: 4, white: 0 });
    }
  });

  it("Given: (4,4)と(5,4)の白石2個が黒石で囲まれた状態 / When: 最後の包囲点(5,5)に黒石を打つ / Then: 白石グループが取られる", () => {
    // Arrange - 白石2つを横に並べて黒石で囲む
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

    // Act - 最後の一手で白石2つを取る
    const result = playMove(game, { type: "play", position: { x: 5, y: 5 } });

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.board[4][4]).toBeNull();
      expect(result.state.board[4][5]).toBeNull();
      expect(result.state.stoneCount).toEqual({ black: 6, white: 0 });
    }
  });

  it("Given: 縦5個の白石グループが黒石で囲まれた状態 / When: 最後の包囲点(4,5)に黒石を打つ / Then: 白石グループ全体が取られる", () => {
    // Arrange - 白石5つを縦に並べて黒石で囲む
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

    // Act - 最後の一手
    const result = playMove(game, { type: "play", position: { x: 4, y: 5 } });

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      for (let y = 0; y < 5; y++) {
        expect(result.state.board[y][4]).toBeNull();
      }
      expect(result.state.stoneCount.white).toBe(0);
    }
  });

  it("Given: (3,4)と(5,4)の独立した白石2個が黒石で囲まれた状態 / When: 中央(4,4)に黒石を打つ / Then: 両方の白石グループが同時に取られる", () => {
    // Arrange - 2つの独立した白石を配置して両方を黒石で囲む
    let game = createGame(9);
    
    // 2つの独立した白石を配置
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

    // Act - 中央に置いて両方を取る
    const result = playMove(game, { type: "play", position: { x: 4, y: 4 } });

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.board[4][3]).toBeNull();
      expect(result.state.board[4][5]).toBeNull();
      expect(result.state.stoneCount).toEqual({ black: 7, white: 0 });
    }
  });
});

describe("playMove - 勝敗判定", () => {
  describe("2連続パスでの終局", () => {
    it("Given: 石が盤上にない状態 / When: 2連続でパスする / Then: 引き分けで終局する", () => {
      // Arrange
      let game = createGame(9);
      const pass1: Move = { type: "pass" };

      // Act - 1回目のパス
      const result1 = playMove(game, pass1);
      expect(result1.success).toBe(true);
      if (!result1.success) return;

      game = result1.state;
      const pass2: Move = { type: "pass" };
      const result2 = playMove(game, pass2);

      // Assert
      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.state.isOver).toBe(true);
        expect(result2.state.winner).toBe("draw");
      }
    });

    it("Given: 黒石1個が盤上にある状態 / When: 2連続でパスする / Then: 黒の勝利で終局する", () => {
      // Arrange
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
      
      // パス1回目
      game = playMove(game, { type: "pass" }).success
        ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
        : game;

      // Act - パス2回目
      const result = playMove(game, { type: "pass" });

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.state.isOver).toBe(true);
        expect(result.state.winner).toBe("black");
      }
    });

    it("Given: 白石1個が盤上にある状態 / When: 2連続でパスする / Then: 白の勝利で終局する", () => {
      // Arrange
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
      
      // パス1回目
      game = playMove(game, { type: "pass" }).success
        ? (playMove(game, { type: "pass" }) as { success: true; state: GameState }).state
        : game;

      // Act - パス2回目
      const result = playMove(game, { type: "pass" });

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.state.isOver).toBe(true);
        expect(result.state.winner).toBe("white");
      }
    });
  });

  describe("投了での終局", () => {
    it("Given: 初期状態の9路盤 / When: 黒が投了する / Then: 白が勝利する", () => {
      // Arrange
      const game = createGame(9);
      const resign: Move = { type: "resign" };

      // Act
      const result = playMove(game, resign);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.state.isOver).toBe(true);
        expect(result.state.winner).toBe("white");
      }
    });

    it("Given: 黒が1手打った後の状態 / When: 白が投了する / Then: 黒が勝利する", () => {
      // Arrange
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
      
      const resign: Move = { type: "resign" };

      // Act - 白番で投了
      const result = playMove(game, resign);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.state.isOver).toBe(true);
        expect(result.state.winner).toBe("black");
      }
    });
  });
});

describe("playMove - イミュータブル性", () => {
  it("Given: 初期状態の9路盤 / When: (4,4)に着手する / Then: 元のGameStateは変更されない", () => {
    // Arrange
    const game = createGame(9);
    const originalBoard = game.board;
    const originalPlayer = game.currentPlayer;
    const originalMoveCount = game.moveCount;
    const move: Move = { type: "play", position: { x: 4, y: 4 } };

    // Act
    playMove(game, move);

    // Assert - 元のゲーム状態が変更されていないことを確認
    expect(game.board).toBe(originalBoard);
    expect(game.currentPlayer).toBe(originalPlayer);
    expect(game.moveCount).toBe(originalMoveCount);
    expect(game.board[4][4]).toBeNull();
  });

  it("Given: 初期状態の9路盤 / When: (4,4)に着手する / Then: 新しいGameStateが返される", () => {
    // Arrange
    const game = createGame(9);
    const move: Move = { type: "play", position: { x: 4, y: 4 } };

    // Act
    const result = playMove(game, move);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state).not.toBe(game);
      expect(result.state.board).not.toBe(game.board);
    }
  });

  it("Given: 初期状態の9路盤 / When: 2手連続で着手する / Then: 各段階でイミュータブル性が保たれる", () => {
    // Arrange
    const game1 = createGame(9);

    // Act - 1手目
    const result1 = playMove(game1, { type: "play", position: { x: 0, y: 0 } });
    expect(result1.success).toBe(true);
    if (!result1.success) return;

    const game2 = result1.state;
    
    // Act - 2手目
    const result2 = playMove(game2, { type: "play", position: { x: 1, y: 1 } });
    expect(result2.success).toBe(true);
    if (!result2.success) return;

    // Assert - game1は変更されていない
    expect(game1.board[0][0]).toBeNull();
    expect(game1.board[1][1]).toBeNull();

    // Assert - game2は1手目だけ反映
    expect(game2.board[0][0]).toBe("black");
    expect(game2.board[1][1]).toBeNull();

    // Assert - result2.stateは2手とも反映
    expect(result2.state.board[0][0]).toBe("black");
    expect(result2.state.board[1][1]).toBe("white");
  });
});
