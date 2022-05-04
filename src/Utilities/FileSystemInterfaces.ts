/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-classes-per-file */
import type { InMemoryFS } from './InMemoryFileSystem'
import InMemoryOpenDirectory from './InMemoryFileSystem'

export type FileName = string & { isFile: never }
export type DirectoryName = string & { isDirectory: never }

export interface Directory {
	readonly name: string
	readonly path: string[]
	fileList: FileName[]
	folderList: DirectoryName[]
	getFile: (file: FileName) => Promise<File>
	getDirectory: (directory: DirectoryName) => Promise<Directory>
}

export interface File {
	readonly name: string
	readonly path: string[]
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

export async function GetFileContents(handle: File): Promise<string> {
	return handle.getContents()
}

export async function GetRelativeFile(
	handle: Directory | File,
	path: string,
	root: Directory
): Promise<File | false> {
	const adjustedPath = path.split('/')
	let targetPath = [...handle.path]
	if ('getContents' in handle) {
		targetPath.pop()
	}
	for (const segment of adjustedPath) {
		if (segment === '..') {
			if (targetPath.length === 0) {
				return false
			}
			targetPath.pop()
		} else if (segment !== '' && segment !== '.') {
			targetPath.push(segment)
		}
	}
	if (targetPath.length < 2) {
		return false
	}
	const last = targetPath.pop()
	if (!last) {
		return false
	}
	targetPath = targetPath.slice(1)
	let current = root
	for (const folderName of targetPath) {
		// eslint-disable-next-line no-await-in-loop
		current = await current.getDirectory(folderName as DirectoryName)
	}
	const file = await current.getFile(last as FileName)
	return file
}

export function GenerateRelativePath(source: File, target: File): string {
	let sourcePath = source.path
	let targetPath = target.path
	if (sourcePath.length === 0 || targetPath.length === 0) return ''
	while (sourcePath[0] === targetPath[0]) {
		sourcePath = sourcePath.slice(1)
		targetPath = targetPath.slice(1)
	}
	if (sourcePath.length === 0 || targetPath.length === 0) return ''
	const finalPath: string[] = []
	for (let index = 0; index < sourcePath.length - 1; index += 1) {
		finalPath.push('..')
	}
	for (const element of targetPath) {
		finalPath.push(element)
	}
	return finalPath.join('/')
}

export async function GetProjectFile(
	commandFile: File,
	path: string,
	root: Directory
): Promise<File | false> {
	const updatedPath = path
		.replace('../', '')
		.replace('./', '')
		.replace('data/', '../')
	return GetRelativeFile(commandFile, updatedPath, root)
}

export function GetProjectPath(targetFile: File): string {
	const path = targetFile.path.slice(-2)
	return `../data/${path.join('/')}`
}
