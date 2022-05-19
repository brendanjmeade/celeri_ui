/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import eslintPlugin from '@nabla/vite-plugin-eslint'
import react from '@vitejs/plugin-react'
import istanbul from 'rollup-plugin-istanbul'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => ({
	base: './',
	server: {
		hmr: process.env.GITPOD_WORKSPACE_URL
			? {
					// Due to port fowarding, we have to replace
					// 'https' with the forwarded port, as this
					// is the URI created by Gitpod.
					host: process.env.GITPOD_WORKSPACE_URL.replace('https://', '3000-'),
					protocol: 'wss',
					clientPort: 443
			  }
			: true
	},
	plugins: [
		tsconfigPaths(),
		react(),
		eslintPlugin(),
		mode === 'test' &&
			istanbul({
				include: ['src/**/*.{ts,tsx}']
			})
	]
}))
