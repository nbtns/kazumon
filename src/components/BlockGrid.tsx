import { useMemo, useState, useEffect } from 'react'
import type { Problem, Tower } from '../types'
import { generateTowers } from '../gameLogic'

interface BlockGridProps {
  problem: Problem
  animate?: boolean
}

// ブロック表示枠の最大サイズ（パディング込み）
// PC（画面幅768px以上）は大きく、スマホは小さくしてスクロール不要にする
const MAX_FRAME_SIZE_PC = 400
const MAX_FRAME_SIZE_MOBILE = 280
// ブロック表示枠の最小サイズ（これ以下だと小さすぎて見えない）
const MIN_FRAME_SIZE = 160
// 枠のパディング（p-3 = 12px × 2）
const PADDING = 24
// ブロック間のギャップ
const GAP = 8
// ブロックの最大サイズ（PCは大きく、スマホは小さく）
const MAX_BLOCK_SIZE_PC = 100
const MAX_BLOCK_SIZE_MOBILE = 80
// PC判定のしきい値（Tailwindのmd=768pxに合わせる）
const PC_THRESHOLD = 768

/**
 * 画面サイズに応じてブロック枠のサイズを計算する
 * PC（画面幅768px以上）は大きく表示、スマホはスクロールせずに収まるようコンパクトに
 */
function useFrameSize(): { frameSize: number; maxBlockSize: number } {
  const [state, setState] = useState({
    frameSize: MAX_FRAME_SIZE_PC,
    maxBlockSize: MAX_BLOCK_SIZE_PC,
  })

  useEffect(() => {
    const updateSize = () => {
      const windowHeight = window.innerHeight
      const windowWidth = window.innerWidth
      const isPC = windowWidth >= PC_THRESHOLD

      // PCとスマホで最大サイズを切り替え
      const maxFrame = isPC ? MAX_FRAME_SIZE_PC : MAX_FRAME_SIZE_MOBILE
      const maxBlock = isPC ? MAX_BLOCK_SIZE_PC : MAX_BLOCK_SIZE_MOBILE

      // 画面高さから他の要素の概算高さを引く
      // PC: ヘッダー約60px + 問題文約50px + フィードバック80px + 入力エリア約300px + パディング約60px = 約550px
      // スマホ: ヘッダー約50px + 問題文約40px + フィードバック80px + 入力エリア約260px + パディング約50px = 約480px
      const reservedHeight = isPC ? 550 : 480
      const availableHeight = windowHeight - reservedHeight
      // 幅の制限も考慮（画面幅の90%まで、ただし最大サイズ以内）
      const availableWidth = Math.min(windowWidth * 0.9, maxFrame)

      // 高さと幅のうち小さい方を採用し、最小・最大の範囲内に収める
      const calculated = Math.min(availableHeight, availableWidth, maxFrame)
      setState({
        frameSize: Math.max(calculated, MIN_FRAME_SIZE),
        maxBlockSize: maxBlock,
      })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    window.addEventListener('orientationchange', updateSize)
    return () => {
      window.removeEventListener('resize', updateSize)
      window.removeEventListener('orientationchange', updateSize)
    }
  }, [])

  return state
}

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
 * - 画面サイズに応じた枠の中にブロックを中央寄せで表示する
 * - ブロックのサイズはタワー数と高さに応じて自動計算される
 * - PCは大きく、スマホはコンパクトに表示
 */
export function BlockGrid({ problem, animate = true }: BlockGridProps) {
  const towers = useMemo(() => generateTowers(problem), [problem])
  // 画面サイズに応じた枠サイズと最大ブロックサイズを取得
  const { frameSize, maxBlockSize } = useFrameSize()

  // 最も高いタワーの高さ
  const maxTowerHeight = useMemo(
    () => Math.max(...towers.map((t) => t.count), 1),
    [towers]
  )

  // タワーの数（横並びの数）
  const towerCount = towers.length || 1

  // ブロックサイズを自動計算（枠に収まるように）
  const blockSize = useMemo(() => {
    const availableWidth = frameSize - PADDING - (towerCount - 1) * GAP
    const availableHeight = frameSize - PADDING - (maxTowerHeight - 1) * GAP

    const sizeByWidth = Math.floor(availableWidth / towerCount)
    const sizeByHeight = Math.floor(availableHeight / maxTowerHeight)

    // 幅・高さ・最大サイズのうち最小のものを採用
    return Math.min(sizeByWidth, sizeByHeight, maxBlockSize)
  }, [maxTowerHeight, towerCount, frameSize, maxBlockSize])

  // 1の場合（素因数なし）は特別扱い
  if (towers.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-white/50 shadow-inner"
        style={{ width: `${frameSize}px`, height: `${frameSize}px` }}
        role="img"
        aria-label="1を表すブロック"
      >
        <div
          className="rounded-lg border-2 border-white/50 bg-gray-300 shadow-md"
          style={{
            width: `${maxBlockSize}px`,
            height: `${maxBlockSize}px`,
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
      style={{ width: `${frameSize}px`, height: `${frameSize}px` }}
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