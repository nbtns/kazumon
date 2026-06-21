import { useState, useEffect } from 'react'

interface NumberInputProps {
  // 答えを決定したときに呼ばれる
  onSubmit: (value: number) => void
  // 回答済みかどうか（回答後は入力を無効化する）
  disabled: boolean
  // 正解の数字（結果表示用）
  correctAnswer: number
  // ユーザーが決定した答え（null = 未回答）
  submittedAnswer: number | null
  // 次の問題へ進むときに呼ばれる（回答後のみ表示）
  onNext: () => void
  // 最後の問題かどうか（trueなら「けっかを見る」ボタンになる）
  isLastQuestion: boolean
}

/**
 * 数字入力コンポーネント
 * 子供が押しやすい大きなテンキー（0〜9）で答えを入力する
 * スマホはコンパクト、PCは大きく押しやすく表示
 */
export function NumberInput({
  onSubmit,
  disabled,
  correctAnswer,
  submittedAnswer,
  onNext,
  isLastQuestion,
}: NumberInputProps) {
  // 入力中の文字列（未入力は空文字）
  const [input, setInput] = useState('')

  // 新しい問題に進んだら入力をクリア
  useEffect(() => {
    if (!disabled) {
      setInput('')
    }
  }, [disabled])

  // 数字ボタンを押したとき
  const handleDigit = (digit: string) => {
    if (disabled) return
    // 3桁以上は入力しない（九九の答えは最大81なので2桁で十分だが余裕を持たせる）
    if (input.length >= 3) return
    setInput((prev) => prev + digit)
  }

  // 1文字消す（バックスペース）
  const handleBackspace = () => {
    if (disabled) return
    setInput((prev) => prev.slice(0, -1))
  }

  // 全部消す（クリア）
  const handleClear = () => {
    if (disabled) return
    setInput('')
  }

  // 決定ボタンを押したとき
  const handleSubmit = () => {
    if (disabled) return
    if (input === '') return
    onSubmit(Number(input))
  }

  // 回答後の表示用スタイル
  const inputDisplayClass = disabled
    ? submittedAnswer === correctAnswer
      ? 'bg-kazumon-success text-white border-kazumon-success'
      : 'bg-kazumon-error text-white border-kazumon-error animate-shake'
    : 'bg-white text-kazumon-dark border-kazumon-primary'

  // テンキーの数字配列（7〜9, 4〜6, 1〜3, 0 の順で電話/電卓風に配置）
  const digits = ['7', '8', '9', '4', '5', '6', '1', '2', '3']

  return (
    <div className="flex flex-col items-center gap-1.5 2xl:gap-2 w-full max-w-[240px] 2xl:max-w-[280px]">
      {/* 入力表示エリア */}
      <div
        className={`
          w-full h-10 2xl:h-12 rounded-xl border-2 shadow-inner
          flex items-center justify-center
          text-xl 2xl:text-2xl font-bold
          ${inputDisplayClass}
        `}
      >
        {input === '' && !disabled ? (
          <span className="text-kazumon-dark/30 text-xs 2xl:text-sm">すうじをいれてね</span>
        ) : (
          input || submittedAnswer
        )}
      </div>

      {/* テンキー */}
      <div className="grid grid-cols-3 gap-1.5 2xl:gap-2 w-full">
        {/* 7〜9, 4〜6, 1〜3 */}
        {digits.map((d) => (
          <button
            key={d}
            type="button"
            disabled={disabled}
            onClick={() => handleDigit(d)}
            className={`
              btn-base
              bg-white text-kazumon-dark border-2 border-kazumon-primary
              h-9 2xl:h-12 text-lg 2xl:text-xl shadow-md
              ${!disabled ? 'hover:bg-kazumon-accent/30 hover:scale-105' : 'opacity-50'}
            `}
            aria-label={`数字 ${d}`}
          >
            {d}
          </button>
        ))}

        {/* クリアボタン */}
        <button
          type="button"
          disabled={disabled}
          onClick={handleClear}
          className={`
            btn-base
            bg-kazumon-light text-kazumon-dark border-2 border-gray-400
            h-9 2xl:h-12 text-base 2xl:text-lg shadow-md
            ${!disabled ? 'hover:scale-105' : 'opacity-50'}
          `}
          aria-label="クリア"
        >
          C
        </button>

        {/* 0 */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleDigit('0')}
          className={`
            btn-base
            bg-white text-kazumon-dark border-2 border-kazumon-primary
            h-9 2xl:h-12 text-lg 2xl:text-xl shadow-md
            ${!disabled ? 'hover:bg-kazumon-accent/30 hover:scale-105' : 'opacity-50'}
          `}
          aria-label="数字 0"
        >
          0
        </button>

        {/* バックスペース（1文字消す） */}
        <button
          type="button"
          disabled={disabled}
          onClick={handleBackspace}
          className={`
            btn-base
            bg-kazumon-light text-kazumon-dark border-2 border-gray-400
            h-9 2xl:h-12 text-base 2xl:text-lg shadow-md
            ${!disabled ? 'hover:scale-105' : 'opacity-50'}
          `}
          aria-label="1文字消す"
        >
          ⌫
        </button>
      </div>

      {/* 決定ボタン または 次の問題へボタン */}
      {disabled ? (
        // 回答後：次の問題へ進むボタン（最後の問題なら「けっかを見る」）
        <button
          type="button"
          onClick={onNext}
          className="btn-base w-full h-10 2xl:h-12 text-lg 2xl:text-xl shadow-lg border-2 2xl:border-3 bg-kazumon-secondary text-white border-teal-600 hover:scale-105 animate-pop-in"
          aria-label={isLastQuestion ? '結果を見る' : '次の問題へ'}
        >
          {isLastQuestion ? 'けっかを見る →' : 'つぎのもんだいへ →'}
        </button>
      ) : (
        // 回答前：決定ボタン
        <button
          type="button"
          disabled={input === ''}
          onClick={handleSubmit}
          className={`
            btn-base
            w-full h-10 2xl:h-12 text-lg 2xl:text-xl shadow-lg border-2 2xl:border-3
            ${input === ''
              ? 'bg-gray-200 text-gray-400 border-gray-300'
              : 'bg-kazumon-primary text-white border-red-600 hover:scale-105'}
          `}
          aria-label="決定"
        >
          けってい
        </button>
      )}
    </div>
  )
}