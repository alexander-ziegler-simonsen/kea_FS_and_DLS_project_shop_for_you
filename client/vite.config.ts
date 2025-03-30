import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://chakra-ui.com/docs/get-started/frameworks/vite#setup-vite-config-paths
// vite config path to automatically sync tsconfig with vite
import tsconfigPaths from "vite-tsconfig-paths"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
})
