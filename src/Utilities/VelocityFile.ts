import type { Velocity } from '../State/Velocity/Velocity'
import { fieldNames } from '../State/Velocity/Velocity'
import { parse, stringify } from './CsvUtils'
import type { ParsedFile } from './FileOpeners'
import type { File } from './FileSystemInterfaces'

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
		const data = parser.map((row): Velocity => {
			const result: Record<string, number | string> = {}
			for (const field of fieldNames) {
				result[field] = row[field] || (field === 'name' ? '' : 0)
			}
			return result as unknown as Velocity
		})
		this.data = data
	}

	public async save(): Promise<void> {
		const contents = stringify(this.data ?? [], fieldNames)
		await this.handle.setContents(contents)
	}

	public clone(): VelocityFile {
		return new VelocityFile(this.handle)
	}
}

export default VelocityFile
