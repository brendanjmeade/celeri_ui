/* eslint-disable max-classes-per-file */
import { FileSystemFile } from './FileSystem'
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

export type OpenSaveableFileInterface = () => Promise<File>

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

export async function OpenSavableFile(extensions: string[]): Promise<File> {
	const options = {
		types: [
			{
				description: 'CSV Files',
				accept: {
					'text/plain': extensions
				}
			}
		]
	}
	const handle = await window.showSaveFilePicker(options)
	return new FileSystemFile(handle)
}
