import { parse, stringify } from './CsvUtils'
import type { ParsedFile } from './FileOpeners'
import type { File } from './FileSystemInterfaces'

export interface Velocity {
	lon: number
	lat: number
	corr: number
	other1: number
	name: string
	east_vel: number
	north_vel: number
	east_sig: number
	north_sig: number
	flag: number
	up_vel: number
	up_sig: number
	east_adjust: number
	north_adjust: number
	up_adjust: number
}

const fieldNames = [
	'lon',
	'lat',
	'corr',
	'other1',
	'name',
	'east_vel',
	'north_vel',
	'east_sig',
	'north_sig',
	'flag',
	'up_vel',
	'up_sig',
	'east_adjust',
	'north_adjust',
	'up_adjust'
]

const defaultVelocity: Velocity = {
	lon: 0,
	lat: 0,
	corr: 0,
	other1: 0,
	name: '',
	east_vel: 0,
	north_vel: 0,
	east_sig: 0,
	north_sig: 0,
	flag: 0,
	up_vel: 0,
	up_sig: 0,
	east_adjust: 0,
	north_adjust: 0,
	up_adjust: 0
}

export function createVelocity(partial: Partial<Velocity>): Velocity {
	const velocity = { ...defaultVelocity, ...partial } as unknown as Velocity
	return velocity
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
}
