import { useState, useEffect } from 'react'
import type { Difficulty, PrimeFactor, TimeRecords } from '../types'
import { DIFFICULTY_CONFIGS, PRIME_COLORS, loadTimeRecords, formatTime } from '../gameLogic'

interface TitleScreenProps {
  onStart: (difficulty: Difficulty) => void
}

/**
 * タイトル画面（難易度選択）
 * 各難易度のベストタイムも表示する
 * スマホでもスクロールせずに全体が表示されるようコンパクト化
 */
export function TitleScreen({ onStart }: TitleScreenProps) {
  const difficulties: Difficulty[] = ['easy', 'normal', 'hard']

  // localStorageからタイム記録を読み込む（初回レンダリング時のみ）
  const [records, setRecords] = useState<TimeRecords | null>(null)

  useEffect(() => {
    setRecords(loadTimeRecords())
  }, [])

  // 難易度ごとのボタンカラー
  const difficultyColors: Record<Difficulty, string> = {
    easy: 'bg-kazumon-success text-white border-green-600',
    normal: 'bg-kazumon-secondary text-white border-teal-600',
    hard: 'bg-kazumon-primary text-white border-red-600',
  }

  // カラーガイドのデータ（素数・色名・説明）
  const colorGuide: { prime: PrimeFactor; colorName: string; description: string }[] = [
    { prime: 2, colorName: 'ピンク', description: '2の累乗を表す' },
    { prime: 3, colorName: 'ブルー', description: '3の累乗を表す' },
    { prime: 5, colorName: 'イエロー', description: '5の累乗を表す' },
    { prime: 7, colorName: 'グリーン', description: '7の累乗を表す' },
  ]

  // デモブロックに使う素数（タイトル画面の飾り）
  const demoPrimes: PrimeFactor[] = [2, 3, 5, 7]

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center p-3 gap-2 overflow-hidden">
      {/* タイトルロゴ */}
      <div className="text-center animate-pop-in">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-kazumon-primary drop-shadow-lg">
          かずモン
        </h1>
        <p className="text-sm sm:text-xl mt-1 text-kazumon-dark">
          ブロックをかぞえて、九九の答えをあてよう！
        </p>
      </div>

      {/* デモブロック（タイトル画面の飾り） */}
      <div className="flex gap-2 animate-float">
        {demoPrimes.map((prime) => (
          <div
            key={prime}
            className="w-8 h-8 rounded-lg shadow-md border-2 border-white/50"
            style={{
              backgroundColor: PRIME_COLORS[prime],
            }}
          />
        ))}
      </div>

      {/* カラーガイド（ブロックの色と素数の対応） */}
      <div className="w-full max-w-md bg-white/70 rounded-2xl p-2 shadow-md border-2 border-kazumon-light/30">
        <p className="text-center text-sm font-bold text-kazumon-dark mb-1">
          🎨 ブロックのいろガイド
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {colorGuide.map((item) => (
            <div
              key={item.prime}
              className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm"
            >
              {/* 色見本 */}
              <div
                className="w-5 h-5 rounded-md shadow-sm border-2 border-white/50 flex-shrink-0"
                style={{ backgroundColor: PRIME_COLORS[item.prime] }}
              />
              {/* 数字・色名・説明 */}
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-bold text-kazumon-dark">
                  {item.prime}（{item.colorName}）
                </span>
                <span className="text-[10px] text-kazumon-dark/70">
                  {item.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 難易度選択 */}
      <div className="flex flex-col gap-2 w-full max-w-md">
        <p className="text-center text-lg font-bold text-kazumon-dark">
          レベルをえらんでね！
        </p>
        {difficulties.map((diff) => {
          const config = DIFFICULTY_CONFIGS[diff]
          const record = records?.[diff]
          const hasRecord = record && record.bestTime > 0
          const best = hasRecord ? formatTime(record.bestTime) : null
          return (
            <button
              key={diff}
              type="button"
              onClick={() => onStart(diff)}
              className={`
                btn-base
                ${difficultyColors[diff]}
                py-2 px-4
                text-lg
                border-4
                shadow-xl
                flex flex-col items-center gap-0.5
              `}
            >
              <span className="text-xl">{config.label}</span>
              <span className="text-xs opacity-90">{config.description}</span>
              {/* ベストタイム（記録がある場合のみ表示） */}
              {hasRecord && best && (
                <span className="text-xs bg-white/30 rounded-full px-2 py-0.5 mt-0.5 tabular-nums">
                  🏆 ベスト: {best.minutes > 0 ? `${best.minutes}ふん ` : ''}{best.secondsDecimal}びょう
                  {record.playCount > 1 && `（${record.playCount}かいプレイ）`}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}