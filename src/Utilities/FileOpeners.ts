/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable unicorn/prefer-at */
import type { Command } from '../State/Command/Command'
import type { MeshData, MeshParameters } from '../State/MeshLines/MeshLine'
import { BlockFile } from './BlockFile'
import { ParseCommandFile } from './CommandFile'
import type { Directory, File } from './FileSystemInterfaces'
import { GetProjectFile, GetRelativeFile } from './FileSystemInterfaces'
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

export async function OpenMeshParametersFile(
	fileHandle: File,
	root: Directory
): Promise<MeshData[]> {
	const content = await fileHandle.getContents()
	const data = JSON.parse(content) as MeshParameters[]
	if (!Array.isArray(data)) return []
	const result = await Promise.all(
		data.map(async parameters => {
			const meshFileName = parameters.mesh_filename.split('/')
			const meshFileHandle = await GetRelativeFile(
				fileHandle,
				meshFileName[meshFileName.length - 1],
				root
			)
			if (!meshFileHandle) return false as unknown as MeshData
			const meshFile = await OpenMeshFile(meshFileHandle)
			if (!meshFile.data) return false as unknown as MeshData
			return { line: meshFile.data, parameters }
		})
	)
	return result.filter(v => !!v)
}

export async function OpenCommandFile(
	folderHandle: Directory,
	fileHandle: File
): Promise<{
	files: {
		commands: File | false
		segments: File | false
		blocks: File | false
		velocities: File | false
		mesh: File | false
	}
	command: Command
}> {
	const command = ParseCommandFile(await fileHandle.getContents())

	const files: {
		commands: File | false
		segments: File | false
		blocks: File | false
		velocities: File | false
		mesh: File | false
	} = {
		commands: fileHandle,
		segments: false,
		blocks: false,
		velocities: false,
		mesh: false
	}

	console.log('Opened command file', command)
	console.log('Current File', fileHandle)
	console.log('Root', folderHandle)

	if (command.segment_file_name)
		files.segments = await GetProjectFile(
			fileHandle,
			command.segment_file_name,
			folderHandle
		)
	if (command.block_file_name)
		files.blocks = await GetProjectFile(
			fileHandle,
			command.block_file_name,
			folderHandle
		)
	if (command.station_file_name)
		files.velocities = await GetProjectFile(
			fileHandle,
			command.station_file_name,
			folderHandle
		)
	if (command.mesh_parameters_file_name)
		files.mesh = await GetProjectFile(
			fileHandle,
			command.mesh_parameters_file_name,
			folderHandle
		)

	return {
		command,
		files
	}
}
