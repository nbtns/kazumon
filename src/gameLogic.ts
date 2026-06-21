import type { Problem, Difficulty, DifficultyConfig, Block, PrimeFactor, Tower, TimeRecords } from './types'

// 難易度ごとの設定
// 出題する答えのリストで難易度を分ける
export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: 'かんたん',
    description: '2〜49（素数/2乗/簡単な合成数）',
    // 素数 / 2乗 / 簡単な合成数
    answerPool: [2, 3, 4, 5, 6, 7, 9, 10, 14, 15, 21, 25, 35, 49],
    // 答えプールの問題をすべて出題する
    questionCount: 14,
  },
  normal: {
    label: 'ふつう',
    description: '8〜63（3因数/複合形）',
    // 3因数 / 複合形
    answerPool: [8, 12, 18, 20, 27, 28, 30, 42, 45, 63],
    // 答えプールの問題をすべて出題する
    questionCount: 10,
  },
  hard: {
    label: 'むずかしい',
    description: '16〜81（高べき乗/大きな数）',
    // 高べき乗 / 大きな数
    answerPool: [16, 24, 32, 36, 40, 48, 54, 56, 64, 72, 81],
    // 答えプールの問題をすべて出題する
    questionCount: 11,
  },
}

// 素数と色の対応（カズモンのルールに基づく）
export const PRIME_COLORS: Record<PrimeFactor, string> = {
  2: '#FF6B6B', // ピンク
  3: '#5BAEF5', // ブルー
  5: '#FECA57', // イエロー
  7: '#6BCF7F', // グリーン
}

// 配列をシャッフルする（Fisher-Yates）
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * 答えになる1〜9の因数ペアをすべて見つける
 * 例: 12 → [[2,6], [3,4], [1,12]は範囲外なので除外]
 */
function findFactorPairs(n: number): [number, number][] {
  const pairs: [number, number][] = []
  for (let i = 1; i <= 9; i++) {
    if (n % i === 0) {
      const j = n / i
      if (j >= 1 && j <= 9) {
        pairs.push([i, j])
      }
    }
  }
  return pairs
}

// 答えから問題を1つ生成する（因数ペアをランダムに選ぶ）
function problemFromAnswer(answer: number): Problem {
  const pairs = findFactorPairs(answer)
  // 因数ペアが見つからない場合は 1 × answer でフォールバック
  if (pairs.length === 0) {
    return { multiplicand: 1, multiplier: answer, answer }
  }
  const [multiplicand, multiplier] = pairs[Math.floor(Math.random() * pairs.length)]
  return { multiplicand, multiplier, answer }
}

// 問題を1つ生成する
export function generateProblem(difficulty: Difficulty): Problem {
  const config = DIFFICULTY_CONFIGS[difficulty]
  const answer = config.answerPool[Math.floor(Math.random() * config.answerPool.length)]
  return problemFromAnswer(answer)
}

// 重複しない問題リストを生成する
export function generateProblems(difficulty: Difficulty, count: number): Problem[] {
  const problems: Problem[] = []
  const seen = new Set<number>()
  const config = DIFFICULTY_CONFIGS[difficulty]

  // 出題プールをシャッフルして重複なしで問題を作成
  const shuffledPool = shuffle(config.answerPool)
  for (const answer of shuffledPool) {
    if (problems.length >= count) break
    if (!seen.has(answer)) {
      seen.add(answer)
      problems.push(problemFromAnswer(answer))
    }
  }

  // プールが足りない場合は重複を許可して補充
  while (problems.length < count) {
    problems.push(generateProblem(difficulty))
  }

  return problems
}

/**
 * 数字を素因数分解する（九九の範囲なので素数は2, 3, 5, 7のみ）
 * 例: 12 → [2, 2, 3]
 */
export function primeFactorize(n: number): PrimeFactor[] {
  const factors: PrimeFactor[] = []
  let current = n

  if (current <= 1) return []

  const primes: PrimeFactor[] = [2, 3, 5, 7]

  for (const prime of primes) {
    while (current % prime === 0) {
      factors.push(prime)
      current /= prime
    }
  }

  // 九九の範囲外の素数（11以上など）は扱わない前提
  return factors
}

