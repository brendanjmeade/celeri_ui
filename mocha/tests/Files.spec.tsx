import '@testing-library/dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { expect } from 'chai'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react'
import { stub } from 'sinon'
import Files from '../../src/Components/Files'
import OpenDirectory from '../../src/Utilities/InMemoryFileSystem'

describe('The files panel displays openable files & their descriptions, and allows setting their paths/content', () => {
	it('Displays the file pickers', async () => {
		const directoryStructure = { root: { 'file.test': 'file contents' } }

		const directory = await OpenDirectory(directoryStructure)
		// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
		const setFile = stub<[string, string, string], void>()

		render(
			<Files
				folder={directory}
				files={{
					main: {
						name: 'Main',
						description: 'The Main File',
						extension: '.test',
						currentFilePath: ''
					}
				}}
				setFile={setFile}
			/>
		)
		expect(screen.getByTestId('file-main-label').textContent).to.equal('Main')
		expect(screen.getByTestId('file-main-description').textContent).to.equal(
			'The Main File'
		)
		screen.getByTestId('file-main-select')
		expect(
			screen.getByTestId('file-main-select-file.test').textContent
		).to.equal('file.test')
	})
	it('Can trigger a selection', async () => {
		const directoryStructure = { root: { 'file.test': 'file contents' } }

		const directory = await OpenDirectory(directoryStructure)
		// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
		const setFile = stub<[string, string, string], void>()
		setFile.returns()
		setFile.callsFake((type, name, contents) => {
			expect(type).to.equal('main')
			expect(name).to.equal('file.test')
			expect(contents).to.equal('file contents')
		})

		render(
			<Files
				folder={directory}
				files={{
					main: {
						name: 'Main',
						description: 'The Main File',
						extension: '.test',
						currentFilePath: ''
					}
				}}
				setFile={setFile}
			/>
		)
		fireEvent.change(screen.getByTestId('file-main-select'), {
			target: { value: 'file.test' }
		})
	})
	it('Displays the correct selection when provided a selected file', async () => {
		const directoryStructure = { root: { 'file.test': 'file contents' } }

		const directory = await OpenDirectory(directoryStructure)
		// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
		const setFile = stub<[string, string, string], void>()

		render(
			<Files
				folder={directory}
				files={{
					main: {
						name: 'Main',
						description: 'The Main File',
						extension: '.test',
						currentFilePath: 'file.test'
					}
				}}
				setFile={setFile}
			/>
		)
		expect(
			screen.getByTestId('file-main-select-file.test').textContent
		).to.equal('file.test')
		expect(
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
			(screen.getByTestId('file-main-select-file.test') as HTMLOptionElement)
				.selected
		).to.be.true
	})
})
