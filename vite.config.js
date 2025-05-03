import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Thay đổi port nếu backend chạy ở port khác
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