/**
 * 素因数分解の結果をタワー配列に変換する
 * 同じ素数を1つのタワーにまとめる
 * 例: [2, 2, 3] → [{prime: 2, count: 2, color: '#FF6B6B'}, {prime: 3, count: 1, color: '#4ECDC4'}]
 */
export function factorsToTowers(factors: PrimeFactor[]): Tower[] {
  if (factors.length === 0) return []

  // 素数ごとにカウント
  const counts = new Map<PrimeFactor, number>()
  for (const f of factors) {
    counts.set(f, (counts.get(f) || 0) + 1)
  }

  // 素数を昇順（小さい順）にソートしてタワーを作る
  const sortedPrimes = [...counts.keys()].sort((a, b) => a - b)

  return sortedPrimes.map((prime) => ({
    prime,
    count: counts.get(prime)!,
    color: PRIME_COLORS[prime],
  }))
}

/**
 * 問題からタワー配列を生成する（ブロック表示用）
 * 答えを素因数分解し、タワー構造に変換する
 */
export function generateTowers(problem: Problem): Tower[] {
  const factors = primeFactorize(problem.answer)
  return factorsToTowers(factors)
}

// ブロックの配列を生成する（互換性用、タワーから展開）
export function generateBlocks(problem: Problem): Block[] {
  const towers = generateTowers(problem)
  const blocks: Block[] = []
  let id = 0
  for (const tower of towers) {
    for (let i = 0; i < tower.count; i++) {
      blocks.push({ id: id++, color: tower.color })
    }
  }
  return blocks
}

// ========================================
// タイム記録の保存・読み込み（localStorage）
// ========================================

// localStorageに保存するときのキー
const TIME_RECORDS_KEY = 'kazumon-time-records'

// 空のタイム記録（初期値）
function createEmptyRecords(): TimeRecords {
  return {
    easy: { bestTime: 0, playCount: 0, lastTime: 0 },
    normal: { bestTime: 0, playCount: 0, lastTime: 0 },
    hard: { bestTime: 0, playCount: 0, lastTime: 0 },
  }
}

/**
 * localStorageから全難易度のタイム記録を読み込む
 * データがない場合や読み込みエラー時は空の記録を返す
 */
export function loadTimeRecords(): TimeRecords {
  try {
    const data = localStorage.getItem(TIME_RECORDS_KEY)
    if (!data) return createEmptyRecords()
    const parsed = JSON.parse(data) as TimeRecords
    // 念のため各難易度のデータがあるか確認
    if (!parsed.easy || !parsed.normal || !parsed.hard) {
      return createEmptyRecords()
    }
    return parsed
  } catch {
    // 読み込みエラー時は空の記録を返す
    return createEmptyRecords()
  }
}

/**
 * 1プレイ分の結果を記録に保存する
 * ベストタイム更新時はbestTimeを更新、プレイ回数と最終タイムも更新
 * 戻り値: 新記録かどうか（true = ベストタイム更新）
 */
export function saveTimeRecord(difficulty: Difficulty, timeMs: number): boolean {
  const records = loadTimeRecords()
  const record = records[difficulty]
  const isNewBest = record.bestTime === 0 || timeMs < record.bestTime

  records[difficulty] = {
    bestTime: isNewBest ? timeMs : record.bestTime,
    playCount: record.playCount + 1,
    lastTime: timeMs,
  }

  try {
    localStorage.setItem(TIME_RECORDS_KEY, JSON.stringify(records))
  } catch {
    // 保存エラー時は何もしない（ゲーム自体は続行可能）
  }

  return isNewBest
}

/**
 * ミリ秒を「○分○.○○秒」形式に変換する
 * 小数点第二位まで表示する（例: 12.34秒、1:05.67）
 * 0秒未満の場合は「0.00秒」とする
 */
export function formatTime(ms: number): {
  minutes: number
  seconds: number
  secondsDecimal: string
} {
  if (ms <= 0) return { minutes: 0, seconds: 0, secondsDecimal: '0.00' }
  const totalSec = ms / 1000
  const minutes = Math.floor(totalSec / 60)
  const seconds = totalSec % 60
  // 小数点第二位まで表示（例: 12.34）
  const secondsDecimal = seconds.toFixed(2)
  return { minutes, seconds: Math.floor(seconds), secondsDecimal }
}
