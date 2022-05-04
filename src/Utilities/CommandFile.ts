/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { Command } from '../State/Command/Command'
import { defaultCommand, fieldNames } from '../State/Command/Command'
import type { ParsedFile } from './FileOpeners'
import type { File } from './FileSystemInterfaces'
import { GenerateRelativePath } from './FileSystemInterfaces'

export function createCommand(partial: Partial<Command>): Command {
	const command = { ...defaultCommand }
	for (const field of fieldNames) {
		if (field in partial) {
			;(command as unknown as Record<string, number | string>)[field] = (
				partial as unknown as Record<string, number | string>
			)[field]
		}
	}
	return command
}

export function ParseCommandFile(contents: string): Command {
	const commandContents = JSON.parse(contents) as Partial<Command>
	return createCommand(commandContents)
}

export function GenerateCommandFileString(command: Command): string {
	return JSON.stringify(command)
}

export function SetCommandFileFiles(
	command: Command,
	source: File,
	files: Record<string, { path: string[]; file: File }>
): Command {
	let result = command
	if (files.segment) {
		result = {
			...command,
			segment_file_name: GenerateRelativePath(source, files.segment.file)
		}
	}
	if (files.block) {
		result = {
			...command,
			block_file_name: GenerateRelativePath(source, files.block.file)
		}
	}
	if (files.velocity) {
		result = {
			...command,
			station_file_name: GenerateRelativePath(source, files.velocity.file)
		}
	}
	return result
}

export class CommandFile implements ParsedFile<Command> {
	public handle: File

	public data: Command | undefined

	public constructor(handle: File) {
		this.handle = handle
		this.data = undefined
	}

	public async initialize(): Promise<void> {
		const contents = await this.handle.getContents()
		this.data = ParseCommandFile(contents)
	}

	public async save(): Promise<void> {
		if (this.data) {
			await this.handle.setContents(GenerateCommandFileString(this.data))
		}
	}

	public clone(): CommandFile {
		return new CommandFile(this.handle)
	}
}
