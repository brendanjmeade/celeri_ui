import { parseString, writeToString } from 'fast-csv'
import type { ParsedFile } from './FileOpeners'
import type { File } from './FileSystemInterfaces'

export interface Block {
	other1: number
	other2: number
	other3: number
	other4: number
	other5: number
	other6: number
	name: string
	interior_lon: number
	interior_lat: number
	euler_lon: number
	euler_lon_sig: number
	euler_lat: number
	euler_lat_sig: number
	rotation_rate: number
	rotation_rate_sig: number
	rotation_flag: number
	apriori_flag: number
	strain_rate: number
	strain_rate_sig: number
	strain_rate_flag: number
}

const fieldNames = [
	'other1',
	'other2',
	'other3',
	'other4',
	'other5',
	'other6',
	'name',
	'interior_lon',
	'interior_lat',
	'euler_lon',
	'euler_lon_sig',
	'euler_lat',
	'euler_lat_sig',
	'rotation_rate',
	'rotation_rate_sig',
	'rotation_flag',
	'apriori_flag',
	'strain_rate',
	'strain_rate_sig',
	'strain_rate_flag'
]

const defaultBlock: Block = {
	other1: 0,
	other2: 0,
	other3: 0,
	other4: 0,
	other5: 0,
	other6: 0,
	name: '',
	interior_lon: 0,
	interior_lat: 0,
	euler_lon: 0,
	euler_lon_sig: 0,
	euler_lat: 0,
	euler_lat_sig: 0,
	rotation_rate: 0,
	rotation_rate_sig: 0,
	rotation_flag: 0,
	apriori_flag: 0,
	strain_rate: 0,
	strain_rate_sig: 0,
	strain_rate_flag: 0
}

export function createBlock(partial: Partial<Block>): Block {
	const Block = { ...defaultBlock, ...partial } as unknown as Block
	return Block
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
		const data: Block[] = []
		// eslint-disable-next-line unicorn/consistent-function-scoping
		let resolve: () => void = (): void => {}
		const promise = new Promise<void>(r => {
			resolve = r
		})
		parseString<Record<string, number | string>, Block>(contents, {
			headers: true
		})
			.transform((row: Record<string, number | string>): Block => {
				const result: Record<string, number | string> = {}
				for (const field of fieldNames) {
					result[field] = row[field] || (field === 'name' ? '' : 0)
				}
				return result as unknown as Block
			})
			.on('data', (row: Block) => {
				data.push(row)
			})
			.on('end', resolve)
			.on('close', resolve)
			.on('error', resolve)

		await promise
		this.data = data
	}

	public async save(): Promise<void> {
		const contents = await writeToString(this.data ?? [], {
			headers: fieldNames
		})
		await this.handle.setContents(contents)
	}
}
