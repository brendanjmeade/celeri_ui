/* eslint-disable @typescript-eslint/no-unused-vars */
import type { OpenableFile } from 'Components/Files'
import { BlockFile } from './BlockFile'
import { CommandFile } from './CommandFile'
import type { Directory, File, FileName } from './FileSystemInterfaces'
import { SegmentFile } from './SegmentFile'
import { VelocityFile } from './VelocityFile'

export interface ParsedFile<T> {
	data?: T
	handle: File
	initialize: () => Promise<void>
	save: () => Promise<void>
}

export async function OpenSegmentFile(fileHandle: File): Promise<SegmentFile> {
	const file = new SegmentFile(fileHandle)
	await file.initialize()
	return file
}

export async function OpenBlockFile(fileHandle: File): Promise<BlockFile> {
	const file = new BlockFile(fileHandle)
	await file.initialize()
	return file
}

export async function OpenVelocityFile(
	fileHandle: File
): Promise<VelocityFile> {
	const file = new VelocityFile(fileHandle)
	await file.initialize()
	return file
}

export async function OpenCommandFile(
	folderHandle: Directory,
	fileHandle: File,
	openableFiles: Record<string, OpenableFile>
): Promise<{
	openableFiles: Record<string, OpenableFile>
	commands: CommandFile
	segments: SegmentFile
	blocks: BlockFile
	velocities: VelocityFile
}> {
	const commands = new CommandFile(fileHandle)
	await commands.initialize()
	if (commands.data) {
		const segments = await OpenSegmentFile(
			await folderHandle.getFile(commands.data.segment_file_name as FileName)
		)
		const blocks = await OpenBlockFile(
			await folderHandle.getFile(commands.data.block_file_name as FileName)
		)
		const velocities = await OpenVelocityFile(
			await folderHandle.getFile(commands.data.station_file_name as FileName)
		)
		const updatedFiles = { ...openableFiles }
		if ('command' in updatedFiles) {
			updatedFiles.command = {
				...updatedFiles.command,
				currentFilePath: fileHandle.name
			}
		}
		if ('segment' in updatedFiles) {
			updatedFiles.segment = {
				...updatedFiles.segment,
				currentFilePath: commands.data.segment_file_name
			}
		}
		if ('block' in updatedFiles) {
			updatedFiles.block = {
				...updatedFiles.block,
				currentFilePath: commands.data.block_file_name
			}
		}
		if ('velocities' in updatedFiles) {
			updatedFiles.velocities = {
				...updatedFiles.velocities,
				currentFilePath: commands.data.station_file_name
			}
		}
		return {
			openableFiles: updatedFiles,
			commands,
			segments,
			blocks,
			velocities
		}
	}
	throw new Error("Can't open command file")
}