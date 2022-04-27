import type { ReactElement } from 'react'
import { ActionCreators } from 'redux-undo'
import { useAppDispatch, useAppSelector } from 'State/Hooks'
import type { Directory } from 'Utilities/FileSystemInterfaces'

function TopBar({
	folder,
	openFolder,
	filesOpen,
	saveFiles
}: {
	folder: Directory | undefined
	openFolder: () => void
	filesOpen: boolean
	saveFiles: () => void
}): ReactElement {
	function onClick(): void {
		openFolder()
	}
	const dispatch = useAppDispatch()
	const [canUndo, canRedo] = useAppSelector(state => [
		state.main.past.length > 0,
		state.main.future.length > 0
	])
	return (
		<div
			data-testid='topbar'
			className='p-2 bg-gray-900 text-white flex flex-row justify-between'
		>
			<h3 className='text-lg font-bold'>celeri_ui</h3>
			<span
				data-testid='open-folder-topbar'
				className='flex flex-row gap-2 items-center'
			>
				{folder ? (
					<button
						type='button'
						onClick={(): void => {
							dispatch(ActionCreators.undo())
						}}
						data-testid='undo-button'
						disabled={!canUndo}
					>
						Undo
					</button>
				) : (
					<></>
				)}
				{folder ? (
					<button
						type='button'
						onClick={(): void => {
							dispatch(ActionCreators.redo())
						}}
						disabled={!canRedo}
						data-testid='undo-button'
					>
						Redo
					</button>
				) : (
					<></>
				)}
				{folder ? (
					<span>Working in {folder.name}</span>
				) : (
					<button
						type='button'
						onClick={onClick}
						data-testid='open-folder-button'
					>
						Open Folder
					</button>
				)}
				{filesOpen ? (
					<button
						type='button'
						onClick={saveFiles}
						data-testid='save-file-button'
					>
						Save Active Files
					</button>
				) : (
					<></>
				)}
			</span>
		</div>
	)
}

export default TopBar
