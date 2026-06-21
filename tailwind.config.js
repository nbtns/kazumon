/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // kazumon専用のカラーパレット
        kazumon: {
          bg: '#FFF8E7',        // 背景のクリーム色
          primary: '#FF6B6B',   // メインの赤
          secondary: '#4ECDC4', // セカンダリのターコイズ
          accent: '#FFE66D',    // アクセントの黄色
          dark: '#2C3E50',      // ダークな文字色
          success: '#52C41A',   // 正解の緑
          error: '#FF4757',     // 不正解の赤
        },
      },
      fontFamily: {
        // 子供向けの読みやすいフォント
        kid: ['"M PLUS Rounded 1c"', 'sans-serif'],
      },
      animation: {
        'pop-in': 'popIn 0.3s ease-out',
        'shake': 'shake 0.4s ease-in-out',
        'bounce-slow': 'bounce 1.5s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        popIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '70%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-8px)' },
          '75%': { transform: 'translateX(8px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}