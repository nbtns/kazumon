import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Problem, Difficulty, AnswerResult, GameStats } from '../types'
import { DIFFICULTY_CONFIGS, generateProblems, formatTime } from '../gameLogic'
import { BlockGrid } from './BlockGrid'
import { NumberInput } from './NumberInput'
import { Feedback } from './Feedback'

interface GameScreenProps {
  difficulty: Difficulty
  onGameEnd: (stats: GameStats) => void
  onExit: () => void
}

/**
 * ゲームプレイ画面
 * ブロックを表示し、数字を入力して答えるメインのゲーム画面
 */
export function GameScreen({ difficulty, onGameEnd, onExit }: GameScreenProps) {
  const config = DIFFICULTY_CONFIGS[difficulty]

  // 問題リストを生成（難易度変更時のみ）
  const problems = useMemo(
    () => generateProblems(difficulty, config.questionCount),
    [difficulty, config.questionCount]
  )

  // 現在の問題番号（0始まり）
  const [currentIndex, setCurrentIndex] = useState(0)
  // ユーザーが入力・決定した答え（null = 未回答）
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  // 回答結果
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null)
  // ゲーム統計
  const [stats, setStats] = useState<GameStats>({
    totalQuestions: config.questionCount,
    correctCount: 0,
    wrongCount: 0,
    streak: 0,
    maxStreak: 0,
    startTime: Date.now(),
    endTime: 0,
  })

  const currentProblem: Problem = problems[currentIndex]

  // リアルタイムタイマー表示用（1秒ごとに更新）
  const [elapsedTime, setElapsedTime] = useState(0)

  // 新しい問題に進んだら状態をリセット
  useEffect(() => {
    setSelectedAnswer(null)
    setAnswerResult(null)
  }, [currentIndex])

  // ゲーム中のリアルタイムタイマー（50ミリ秒ごとに経過時間を更新）
  // 小数点第二位まで表示するため、細かい間隔で更新
  useEffect(() => {
    // 最後の問題に回答済み（endTimeが設定済み）ならタイマー停止
    if (stats.endTime > 0) return
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - stats.startTime)
    }, 50)
    return () => clearInterval(timer)
  }, [stats.startTime, stats.endTime])

  // 答えを決定したときの処理
  const handleSubmit = useCallback(
    (value: number) => {
      if (selectedAnswer !== null) return // 既に回答済みなら無視

      const isCorrect = value === currentProblem.answer
      const result: AnswerResult = {
        isCorrect,
        selectedAnswer: value,
        correctAnswer: currentProblem.answer,
      }

      setSelectedAnswer(value)
      setAnswerResult(result)

      // 統計を更新
      // 最後の問題なら、解答した瞬間の時刻をendTimeに記録する
      // （フィードバック表示待ち時間を含めないため）
      const isLastQuestion = currentIndex + 1 >= problems.length
      setStats((prev) => {
        const newStreak = isCorrect ? prev.streak + 1 : 0
        return {
          ...prev,
          correctCount: prev.correctCount + (isCorrect ? 1 : 0),
          wrongCount: prev.wrongCount + (isCorrect ? 0 : 1),
          streak: newStreak,
          maxStreak: Math.max(prev.maxStreak, newStreak),
          endTime: isLastQuestion ? Date.now() : prev.endTime,
        }
      })
    },
    [selectedAnswer, currentProblem, currentIndex, problems.length]
  )

  // 「次の問題へ」ボタンを押したときの処理
  const handleNext = useCallback(() => {
    const isLastQuestion = currentIndex + 1 >= problems.length
    if (isLastQuestion) {
      // 最後の問題なら結果画面へ（endTimeは解答時に記録済み）
      onGameEnd(stats)
    } else {
      // 次の問題へ進む
      setCurrentIndex((prev) => prev + 1)
    }
  }, [currentIndex, problems.length, stats, onGameEnd])

  // 進捗バーの計算
  const progress = ((currentIndex + (selectedAnswer !== null ? 1 : 0)) / problems.length) * 100

  // リアルタイムタイマーの表示用フォーマット
  const timeDisplay = formatTime(elapsedTime)

  return (
    <div className="h-screen flex flex-col p-3 sm:p-4 gap-3 sm:gap-4 overflow-y-auto justify-start">
      {/* ヘッダー：進捗・スコア・終了ボタン */}
      <header className="flex items-center justify-between gap-3 flex-shrink-0">
        {/* 終了ボタン */}
        <button
          type="button"
          onClick={onExit}
          className="btn-base bg-white text-kazumon-dark border-2 border-gray-300 px-3 py-1.5 text-sm shadow-md"
          aria-label="タイトルに戻る"
        >
          ✕
        </button>

        {/* 進捗バー */}
        <div className="flex-1 max-w-md">
          <div className="flex justify-between text-xs mb-0.5">
            <span className="font-bold text-kazumon-dark">
              {currentIndex + 1} / {problems.length}
            </span>
            {/* リアルタイムタイマー（小数点第二位まで表示） */}
            <span className="font-bold text-kazumon-primary tabular-nums">
              ⏱️ {timeDisplay.minutes > 0 ? `${timeDisplay.minutes}:` : ''}
              {timeDisplay.secondsDecimal}
            </span>
            <span className="font-bold text-kazumon-secondary">
              🔥 {stats.streak}れんぞく
            </span>
          </div>
          <div className="h-3 bg-white rounded-full shadow-inner overflow-hidden">
            <div
              className="h-full bg-kazumon-primary transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 正解数 */}
        <div className="text-right flex-shrink-0">
          <span className="text-xs text-kazumon-dark/70">せいかい</span>
          <span className="text-lg font-bold text-kazumon-success ml-1">
            {stats.correctCount}
          </span>
        </div>
      </header>

      {/* メインエリア：ブロック表示 */}
      <main className="flex flex-col items-center gap-2 sm:gap-3">
        {/* 問題文 */}
        <p className="text-xl sm:text-2xl font-bold text-kazumon-dark text-center">
          このブロックはいくつ？
        </p>

        {/* ブロックグリッド（固定サイズの枠付き） */}
        <BlockGrid problem={currentProblem} animate={selectedAnswer === null} />

        {/* フィードバック（高さを固定してレイアウト崩れを防ぐ） */}
        <div style={{ minHeight: '80px' }} className="flex items-center justify-center">
          {answerResult && (
            <Feedback result={answerResult} problem={currentProblem} />
          )}
        </div>
      </main>

      {/* 数字入力エリア */}
      <footer className="flex justify-center flex-shrink-0">
        <NumberInput
          onSubmit={handleSubmit}
          disabled={selectedAnswer !== null}
          correctAnswer={currentProblem.answer}
          submittedAnswer={selectedAnswer}
          onNext={handleNext}
          isLastQuestion={currentIndex + 1 >= problems.length}
        />
      </footer>
    </div>
  )
}