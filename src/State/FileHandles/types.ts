export interface OpenableFile {
	name: string
	description: string
	extension: string
	currentFilePath: string[] | string
	allowMultiple?: boolean
	currentFile?: File | File[]
}
