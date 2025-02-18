import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  let baseUrl;

  if (mode === 'development') {
    baseUrl = 'http://127.0.0.1:8085';
  } else if (mode === 'production') {
    baseUrl = 'http://127.0.0.1:8085';
  }

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_BASE_URL': JSON.stringify(baseUrl),
    },
  };
});
