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
}

export default function Files({
	folder,
	files,
	setFile
}: {
	folder: Directory
	files: Record<string, OpenableFile>
	setFile: (type: string, file: string, fileHandle?: File) => void
}): ReactElement {
	const fileElements = Object.keys(files).map((key): ReactElement => {
		const file = files[key]
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
				<span className='w-2/5 flex-shrink-0'>
					<select
						data-testid={`file-${key}-select`}
						className='w-full rounded'
						value={file.currentFilePath}
						onChange={async (event): Promise<void> => {
							const chosenFileName = event.currentTarget.value
							try {
								const chosenFile = await folder.getFile(
									chosenFileName as FileName
								)
								setFile(key, chosenFile.name, chosenFile)
							} catch {
								setFile(key, '')
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
				</span>
			</div>
		)
	})
	return <div className='flex flex-col gap-2'>{fileElements}</div>
}
