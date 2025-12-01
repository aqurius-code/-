
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 표준 웹 호스팅(Vercel, Netlify, GitHub Pages 등)용 설정
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    // 대용량 파일을 자동으로 분할하여 로딩 속도 최적화
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          gemini: ['@google/genai'],
        },
      },
    },
  },
});
