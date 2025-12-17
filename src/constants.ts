/**
 * 碁盤の最小サイズ
 *
 * 有効な碁盤として成立する最小の碁盤サイズを定義します。
 * 2x2未満の碁盤では、碁のルールが適切に機能しないため、
 * この値を下限としています。
 *
 * @example
 * ```ts
 * import { MIN_BOARD_SIZE } from './constants';
 *
 * // 碁盤サイズのバリデーション
 * if (size < MIN_BOARD_SIZE) {
 *   throw new Error(`碁盤サイズは${MIN_BOARD_SIZE}以上である必要があります`);
 * }
 * ```
 */
export const MIN_BOARD_SIZE = 2;
