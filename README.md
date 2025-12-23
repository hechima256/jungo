![CI](https://github.com/hechima256/jungo/actions/workflows/ci.yml/badge.svg)

**[API Documentation](https://hechima256.github.io/jungo/)**

# jungo

純碁（Jungo）のゲームロジックを提供するTypeScriptライブラリです。

## 概要

純碁は、盤上の石数のみで勝敗を決めるシンプルな囲碁です。このライブラリは、純碁のゲームロジックをTypeScriptで実装し、イミュータブルなAPIを提供します。

## 特徴

- **イミュータブルな設計**: 全てのゲーム状態は不変（immutable）で、各着手は新しい状態を返します
- **完全な型定義**: TypeScriptによる完全な型サポート
- **純粋な関数**: 副作用のない純粋関数によるゲームロジック

## インストール

```bash
npm install jungo
```

## 基本的な使い方

```typescript
import { createGame, playMove } from 'jungo';

// 9x9の盤面でゲームを開始
const initialState = createGame(9);

// 黒が(2, 3)に着手
const result1 = playMove(initialState, {
  type: 'play',
  position: { x: 2, y: 3 }
});

if (result1.success) {
  console.log('着手成功');
  const newState = result1.state;
  
  // 白が(3, 3)に着手
  const result2 = playMove(newState, {
    type: 'play',
    position: { x: 3, y: 3 }
  });
  
  if (result2.success) {
    console.log('白の着手成功');
  }
}

// パス
const passResult = playMove(initialState, { type: 'pass' });

// 投了
const resignResult = playMove(initialState, { type: 'resign' });
```

## API仕様

### `createGame(size: number): GameState`

新しいゲームを作成します。

**パラメータ:**
- `size`: 盤面のサイズ（例: 5, 7, 9）

**戻り値:**
- 初期化された`GameState`オブジェクト

### `playMove(state: GameState, move: Move): MoveResult`

着手を実行し、新しいゲーム状態を返します。

**パラメータ:**
- `state`: 現在のゲーム状態
- `move`: 実行する着手（`play`、`pass`、`resign`のいずれか）

**戻り値:**
- `MoveResult`: 成功時は新しい`GameState`、失敗時はエラー情報を含むオブジェクト

**着手のタイプ:**

```typescript
// 石を置く
{ type: 'play', position: { x: number, y: number } }

// パス
{ type: 'pass' }

// 投了
{ type: 'resign' }
```

**エラーの種類:**
- `invalid_position`: 盤面外の座標
- `occupied`: すでに石が置かれている
- `suicide`: 自殺手（置いた瞬間に取られる手）
- `ko`: コウルール違反
- `game_over`: ゲーム終了済み

## 型定義

主要な型定義：

```typescript
type Color = 'black' | 'white';
type Cell = Color | null;
type Position = { readonly x: number; readonly y: number };

type GameState = {
  readonly board: ReadonlyArray<ReadonlyArray<Cell>>;
  readonly size: number;
  readonly currentPlayer: Color;
  readonly koPoint: Position | null;
  readonly moveCount: number;
  readonly lastMove: (Move & { readonly color: Color }) | null;
  readonly isOver: boolean;
  readonly winner: Color | 'draw' | null;
  readonly stoneCount: { readonly black: number; readonly white: number };
};

type MoveResult =
  | { readonly success: true; readonly state: GameState }
  | { readonly success: false; readonly error: MoveError };
```

## 純碁のゲームルール

1. **手番**: 黒から始まり、交互に着手します
2. **石の取り**: 相手の石を囲うと取れます
3. **自殺手禁止**: 囲まれている場所に石を置くことはできません。ただし、その手で相手の石を取る場合は置くことができます
4. **コウ**: 直前の局面を繰り返す手は打てません
5. **終局**: 2連続パスでゲーム終了
6. **勝敗**: 盤上の石数が多い方の勝ち

## 開発

```bash
# ビルド
npm run build

# テスト実行
npm test

# リント
npm run lint

# フォーマット
npm run format

# 型チェック
npm run typecheck
```

## ライセンス

[MITライセンス](./LICENSE)

## Todo
[TODO.md](./TODO.md)

## バージョン

0.1.0