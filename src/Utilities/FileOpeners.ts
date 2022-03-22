/* eslint-disable @typescript-eslint/no-unused-vars */
import type { OpenableFile } from 'Components/Files'
import { BlockFile } from './BlockFile'
import { CommandFile } from './CommandFile'
import type { Directory, File, FileName } from './FileSystemInterfaces'
import { GenericSegmentFile } from './GenericSegmentFile'
import { MeshFile } from './MeshFile'
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

export async function OpenMeshFile(fileHandle: File): Promise<MeshFile> {
	const file = new MeshFile(fileHandle)
	await file.initialize()
	return file
}

export async function OpenGenericSegmentFile(
	fileHandle: File
): Promise<GenericSegmentFile> {
	const file = new GenericSegmentFile(fileHandle)
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
	mesh: MeshFile[]
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
		const meshSettingFile = await folderHandle.getFile(
			commands.data.mesh_parameters_file_name as FileName
		)
		const meshSettings = JSON.parse(await meshSettingFile.getContents()) as {
			mesh_filename: FileName
		}[]
		const mesh = await Promise.all(
			meshSettings.map(async m =>
				OpenMeshFile(await folderHandle.getFile(m.mesh_filename))
			)
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
		if ('mesh' in updatedFiles) {
			updatedFiles.mesh = {
				...updatedFiles.mesh,
				currentFilePath: meshSettings.map(m => m.mesh_filename)
			}
		}
		return {
			openableFiles: updatedFiles,
			commands,
			segments,
			blocks,
			velocities,
			mesh
		}
	}
	throw new Error("Can't open command file")
}
