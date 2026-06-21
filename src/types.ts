// ゲームの状態
export type GameState = 'title' | 'playing' | 'result'

// 問題の難易度レベル
export type Difficulty = 'easy' | 'normal' | 'hard'

// 九九の問題（かけられる数 × かける数）
export interface Problem {
  multiplicand: number  // かけられる数（例: 3）
  multiplier: number    // かける数（例: 4）
  answer: number        // 答え（例: 12）
}

// 素数の種類（九九の範囲なので2, 3, 5, 7のみ）
export type PrimeFactor = 2 | 3 | 5 | 7

// 1つのタワー（同じ素数のブロックを縦に重ねたもの）
export interface Tower {
  prime: PrimeFactor    // どの素数か
  count: number         // 何個重ねるか（タワーの高さ）
  color: string         // ブロックの色
}

// ブロック1つの表示情報
export interface Block {
  id: number
  // ブロックの色（素数ごとに色を変える）
  color: string
}

// 回答結果
export interface AnswerResult {
  isCorrect: boolean
  selectedAnswer: number
  correctAnswer: number
}

// ゲームの統計情報
export interface GameStats {
  totalQuestions: number
  correctCount: number
  wrongCount: number
  streak: number         // 連続正解数
  maxStreak: number      // 最大連続正解数
  startTime: number
  endTime: number
}

// 難易度ごとの設定
export interface DifficultyConfig {
  label: string
  description: string
  // 出題する答えのリスト（この中からランダムに出題する）
  answerPool: number[]
  // 1ゲームあたりの問題数
  questionCount: number
}

// 難易度ごとのタイム記録（localStorageに保存する）
export interface TimeRecord {
  bestTime: number      // ベストタイム（ミリ秒）、0は未記録
  playCount: number     // プレイ回数
  lastTime: number      // 最後にプレイしたときのタイム（ミリ秒）
}

// 全難易度のタイム記録
export type TimeRecords = Record<Difficulty, TimeRecord>
