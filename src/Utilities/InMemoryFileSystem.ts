/* eslint-disable max-classes-per-file */

import type {
	Directory,
	DirectoryName,
	File,
	FileName
} from './FileSystemInterfaces'

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface InMemoryFS {
	[key: string]: InMemoryFS | string
}

class InMemoryFile implements File {
	public readonly name: string

	private readonly parent: InMemoryFS

	public constructor(name: string, parent: InMemoryFS) {
		this.name = name
		this.parent = parent
	}

	public async getContents(): Promise<string> {
		const value = this.parent[this.name]
		if (typeof value !== 'string') throw new Error('No Such File')
		return value
	}

	public async setContents(contents: string): Promise<void> {
		this.parent[this.name] = contents
	}
}

class InMemoryDirectory implements Directory {
	public readonly name: string

	private readonly parent: InMemoryFS

	public fileList: FileName[]

	public folderList: DirectoryName[]

	public constructor(name: string, parent: InMemoryFS) {
		this.name = name
		this.parent = parent
		this.fileList = []
		this.folderList = []
		const folder = parent[name] as InMemoryFS
		for (const key of Object.keys(folder)) {
			if (typeof folder[key] === 'string') {
				this.fileList.push(key as FileName)
			} else {
				this.folderList.push(key as DirectoryName)
			}
		}
	}

	public async getFile(file: FileName): Promise<File> {
		if (!this.fileList.includes(file)) throw new Error('No Such File')
		return new InMemoryFile(file, this.parent[this.name] as InMemoryFS)
	}

	public async getDirectory(directory: DirectoryName): Promise<Directory> {
		if (!this.folderList.includes(directory)) throw new Error('No Such File')
		return new InMemoryDirectory(
			directory,
			this.parent[this.name] as InMemoryFS
		)
	}
}

const OpenDirectory = async (fs: InMemoryFS): Promise<Directory> =>
	new InMemoryDirectory('root', fs)

export default OpenDirectory
