import '@cypress/code-coverage/support'
import '@testing-library/cypress/add-commands'
Cypress.Commands.add('getTestId', (testId: string) => {
	return cy.get(`[data-testid="${testId}"]`)
})
