import { parse, stringify } from './CsvUtils'
import type { ParsedFile } from './FileOpeners'
import type { File } from './FileSystemInterfaces'

export interface Segment {
	name: string
	lon1: number
	lat1: number
	lon2: number
	lat2: number
	dip: number
	res: number
	other3: number
	other6: number
	other7: number
	other8: number
	other9: number
	other10: number
	other11: number
	other12: number
	locking_depth: number
	locking_depth_sig: number
	locking_depth_flag: number
	dip_sig: number
	dip_flag: number
	ss_rate: number
	ss_rate_sig: number
	ss_rate_flag: number
	ds_rate: number
	ds_rate_sig: number
	ds_rate_flag: number
	ts_rate: number
	ts_rate_sig: number
	ts_rate_flag: number
	burial_depth: number
	burial_depth_sig: number
	burial_depth_flag: number
	resolution_override: number
	resolution_other: number
	patch_file_name: number
	patch_flag: number
	patch_slip_file: number
	patch_slip_flag: number
}

const fieldNames = [
	'name',
	'lon1',
	'lat1',
	'lon2',
	'lat2',
	'dip',
	'res',
	'other3',
	'other6',
	'other7',
	'other8',
	'other9',
	'other10',
	'other11',
	'other12',
	'locking_depth',
	'locking_depth_sig',
	'locking_depth_flag',
	'dip_sig',
	'dip_flag',
	'ss_rate',
	'ss_rate_sig',
	'ss_rate_flag',
	'ds_rate',
	'ds_rate_sig',
	'ds_rate_flag',
	'ts_rate',
	'ts_rate_sig',
	'ts_rate_flag',
	'burial_depth',
	'burial_depth_sig',
	'burial_depth_flag',
	'resolution_override',
	'resolution_other',
	'patch_file_name',
	'patch_flag',
	'patch_slip_file',
	'patch_slip_flag'
]

const defaultSegment: Segment = {
	name: 'unnamed segment',
	lon1: 0,
	lat1: 0,
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	lon2: 10,
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	lat2: 10,
	dip: 0,
	res: 0,
	other3: 0,
	other6: 0,
	other7: 0,
	other8: 0,
	other9: 0,
	other10: 0,
	other11: 0,
	other12: 0,
	locking_depth: 0,
	locking_depth_sig: 0,
	locking_depth_flag: 0,
	dip_sig: 0,
	dip_flag: 0,
	ss_rate: 0,
	ss_rate_sig: 0,
	ss_rate_flag: 0,
	ds_rate: 0,
	ds_rate_sig: 0,
	ds_rate_flag: 0,
	ts_rate: 0,
	ts_rate_sig: 0,
	ts_rate_flag: 0,
	burial_depth: 0,
	burial_depth_sig: 0,
	burial_depth_flag: 0,
	resolution_override: 0,
	resolution_other: 0,
	patch_file_name: 0,
	patch_flag: 0,
	patch_slip_file: 0,
	patch_slip_flag: 0
}

export function createSegmentsFromCoordinates(
	coordinates: { lat: number; lon: number }[],
	old?: Segment
): Segment[] {
	const original = old ?? defaultSegment
	let lastCoordinate = coordinates[0]
	const segments: Segment[] = []
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	for (let index = 1; index < coordinates.length; index += 1) {
		const coordinate = coordinates[index]
		const segment = {
			...original,
			lon1: lastCoordinate.lon,
			lat1: lastCoordinate.lat,
			lon2: coordinate.lon,
			lat2: coordinate.lat
		}
		segments.push(segment)
		lastCoordinate = coordinate
	}
	return segments
}

export function createSegment(partial: Partial<Segment>): Segment {
	const segment = { ...defaultSegment, ...partial } as unknown as Segment
	return segment
}

export class SegmentFile implements ParsedFile<Segment[]> {
	public handle: File

	public data: Segment[] | undefined

	public constructor(handle: File) {
		this.handle = handle
		this.data = undefined
	}

	public async initialize(): Promise<void> {
		const contents = await this.handle.getContents()
		const parser = parse(contents)
		const data = parser.map((row): Segment => {
			const result: Record<string, number | string> = {}
			for (const field of fieldNames) {
				result[field] = row[field] || (field === 'name' ? '' : 0)
			}
			return result as unknown as Segment
		})
		this.data = data
	}

	public async save(): Promise<void> {
		const contents = stringify(this.data ?? [], fieldNames)
		await this.handle.setContents(contents)
	}

	public clone(): SegmentFile {
		return new SegmentFile(this.handle)
	}
}
