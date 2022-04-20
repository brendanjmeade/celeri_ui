import type { Block } from '../State/Block/Block'
import { fieldNames } from '../State/Block/Block'
import { parse, stringify } from './CsvUtils'
import type { ParsedFile } from './FileOpeners'
import type { File } from './FileSystemInterfaces'

export function ProcessParsedBlockFile(
	parsed: Record<string, number | string>[]
): Block[] {
	return parsed.map((row): Block => {
		const result: Record<string, number | string> = {}
		for (const field of fieldNames) {
			result[field] = row[field] || (field === 'name' ? '' : 0)
		}
		return result as unknown as Block
	})
}

export function GenerateBlockFileString(blocks: Block[]): string {
	return stringify(blocks, fieldNames)
}

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
		this.data = ProcessParsedBlockFile(parser)
	}

	public async save(): Promise<void> {
		await this.handle.setContents(GenerateBlockFileString(this.data ?? []))
	}

	public clone(): BlockFile {
		return new BlockFile(this.handle)
	}
}

export default BlockFile
