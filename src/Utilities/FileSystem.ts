/* eslint-disable max-classes-per-file */
import type {
	Directory,
	DirectoryName,
	File,
	FileName,
	OpenDirectoryInterface
} from './FileSystemInterfaces'

class FileSystemFile implements File {
	public readonly name: string

	private readonly handle: FileSystemFileHandle

	public constructor(handle: FileSystemFileHandle) {
		this.handle = handle
		this.name = handle.name
	}

	public async getContents(): Promise<string> {
		const file = await this.handle.getFile()
		return file.text()
	}

	public async setContents(contents: string): Promise<void> {
		const write = await this.handle.createWritable()
		await write.write(contents)
		await write.close()
	}
}

class FileSystemDirectory implements Directory {
	public readonly name: string

	private readonly handle: FileSystemDirectoryHandle

	public fileList: FileName[]

	public folderList: DirectoryName[]

	public constructor(handle: FileSystemDirectoryHandle) {
		this.handle = handle
		this.fileList = []
		this.folderList = []
		this.name = handle.name
	}

	public async initialize(): Promise<void> {
		for await (const entry of this.handle.values()) {
			if (entry.kind === 'directory') {
				this.folderList.push(entry.name as DirectoryName)
			} else {
				this.fileList.push(entry.name as FileName)
			}
		}
	}

	public async getFile(file: FileName): Promise<File> {
		const fileHandle = await this.handle.getFileHandle(file, { create: true })
		return new FileSystemFile(fileHandle)
	}

	public async getDirectory(name: DirectoryName): Promise<Directory> {
		if (!this.folderList.includes(name)) throw new Error('Missing Directory')
		const folderHandle = await this.handle.getDirectoryHandle(name)
		const directory = new FileSystemDirectory(folderHandle)
		await directory.initialize()
		return directory
	}
}

const OpenDirectory: OpenDirectoryInterface = async () => {
	const handle = await window.showDirectoryPicker()
	const directory = new FileSystemDirectory(handle)
	await directory.initialize()
	return directory
}

export default OpenDirectory
