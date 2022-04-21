/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { ReactElement } from 'react'
import { useState } from 'react'
import type { Directory, File } from '../Utilities/FileSystemInterfaces'

function GenerateBackPathDots(levels: number): string {
	let result = '..'
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	for (let index = 2; index < levels; index += 1) {
		result = `${result}/..`
	}
	return result
}

export default function FileExplorer({
	root,
	chooseFile,
	close,
	extension
}: {
	root: Directory
	chooseFile: (file: File, path: string[]) => void
	close: () => void
	extension: string
}): ReactElement {
	const [selectedFile, setSelectedFile] = useState<File>()
	const [seletedFileContents, setSelectedFileContents] = useState<string>('')
	const [directoryPath, setDirectoryPath] = useState<Directory[]>([root])
	const currentDirectory = directoryPath.at(-1) ?? root

	const folders = [
		...directoryPath
			.filter(v => v !== root)
			.map((value, index) => (
				<button
					// eslint-disable-next-line react/no-array-index-key
					key={index}
					type='button'
					data-testid={`back-${index}`}
					onClick={async (): Promise<void> => {
						setDirectoryPath(directoryPath.slice(0, index + 1))
					}}
				>
					{GenerateBackPathDots(directoryPath.length - index)}
				</button>
			)),
		...currentDirectory.folderList.map(folderName => (
			<button
				type='button'
				key={folderName}
				data-testid={`folder-${folderName}`}
				onClick={async (): Promise<void> => {
					setDirectoryPath([
						...directoryPath,
						await currentDirectory.getDirectory(folderName)
					])
				}}
			>
				{folderName}
			</button>
		))
	]
	const files = currentDirectory.fileList
		.filter(v => v.endsWith(extension))
		.map(fileName => (
			<button
				type='button'
				key={fileName}
				data-testid={`file-${fileName}`}
				onClick={async (): Promise<void> => {
					const file = await currentDirectory.getFile(fileName)
					setSelectedFile(file)
					setSelectedFileContents(await file.getContents())
				}}
			>
				{fileName}
			</button>
		))

	return (
		<div
			role='none'
			data-testid='explorer-backdrop'
			className='fixed w-full h-full flex flex-col justify-center items-center z-50 bg-black/50'
			onClick={(): void => close()}
		>
			<div
				role='none'
				className='bg-black p-5 flex flex-col gap-2 pointer-events-none'
				onClick={(event): void => event.stopPropagation()}
			>
				<span>Open File</span>
				<div className='flex flex-row gap-2 pointer-events-auto'>
					<div className='border-gray-800 border p-2 flex flex-col gap-1 min-w-[20rem] max-w-[30rem] max-h-40 overflow-auto items-start'>
						{folders}
						{files}
					</div>
					{selectedFile ? (
						<div className='border-gray-800 border p-2 max-w-[30rem] max-h-40 overflow-auto whitespace-pre'>
							<span
								data-testid='selected-file-name'
								className='text-xl font-bold'
							>
								{selectedFile.name}
							</span>
							<p data-testid='selected-file-content'>{seletedFileContents}</p>
						</div>
					) : (
						<></>
					)}
				</div>
				<div className='flex flex-row-reverse gap-2 pointer-events-auto'>
					<button
						data-testid='select-button'
						type='button'
						className=' bg-gray-700 text-white hover:bg-gray-800 p-2 disabled:bg-gray-900'
						disabled={!selectedFile}
						onClick={(): void => {
							if (selectedFile) {
								const path = directoryPath
									.filter(v => v !== root)
									.map(v => v.name)
								path.push(selectedFile.name)
								chooseFile(selectedFile, path)
							}
						}}
					>
						Select
					</button>
					<button
						data-testid='close-button'
						className=' bg-gray-700 text-white hover:bg-gray-800 p-2'
						type='button'
						onClick={(): void => close()}
					>
						Close
					</button>
				</div>
			</div>
		</div>
	)
}
