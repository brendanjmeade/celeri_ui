/* eslint-disable @typescript-eslint/no-unused-vars */
declare module '@cypress/code-coverage/task' {
	const task: Cypress.PluginConfig
	export = task
}

namespace Cypress {
	interface Chainable {
		getTestId(testId: string): Chainable<Element>
	}
}
