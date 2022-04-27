/* eslint-disable @typescript-eslint/no-unused-vars */
import type { OpenableFile } from '../Components/Files'
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

async function TryOpenFile<T>(
	file: FileName,
	folderHandle: Directory,
	fileOpenCallback: (file: File) => Promise<T>
): Promise<T | false> {
	try {
		const fileHandle = await folderHandle.getFile(file)
		const result = await fileOpenCallback(fileHandle)
		return result
	} catch {
		return false
	}
}

export async function OpenCommandFile(
	folderHandle: Directory,
	fileHandle: File,
	openableFiles: Record<string, OpenableFile>
): Promise<{
	openableFiles: Record<string, OpenableFile>
	commands: CommandFile | false
	segments: SegmentFile | false
	blocks: BlockFile | false
	velocities: VelocityFile | false
	mesh: MeshFile[] | false
}> {
	const commands = new CommandFile(fileHandle)
	await commands.initialize()
	if (commands.data) {
		const segments = await TryOpenFile(
			commands.data.segment_file_name as FileName,
			folderHandle,
			OpenSegmentFile
		)
		const blocks = await TryOpenFile(
			commands.data.block_file_name as FileName,
			folderHandle,
			OpenBlockFile
		)
		const velocities = await TryOpenFile(
			commands.data.station_file_name as FileName,
			folderHandle,
			OpenVelocityFile
		)

		const mesh = await TryOpenFile(
			commands.data.mesh_parameters_file_name as FileName,
			folderHandle,
			async meshSettingFile => {
				const meshSettings = JSON.parse(
					await meshSettingFile.getContents()
				) as {
					mesh_filename: FileName
				}[]
				const result = await Promise.all(
					meshSettings.map(async m =>
						TryOpenFile(m.mesh_filename, folderHandle, OpenMeshFile)
					)
				)
				return result.filter(v => v) as MeshFile[]
			}
		)
		const updatedFiles = { ...openableFiles }
		if ('command' in updatedFiles) {
			updatedFiles.command = {
				...updatedFiles.command,
				currentFilePath: fileHandle.name
			}
		}
		if (segments && 'segment' in updatedFiles) {
			updatedFiles.segment = {
				...updatedFiles.segment,
				currentFilePath: commands.data.segment_file_name
			}
		}
		if (blocks && 'block' in updatedFiles) {
			updatedFiles.block = {
				...updatedFiles.block,
				currentFilePath: commands.data.block_file_name
			}
		}
		if (velocities && 'velocities' in updatedFiles) {
			updatedFiles.velocities = {
				...updatedFiles.velocities,
				currentFilePath: commands.data.station_file_name
			}
		}
		if (mesh && 'mesh' in updatedFiles) {
			updatedFiles.mesh = {
				...updatedFiles.mesh,
				currentFilePath: mesh.map(m => m.handle.name)
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
