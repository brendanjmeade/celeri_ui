/* eslint-disable react/no-array-index-key */
import type { ReactElement } from 'react'
import type {
	Directory,
	File,
	FileName
} from '../Utilities/FileSystemInterfaces'

export interface OpenableFile {
	name: string
	description: string
	extension: string
	currentFilePath: string[] | string
	allowMultiple?: boolean
}

export default function Files({
	folder,
	files,
	setFile
}: {
	folder: Directory
	files: Record<string, OpenableFile>
	setFile: (
		index: number,
		type: string,
		file: string,
		fileHandle?: File
	) => void
}): ReactElement {
	const fileElements = Object.keys(files).map((key): ReactElement => {
		const file = files[key]
		const filePaths = Array.isArray(file.currentFilePath)
			? [...file.currentFilePath]
			: [file.currentFilePath]
		if (file.allowMultiple) {
			filePaths.push('')
		}
		return (
			<div className='flex flex-row justify-between items-center' key={key}>
				<div className='flex flex-col'>
					<span className='text-l font-bold' data-testid={`file-${key}-label`}>
						{file.name}
					</span>
					<span className='text-sm' data-testid={`file-${key}-description`}>
						{file.description}
					</span>
				</div>
				<span className='w-2/5 flex-shrink-0 flex-col gap-2 items-stretch'>
					{filePaths.map(
						(fiePath, index): ReactElement => (
							<select
								key={index}
								data-testid={`file-${key}-select-${index}`}
								className='bg-gray-800 flex-grow m-1'
								value={fiePath}
								onChange={async (event): Promise<void> => {
									const chosenFileName = event.currentTarget.value
									try {
										const chosenFile = await folder.getFile(
											chosenFileName as FileName
										)
										setFile(index, key, chosenFile.name, chosenFile)
									} catch {
										setFile(index, key, '')
									}
								}}
							>
								<option value='' data-testid={`file-${key}-empty`}>
									&nbsp;
								</option>
								{folder.fileList
									.filter(filename => filename.endsWith(file.extension))
									.map(
										(filename): ReactElement => (
											<option
												key={filename}
												value={filename}
												data-testid={`file-${key}-select-${filename}`}
											>
												{filename}
											</option>
										)
									)}
							</select>
						)
					)}
				</span>
			</div>
		)
	})
	return <div className='flex flex-col gap-2'>{fileElements}</div>
}
