import { useState, useEffect } from 'react'
import type { GameStats, Difficulty } from '../types'
import { DIFFICULTY_CONFIGS, saveTimeRecord, loadTimeRecords, formatTime } from '../gameLogic'

interface ResultScreenProps {
  stats: GameStats
  difficulty: Difficulty
  onRetry: () => void
  onTitle: () => void
}

/**
 * ゲーム終了後の結果画面
 * 正答率、連続正解記録、かかった時間、ベストタイムを表示する
 */
export function ResultScreen({ stats, difficulty, onRetry, onTitle }: ResultScreenProps) {
  const accuracy = stats.totalQuestions > 0
    ? Math.round((stats.correctCount / stats.totalQuestions) * 100)
    : 0

  // かかった時間（ミリ秒）
  const elapsedMs = stats.endTime - stats.startTime
  const { minutes, secondsDecimal } = formatTime(elapsedMs)

  // タイム記録をlocalStorageに保存し、新記録かどうかを判定
  // useEffectで初回レンダリング時に1回だけ保存する
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [bestTime, setBestTime] = useState(0)
  const [playCount, setPlayCount] = useState(0)

  useEffect(() => {
    const newRecord = saveTimeRecord(difficulty, elapsedMs)
    const records = loadTimeRecords()
    setIsNewRecord(newRecord)
    setBestTime(records[difficulty].bestTime)
    setPlayCount(records[difficulty].playCount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ベストタイムの表示用
  const best = formatTime(bestTime)

  // スター評価（正答率に応じて1〜3つ星）
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0

  // 評価メッセージ
  let message = 'がんばったね！'
  if (accuracy === 100) message = 'パーフェクト！すごいぞ！🏆'
  else if (accuracy >= 90) message = 'ほぼパーフェクト！🌟'
  else if (accuracy >= 70) message = 'よくできた！✨'
  else if (accuracy >= 50) message = 'もうすこしがんばろう！💪'

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center p-2 2xl:p-4 gap-2 2xl:gap-4 overflow-hidden">
      <div className="animate-pop-in flex flex-col items-center gap-2 2xl:gap-4 w-full max-w-md">
        {/* 結果タイトル */}
        <h2 className="text-3xl 2xl:text-4xl font-extrabold text-kazumon-primary">
          けっかはっぴょう
        </h2>

        {/* スター評価 */}
        <div className="flex gap-2 text-3xl 2xl:text-4xl">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={i < stars ? 'animate-pop-in' : 'opacity-20'}
              style={{ animationDelay: `${i * 200}ms` }}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* メッセージ */}
        <p className="text-lg 2xl:text-2xl font-bold text-kazumon-dark text-center">
          {message}
        </p>

        {/* 新記録バッジ（新記録の時だけ表示） */}
        {isNewRecord && playCount > 1 && (
          <div className="animate-pop-in bg-kazumon-secondary text-white px-3 py-1 rounded-full font-bold text-base shadow-lg">
            🎉 新記録！
          </div>
        )}
        {/* 初回プレイ時のメッセージ */}
        {playCount === 1 && (
          <div className="animate-pop-in bg-kazumon-success text-white px-3 py-1 rounded-full font-bold text-base shadow-lg">
            🎊 初クリア記録！
          </div>
        )}

        {/* 統計情報カード */}
        <div className="w-full bg-white rounded-2xl shadow-lg p-2 2xl:p-4 flex flex-col gap-1">
          <div className="flex justify-between items-center text-sm 2xl:text-lg">
            <span className="text-kazumon-dark/70">レベル</span>
            <span className="font-bold text-kazumon-primary">
              {DIFFICULTY_CONFIGS[difficulty].label}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm 2xl:text-lg">
            <span className="text-kazumon-dark/70">もんだいすう</span>
            <span className="font-bold">{stats.totalQuestions}</span>
          </div>
          <div className="flex justify-between items-center text-sm 2xl:text-lg">
            <span className="text-kazumon-dark/70">せいかい</span>
            <span className="font-bold text-kazumon-success">
              {stats.correctCount} / {stats.totalQuestions}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm 2xl:text-lg">
            <span className="text-kazumon-dark/70">せいとうりつ</span>
            <span className="font-bold text-kazumon-primary">{accuracy}%</span>
          </div>
          <div className="flex justify-between items-center text-sm 2xl:text-lg">
            <span className="text-kazumon-dark/70">れんぞくせいかい</span>
            <span className="font-bold text-kazumon-secondary">
              {stats.maxStreak}れんぞく
            </span>
          </div>
          <div className="flex justify-between items-center text-sm 2xl:text-lg">
            <span className="text-kazumon-dark/70">じかん</span>
            <span className={`font-bold tabular-nums ${isNewRecord ? 'text-kazumon-secondary' : ''}`}>
              {minutes > 0 ? `${minutes}ふん ` : ''}{secondsDecimal}びょう
              {isNewRecord && playCount > 1 && ' 🎉'}
            </span>
          </div>
          {/* ベストタイム（2回目以降のプレイで表示） */}
          {playCount > 1 && (
            <div className="flex justify-between items-center text-sm 2xl:text-lg border-t-2 border-gray-100 pt-1 mt-0.5">
              <span className="text-kazumon-dark/70">ベストタイム</span>
              <span className="font-bold text-kazumon-secondary tabular-nums">
                {best.minutes > 0 ? `${best.minutes}ふん ` : ''}{best.secondsDecimal}びょう
              </span>
            </div>
          )}
          {/* プレイ回数 */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-kazumon-dark/60">プレイかいすう</span>
            <span className="font-bold text-kazumon-dark/60">{playCount}かい</span>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex flex-col gap-2 w-full">
          <button
            type="button"
            onClick={onRetry}
            className="btn-base bg-kazumon-primary text-white border-4 border-red-600 py-2 2xl:py-3 text-lg 2xl:text-xl shadow-xl"
          >
            もういちどあそぶ
          </button>
          <button
            type="button"
            onClick={onTitle}
            className="btn-base bg-white text-kazumon-dark border-4 border-kazumon-secondary py-2 2xl:py-3 text-lg 2xl:text-xl shadow-xl"
          >
            タイトルにもどる
          </button>
        </div>
      </div>
    </div>
  )
}