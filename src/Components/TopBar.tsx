import type { ReactElement } from 'react'
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
	return (
		<div
			data-testid='topbar'
			className='p-2 bg-gray-900 text-white flex flex-row justify-between'
		>
			<h3 className='text-lg font-bold'>Celeri UI</h3>
			<span
				data-testid='open-folder-topbar'
				className='flex flex-row gap-2 items-center'
			>
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
						Save Files
					</button>
				) : (
					<></>
				)}
			</span>
		</div>
	)
}

export default TopBar
