/* eslint-disable class-methods-use-this */
import { parse } from './CsvUtils'
import type { ParsedFile } from './FileOpeners'
import type { File } from './FileSystemInterfaces'

export class GenericSegmentFile
	implements ParsedFile<Record<string, number | string>[]>
{
	public data?: Record<string, number | string>[] | undefined

	public handle: File

	public constructor(handle: File) {
		this.handle = handle
		this.data = undefined
	}

	public async initialize(): Promise<void> {
		const contents = await this.handle.getContents()
		const parser = parse(contents)
		this.data = parser
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	public async save(): Promise<void> {}
}

export default GenericSegmentFile
