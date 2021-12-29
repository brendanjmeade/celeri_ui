import type { ReactElement } from 'react'
import type { Directory } from 'Utilities/FileSystemInterfaces'

function TopBar({
	folder,
	openFolder
}: {
	folder: Directory | undefined
	openFolder: () => void
}): ReactElement {
	function onClick(): void {
		openFolder()
	}
	return (
		<div
			data-testid='topbar'
			className='p-2 bg-gradient-to-r from-blue-700 to-green-700 text-white flex flex-row justify-between'
		>
			<h3 className='text-lg font-bold'>Celeri UI</h3>
			<span data-testid='open-folder-topbar'>
				{folder ? (
					<>Working in {folder.name}</>
				) : (
					<button
						type='button'
						onClick={onClick}
						data-testid='open-folder-button'
					>
						Open Folder
					</button>
				)}
			</span>
		</div>
	)
}

export default TopBar
