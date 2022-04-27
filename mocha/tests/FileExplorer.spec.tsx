/* eslint-disable @typescript-eslint/no-magic-numbers */
import '@testing-library/dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect } from 'chai'
import FileExplorer from '../../src/Components/FileExplorer'
import type { File } from '../../src/Utilities/FileSystemInterfaces'
import OpenDirectory from '../../src/Utilities/InMemoryFileSystem'

describe('The File Explorer', () => {
	it('Displays the files and folders in the root directory', async () => {
		const directoryStructure = {
			root: { 'file.test': 'file contents', folder: {} }
		}
		const directory = await OpenDirectory(directoryStructure)

		render(
			<FileExplorer
				root={directory}
				chooseFile={(): void => {}}
				close={(): void => {}}
				extension=''
			/>
		)
		expect(screen.getByTestId('file-file.test').textContent).to.equal(
			'file.test'
		)
		expect(screen.getByTestId('folder-folder').textContent).to.equal('folder')
	})
	it('Can drill down into a nested folder and show the content', async () => {
		const directoryStructure = {
			root: { 'file.test': 'file contents', folder: { file2: 'contents' } }
		}
		const directory = await OpenDirectory(directoryStructure)
		render(
			<FileExplorer
				root={directory}
				chooseFile={(): void => {}}
				close={(): void => {}}
				extension=''
			/>
		)
		fireEvent.click(screen.getByTestId('folder-folder'), {})
		await waitFor(() =>
			expect(screen.getByTestId('file-file2').textContent).to.equal('file2')
		)
		expect(screen.getByTestId('back-0').textContent).to.equal('..')
	})
	it('Can drill back out of a nested folder', async () => {
		const directoryStructure = {
			root: { 'file.test': 'file contents', folder: { file2: 'contents' } }
		}
		const directory = await OpenDirectory(directoryStructure)
		render(
			<FileExplorer
				root={directory}
				chooseFile={(): void => {}}
				close={(): void => {}}
				extension=''
			/>
		)
		fireEvent.click(screen.getByTestId('folder-folder'), {})
		await waitFor(() =>
			expect(screen.getByTestId('file-file2').textContent).to.equal('file2')
		)
		fireEvent.click(screen.getByTestId('back-0'), {})
		await waitFor(() =>
			expect(screen.getByTestId('file-file.test').textContent).to.equal(
				'file.test'
			)
		)
		expect(screen.getByTestId('folder-folder').textContent).to.equal('folder')
	})
	it('Can be closed', async () => {
		const directoryStructure = {
			root: { 'file.test': 'file contents', folder: { file2: 'contents' } }
		}
		const directory = await OpenDirectory(directoryStructure)
		let closed = 0
		render(
			<FileExplorer
				root={directory}
				chooseFile={(): void => {}}
				close={(): void => {
					closed += 1
				}}
				extension=''
			/>
		)
		fireEvent.click(screen.getByTestId('close-button'), {})
		expect(closed).to.equal(1)
		fireEvent.click(screen.getByTestId('explorer-backdrop'), {})
		expect(closed).to.equal(2)
	})
	it('Can display a selected files details', async () => {
		const directoryStructure = {
			root: { 'file.test': 'file contents', folder: { file2: 'contents' } }
		}
		const directory = await OpenDirectory(directoryStructure)
		render(
			<FileExplorer
				root={directory}
				chooseFile={(): void => {}}
				close={(): void => {}}
				extension=''
			/>
		)
		fireEvent.click(screen.getByTestId('file-file.test'), {})
		await waitFor(() =>
			expect(screen.getByTestId('selected-file-name').textContent).to.equal(
				'file.test'
			)
		)
		await waitFor(() =>
			expect(screen.getByTestId('selected-file-content').textContent).to.equal(
				'file contents'
			)
		)
	})
	it('Can select a file', async () => {
		const directoryStructure = {
			root: { 'file.test': 'file contents', folder: { file2: 'contents' } }
		}
		const directory = await OpenDirectory(directoryStructure)
		let selected: { path: string[]; file?: File } = { path: [] }
		render(
			<FileExplorer
				root={directory}
				chooseFile={(file, path): void => {
					selected = { file, path }
				}}
				close={(): void => {}}
				extension=''
			/>
		)
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
		expect((screen.getByTestId('select-button') as HTMLButtonElement).disabled)
			.to.be.true
		fireEvent.click(screen.getByTestId('folder-folder'), {})
		await waitFor(() =>
			expect(screen.getByTestId('file-file2').textContent).to.equal('file2')
		)
		fireEvent.click(screen.getByTestId('file-file2'), {})
		await waitFor(
			() =>
				expect(
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
					(screen.getByTestId('select-button') as HTMLButtonElement).disabled
				).to.be.false
		)
		fireEvent.click(screen.getByTestId('select-button'))
		expect(screen.getByTestId('file-file2').classList.contains('font-bold')).to
			.be.true
		expect(selected.file?.name).to.equal('file2')
		expect(selected.file?.path[0]).to.equal('root')
		expect(selected.file?.path[1]).to.equal('folder')
		expect(selected.file?.path[2]).to.equal('file2')
		expect(
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
			(screen.getByTestId('file-path-input') as HTMLInputElement).value
		).to.equal('root/folder/file2')
		expect(selected.path).to.have.length(2)
		expect(selected.path[0]).to.equal('folder')
		expect(selected.path[1]).to.equal('file2')
	})
})
