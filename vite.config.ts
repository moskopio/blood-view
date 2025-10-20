import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import * as path from "path"

export default defineConfig({
  base:    "/blood-view",
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
    },
  },

  server: {
    proxy: {
      "/mock/data": {
        target: "https://mockapi-furw4tenlq-ez.a.run.app",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/mock\/data/, "/data"),
      },
    },
  },
})
