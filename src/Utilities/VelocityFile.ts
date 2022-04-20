import type { Velocity } from '../State/Velocity/Velocity'
import { fieldNames } from '../State/Velocity/Velocity'
import { parse, stringify } from './CsvUtils'
import type { ParsedFile } from './FileOpeners'
import type { File } from './FileSystemInterfaces'

export function ProcessParsedVelocityFile(
	parsed: Record<string, number | string>[]
): Velocity[] {
	return parsed.map((row): Velocity => {
		const result: Record<string, number | string> = {}
		for (const field of fieldNames) {
			result[field] = row[field] || (field === 'name' ? '' : 0)
		}
		return result as unknown as Velocity
	})
}

export function GenerateVelocityFileString(velocities: Velocity[]): string {
	return stringify(velocities, fieldNames)
}

export class VelocityFile implements ParsedFile<Velocity[]> {
	public handle: File

	public data: Velocity[] | undefined

	public constructor(handle: File) {
		this.handle = handle
		this.data = undefined
	}

	public async initialize(): Promise<void> {
		const contents = await this.handle.getContents()
		const parser = parse(contents)
		this.data = ProcessParsedVelocityFile(parser)
	}

	public async save(): Promise<void> {
		await this.handle.setContents(GenerateVelocityFileString(this.data ?? []))
	}

	public clone(): VelocityFile {
		return new VelocityFile(this.handle)
	}
}

export default VelocityFile
