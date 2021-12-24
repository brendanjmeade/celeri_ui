/* eslint-disable max-classes-per-file */
import type { InMemoryFS } from './InMemoryFileSystem'
import InMemoryOpenDirectory from './InMemoryFileSystem'

export type FileName = string & { isFile: never }
export type DirectoryName = string & { isDirectory: never }

export interface Directory {
	readonly name: string
	fileList: FileName[]
	folderList: DirectoryName[]
	getFile: (file: FileName) => Promise<File>
	getDirectory: (directory: DirectoryName) => Promise<Directory>
}

export interface File {
	readonly name: string
	getContents: () => Promise<string>
	setContents: (contents: string) => Promise<void>
}

export type OpenDirectoryInterface = () => Promise<Directory>

let openDirectoryHandle: OpenDirectoryInterface = async () => {
	const global = window as unknown as { FakeDirectory: InMemoryFS | undefined }
	return InMemoryOpenDirectory(global.FakeDirectory ?? {})
}

export function SetDirectoryHandle(handle: OpenDirectoryInterface): void {
	openDirectoryHandle = handle
}

export default async function OpenDirectory(): Promise<Directory> {
	return openDirectoryHandle()
}
