import { useMemo } from 'react'
import type { Problem, Tower } from '../types'
import { generateTowers } from '../gameLogic'

interface BlockGridProps {
  problem: Problem
  animate?: boolean
}

// ブロック表示枠のサイズ（パディング込み）
const FRAME_SIZE = 280
// 枠のパディング（p-3 = 12px × 2）
const PADDING = 24
// ブロック間のギャップ
const GAP = 8
// ブロックの最大サイズ
const MAX_BLOCK_SIZE = 80

/**
 * カズモンブロックを描画するコンポーネント
 *
 * 【カズモンのルール】
 * - 数字を素因数分解し、素数ごとに色分けしたブロックで視覚化する
 * - 同じ素数は「縦」に重ねる（タワーを作る）
 * - 違う素数のタワーは「横」に並べる（左から右へ、小さい数から大きい数の順）
 * - タワーの高さが違う場合でも「上辺を揃えて（上揃え）」配置する
 *
 * 例: 12 = 2 × 2 × 3
 *   → 赤ブロック縦2つ + 青ブロック1つ（横並び、上揃え）
 *
 * 【レイアウト】
 * - 固定サイズの枠の中にブロックを中央寄せで表示する
 * - ブロックのサイズはタワー数と高さに応じて自動計算される
 * - これによりブロック数に関わらず入力エリアの位置が固定される
 */
export function BlockGrid({ problem, animate = true }: BlockGridProps) {
  const towers = useMemo(() => generateTowers(problem), [problem])

  // 最も高いタワーの高さ
  const maxTowerHeight = useMemo(
    () => Math.max(...towers.map((t) => t.count), 1),
    [towers]
  )

  // タワーの数（横並びの数）
  const towerCount = towers.length || 1

  // ブロックサイズを自動計算（枠に収まるように）
  const blockSize = useMemo(() => {
    const availableWidth = FRAME_SIZE - PADDING - (towerCount - 1) * GAP
    const availableHeight = FRAME_SIZE - PADDING - (maxTowerHeight - 1) * GAP

    const sizeByWidth = Math.floor(availableWidth / towerCount)
    const sizeByHeight = Math.floor(availableHeight / maxTowerHeight)

    // 幅・高さ・最大サイズのうち最小のものを採用
    return Math.min(sizeByWidth, sizeByHeight, MAX_BLOCK_SIZE)
  }, [maxTowerHeight, towerCount])

  // 1の場合（素因数なし）は特別扱い
  if (towers.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-white/50 shadow-inner"
        style={{ width: `${FRAME_SIZE}px`, height: `${FRAME_SIZE}px` }}
        role="img"
        aria-label="1を表すブロック"
      >
        <div
          className="rounded-lg border-2 border-white/50 bg-gray-300 shadow-md"
          style={{
            width: `${MAX_BLOCK_SIZE}px`,
            height: `${MAX_BLOCK_SIZE}px`,
          }}
        />
      </div>
    )
  }

  // ブロックの通し番号（アニメーション遅延用）
  let blockIndex = 0

  return (
    <div
      className="flex items-center justify-center rounded-2xl bg-white/50 shadow-inner"
      style={{ width: `${FRAME_SIZE}px`, height: `${FRAME_SIZE}px` }}
      role="img"
      aria-label={`${problem.answer}を素因数分解したブロック`}
    >
      {/* タワーを横並び（上揃え）で配置 */}
      <div
        className="flex"
        style={{ gap: `${GAP}px`, alignItems: 'flex-start' }}
      >
        {towers.map((tower: Tower) => (
          <div
            key={`tower-${tower.prime}`}
            className="flex flex-col"
            style={{ gap: `${GAP}px`, alignItems: 'flex-start' }}
          >
            {Array.from({ length: tower.count }).map((_, blockIdx: number) => {
              const currentBlockIndex = blockIndex++
              return (
                <div
                  key={`block-${tower.prime}-${blockIdx}`}
                  className={`rounded-lg border-2 border-white/50 shadow-md ${animate ? 'animate-pop-in' : ''}`}
                  style={{
                    width: `${blockSize}px`,
                    height: `${blockSize}px`,
                    backgroundColor: tower.color,
                    animationDelay: animate
                      ? `${currentBlockIndex * 30}ms`
                      : undefined,
                    animationFillMode: 'backwards',
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}