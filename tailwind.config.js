const defaultConfig = require('tailwindcss/defaultConfig')
const formsPlugin = require('@tailwindcss/forms')

module.exports = {
	content: ['index.html', 'src/**/*.tsx'],
	theme: {
		fontFamily: {
			sans: ['Inter', ...defaultConfig.theme.fontFamily.sans]
		},
		fontSize: {
			xs: '.6rem',
			sm: '.65rem',
			tiny: '.65rem',
			base: '0.75rem',
			lg: '0.85rem',
			xl: '0.9rem'
		}
	},
	experimental: { optimizeUniversalDefaults: true },
	plugins: [formsPlugin]
}
