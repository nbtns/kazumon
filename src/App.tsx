import { useState } from 'react'
import type { GameState, Difficulty, GameStats } from './types'
import { TitleScreen } from './components/TitleScreen'
import { GameScreen } from './components/GameScreen'
import { ResultScreen } from './components/ResultScreen'

/**
 * かずモン - 九九ブロックゲーム
 *
 * ゲームの流れ:
 * 1. タイトル画面で難易度を選ぶ
 * 2. ゲーム画面でブロックを見て答えを当てる
 * 3. 結果画面で成績を見る
 */
export default function App() {
  const [gameState, setGameState] = useState<GameState>('title')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [stats, setStats] = useState<GameStats | null>(null)
  // ゲームをリスタートするためのキー（変更するとGameScreenが再マウントされる）
  const [gameKey, setGameKey] = useState(0)

  // ゲーム開始（タイトル画面 → ゲーム画面）
  const handleStart = (diff: Difficulty) => {
    setDifficulty(diff)
    setGameKey((prev) => prev + 1)
    setGameState('playing')
  }

  // ゲーム終了（ゲーム画面 → 結果画面）
  const handleGameEnd = (finalStats: GameStats) => {
    setStats(finalStats)
    setGameState('result')
  }

  // もう一度遊ぶ（結果画面 → ゲーム画面、同じ難易度）
  const handleRetry = () => {
    setGameKey((prev) => prev + 1)
    setGameState('playing')
  }

  // タイトルに戻る（結果画面 → タイトル画面）
  const handleTitle = () => {
    setGameState('title')
    setStats(null)
  }

  // ゲーム中にタイトルに戻る
  const handleExit = () => {
    setGameState('title')
    setStats(null)
  }

  // 現在の状態に応じて画面を切り替え
  switch (gameState) {
    case 'title':
      return <TitleScreen onStart={handleStart} />

    case 'playing':
      return (
        <GameScreen
          key={gameKey}
          difficulty={difficulty}
          onGameEnd={handleGameEnd}
          onExit={handleExit}
        />
      )

    case 'result':
      if (!stats) {
        // 万が一statsがない場合はタイトルに戻る
        return <TitleScreen onStart={handleStart} />
      }
      return (
        <ResultScreen
          stats={stats}
          difficulty={difficulty}
          onRetry={handleRetry}
          onTitle={handleTitle}
        />
      )

    default:
      return <TitleScreen onStart={handleStart} />
  }
}