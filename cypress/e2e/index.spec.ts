/* eslint-disable cypress/require-data-selectors */
describe('Basic flow', () => {
	it('Should open the app', () => {
		cy.visit('/')
		cy.getTestId('topbar')
		cy.getTestId('map')
	})
})
