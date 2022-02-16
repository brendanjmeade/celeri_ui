import type { Block } from '../State/Block/Block'
import { fieldNames } from '../State/Block/Block'
import { parse, stringify } from './CsvUtils'
import type { ParsedFile } from './FileOpeners'
import type { File } from './FileSystemInterfaces'

export class BlockFile implements ParsedFile<Block[]> {
	public handle: File

	public data: Block[] | undefined

	public constructor(handle: File) {
		this.handle = handle
		this.data = undefined
	}

	public async initialize(): Promise<void> {
		const contents = await this.handle.getContents()
		const parser = parse(contents)
		const data = parser.map((row): Block => {
			const result: Record<string, number | string> = {}
			for (const field of fieldNames) {
				result[field] = row[field] || (field === 'name' ? '' : 0)
			}
			return result as unknown as Block
		})
		this.data = data
	}

	public async save(): Promise<void> {
		const contents = stringify(this.data ?? [], fieldNames)
		await this.handle.setContents(contents)
	}

	public clone(): BlockFile {
		return new BlockFile(this.handle)
	}
}

export default BlockFile
