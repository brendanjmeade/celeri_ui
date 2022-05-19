/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import eslintPlugin from '@nabla/vite-plugin-eslint'
import react from '@vitejs/plugin-react'
import istanbul from 'rollup-plugin-istanbul'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
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
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: [
				'favicon.png',
				'robots.txt',
				'apple-touch-icon.png',
				'icons/*.svg',
				'fonts/*.woff2',
				'docs/**'
			],
			manifest: {
				theme_color: '#BD34FE',
				icons: [
					{
						src: '/android-chrome-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any maskable'
					},
					{
						src: '/android-chrome-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					}
				]
			}
		}),
		mode === 'test' &&
			istanbul({
				include: ['src/**/*.{ts,tsx}']
			})
	]
}))
