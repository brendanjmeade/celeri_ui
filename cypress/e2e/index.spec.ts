/* eslint-disable cypress/require-data-selectors */
describe('Basic flow', () => {
	it('Should open the app', () => {
		cy.visit('/')
		cy.getTestId('topbar')
		cy.getTestId('map')
		cy.getTestId('open-folder-button')
	})
	it('Should be able to open a folder', () => {
		cy.visit('/?fake-dir')
		cy.window().then((local): void => {
			;(local as { FakeDirectory?: any }).FakeDirectory = {
				root: {
					'command_file.json': '',
					'segment_file.csv': '',
					'unknown_format.test': ''
				}
			}
			cy.getTestId('open-folder-button').click()
			cy.getTestId('open-folder-topbar').contains('Working in root')
			cy.getTestId('file-command-select-command_file.json')
			cy.getTestId('file-command-select-segment_file.csv').should('not.exist')
			cy.getTestId('file-command-select-unknown_format.test').should(
				'not.exist'
			)

			cy.getTestId('file-segment-select-command_file.json').should('not.exist')
			cy.getTestId('file-segment-select-segment_file.csv')
			cy.getTestId('file-segment-select-unknown_format.test').should(
				'not.exist'
			)
		})
	})
})
