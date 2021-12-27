/* eslint-disable @typescript-eslint/no-unused-vars */
import type { OpenableFile } from 'Components/Files'
import type { Directory, File } from './FileSystemInterfaces'
import { SegmentFile } from './SegmentFile'

export interface ParsedFile<T> {
	data?: T
	handle: File
	initialize: () => Promise<void>
	save: () => Promise<void>
}

export async function OpenCommandFile(
	_folderHandle: Directory,
	_fileHandle: File,
	_openableFiles: Record<string, OpenableFile>
): Promise<[Record<string, OpenableFile>, Record<string, string>]> {
	return {} as unknown as [Record<string, OpenableFile>, Record<string, string>]
}

export async function OpenSegmentFile(fileHandle: File): Promise<SegmentFile> {
	const file = new SegmentFile(fileHandle)
	await file.initialize()
	return file
}
