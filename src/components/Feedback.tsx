import { useMemo } from 'react'
import type { AnswerResult, Problem } from '../types'
import { primeFactorize } from '../gameLogic'

// 正解時の褒め言葉リスト（ランダムで1つ選ばれる）
const PRAISES = ['せいかい！🎉', 'すごい！✨', 'よくできた！👏', 'そのとおり！🌟', 'パーフェクト！💯']

interface FeedbackProps {
  result: AnswerResult
  problem: Problem
}

/**
 * 回答後のフィードバックを表示するコンポーネント
 * 正解時は褒め言葉と素因数分解の解説、不正解時は正解を教える
 */
export function Feedback({ result }: FeedbackProps) {
  const { isCorrect, correctAnswer } = result
  const factors = primeFactorize(correctAnswer)
  const factorExpression = factors.length > 0 ? factors.join(' x ') : '1'

  // 褒め言葉は回答結果が変わるたびに1回だけランダム選択する
  // （タイマー更新による再レンダリングでメッセージが切り替わらないよう固定）
  const praise = useMemo(
    () => PRAISES[Math.floor(Math.random() * PRAISES.length)],
    [result]
  )

  if (isCorrect) {
    return (
      <div className='animate-pop-in flex flex-col items-center gap-1'>
        <p className='text-2xl font-bold text-kazumon-success'>{praise}</p>
        <p className='text-base text-kazumon-dark'>{correctAnswer} = {factorExpression}</p>
      </div>
    )
  }

  return (
    <div className='animate-pop-in flex flex-col items-center gap-1'>
      <p className='text-2xl font-bold text-kazumon-error'>ちがうよ！🤔</p>
      <p className='text-base text-kazumon-dark'>せいかいは <span className='text-xl font-bold text-kazumon-primary'>{correctAnswer}</span></p>
      <p className='text-sm text-kazumon-dark/70'>{correctAnswer} = {factorExpression}</p>
    </div>
  )
}
