import { parse, stringify } from './CsvUtils'
import type { ParsedFile } from './FileOpeners'
import type { File } from './FileSystemInterfaces'

export interface Segment {
	name: string
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

export type FileSegment = Segment & {
	lon1: number
	lat1: number
	lon2: number
	lat2: number
}

export type InMemorySegment = Segment & {
	start: number
	end: number
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

const defaultSegment: FileSegment = {
	name: 'new_segment',
	lon1: 0,
	lat1: 0,
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	lon2: 10,
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	lat2: 10,
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	dip: 90,
	res: 0,
	other3: 0,
	other6: 0,
	other7: 0,
	other8: 0,
	other9: 0,
	other10: 0,
	other11: 0,
	other12: 0,
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	locking_depth: 15,
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

export interface Vertex {
	lon: number
	lat: number
}

export const DEFAULT_VERTEX = {
	lon: 0,
	lat: 0
}

const LON_HALF = 180
const LON_MAX = 360

export function TransformVertexCoordinates(vertex: Vertex): [number, number] {
	// eslint-disable-next-line prefer-const
	let { lon, lat } = vertex
	while (lon < 0) {
		lon += LON_MAX
	}
	while (lon > LON_MAX) {
		lon -= LON_MAX
	}
	return [lon, lat]
}

export function InverseTransformVertexCoordinates([lon, lat]: [
	number,
	number
]): Vertex {
	return {
		lon: lon < 0 ? lon + LON_MAX : lon,
		lat
	}
}

export function GetShortestLineCoordinates(
	start: Vertex,
	end: Vertex
): [[number, number], [number, number]] {
	const a = TransformVertexCoordinates(start)
	const b = TransformVertexCoordinates(end)
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	const balt = [b[0], b[1]] as [number, number]
	const ba = b[0] - a[0]
	if (ba >= LON_HALF) {
		balt[0] -= LON_MAX
	} else {
		balt[0] += LON_MAX
	}
	if (Math.abs(a[0] - b[0]) > Math.abs(a[0] - balt[0])) {
		return [a, balt]
	}
	return [a, b]
}

export function createSegment(partial: Partial<FileSegment>): FileSegment {
	const segment = { ...defaultSegment, ...partial } as unknown as FileSegment
	return segment
}

const VERTEX_PRECISION_MULTIPLIER = 1000
let LAST_VERTEX_INDEX = 0

function getVertexIdOrInsert(
	vertex: Vertex,
	dictionary: Record<string, number>,
	array: Record<number, Vertex>
): number {
	const key = `${Math.floor(
		vertex.lon * VERTEX_PRECISION_MULTIPLIER
	)},${Math.floor(vertex.lat * VERTEX_PRECISION_MULTIPLIER)}`
	if (key in dictionary) {
		return dictionary[key]
	}
	const id = LAST_VERTEX_INDEX
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	LAST_VERTEX_INDEX += 1
	// eslint-disable-next-line no-param-reassign
	array[id] = vertex
	// eslint-disable-next-line no-param-reassign
	dictionary[key] = id
	return id
}

export class SegmentFile
	implements
		ParsedFile<{
			vertecies: Record<number, Vertex>
			segments: InMemorySegment[]
			vertexDictionary: Record<string, number>
		}>
{
	public handle: File

	public data:
		| {
				vertecies: Record<number, Vertex>
				segments: InMemorySegment[]
				vertexDictionary: Record<string, number>
		  }
		| undefined

	public constructor(handle: File) {
		this.handle = handle
		this.data = undefined
	}

	public async initialize(): Promise<void> {
		const contents = await this.handle.getContents()
		const parser = parse(contents)
		const rawData = parser.map((row): FileSegment => {
			const result: Record<string, number | string> = {}
			for (const field of fieldNames) {
				result[field] = row[field] || (field === 'name' ? '' : 0)
			}
			return result as unknown as FileSegment
		})
		const vertexDictionary: Record<string, number> = {}
		const vertecies: Record<number, Vertex> = {}
		const segments: InMemorySegment[] = []
		for (const segment of rawData) {
			const start = getVertexIdOrInsert(
				{ lon: segment.lon1, lat: segment.lat1 },
				vertexDictionary,
				vertecies
			)
			const end = getVertexIdOrInsert(
				{ lon: segment.lon2, lat: segment.lat2 },
				vertexDictionary,
				vertecies
			)
			const inMemorySegment = { ...segment, start, end }
			segments.push(inMemorySegment)
		}
		this.data = { vertecies, segments, vertexDictionary }
	}

	public async save(): Promise<void> {
		let data: FileSegment[] = []
		if (this.data) {
			const { vertecies, segments } = this.data
			data = segments.map(segment => {
				const start = vertecies[segment.start]
				const end = vertecies[segment.end]
				return {
					...segment,
					lon1: start.lon,
					lat1: start.lat,
					lon2: end.lon,
					lat2: end.lat
				}
			})
		}
		const contents = stringify(data, fieldNames)
		await this.handle.setContents(contents)
	}

	public clone(): SegmentFile {
		return new SegmentFile(this.handle)
	}

	public tryRemoveVertex(index: number): SegmentFile {
		if (this.data) {
			let found = false
			for (const segment of this.data.segments) {
				if (segment.start === index || segment.end === index) {
					found = true
					break
				}
			}
			if (!found && this.data.vertecies[index]) {
				const vertex = this.data.vertecies[index]
				const key = `${Math.floor(
					vertex.lon * VERTEX_PRECISION_MULTIPLIER
				)},${Math.floor(vertex.lat * VERTEX_PRECISION_MULTIPLIER)}`
				const vertecies = { ...this.data.vertecies }
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
				delete vertecies[index]
				const vertexDictionary = { ...this.data.vertexDictionary }
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
				delete vertexDictionary[key]
				const file = this.clone()
				file.data = { ...this.data, vertecies, vertexDictionary }
				return file
			}
		}
		return this
	}

	public mergeVertices(a: number, b: number): SegmentFile {
		if (this.data) {
			for (const segment of this.data.segments) {
				if (segment.start === b) {
					segment.start = a
				}
				if (segment.end === b) {
					segment.end = a
				}
			}
			const vertex = this.data.vertecies[b]
			const key = `${Math.floor(
				vertex.lon * VERTEX_PRECISION_MULTIPLIER
			)},${Math.floor(vertex.lat * VERTEX_PRECISION_MULTIPLIER)}`
			const vertecies = { ...this.data.vertecies }
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete vertecies[b]
			const vertexDictionary = { ...this.data.vertexDictionary }
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete vertexDictionary[key]
			const file = this.clone()
			file.data = { ...this.data, vertecies, vertexDictionary }
			return file
		}
		return this
	}

	public moveVertex(index: number, vertex: Vertex): SegmentFile {
		if (this.data) {
			const vertecies = { ...this.data.vertecies }
			const vertexDictionary = { ...this.data.vertexDictionary }
			const segments = [...this.data.segments]

			const oldVertex = vertecies[index]
			const key = `${Math.floor(
				vertex.lon * VERTEX_PRECISION_MULTIPLIER
			)},${Math.floor(vertex.lat * VERTEX_PRECISION_MULTIPLIER)}`
			const oldKey = `${Math.floor(
				oldVertex.lon * VERTEX_PRECISION_MULTIPLIER
			)},${Math.floor(oldVertex.lat * VERTEX_PRECISION_MULTIPLIER)}`

			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete vertexDictionary[oldKey]
			if (key in vertexDictionary) {
				const oldIndex = vertexDictionary[key]
				for (const segment of segments) {
					if (segment.start === oldIndex) segment.start = index
					if (segment.end === oldIndex) segment.end = index
				}
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
				delete vertecies[oldIndex]
			}
			vertecies[index] = vertex
			const file = this.clone()
			file.data = { segments, vertecies, vertexDictionary }
			return file
		}
		return this
	}

	public splitSegment(index: number): SegmentFile {
		if (this.data) {
			const oldSegment = this.data.segments[index]
			const start = this.data.vertecies[oldSegment.start]
			const end = this.data.vertecies[oldSegment.end]
			const midpoint = {
				// eslint-disable-next-line @typescript-eslint/no-magic-numbers
				lon: (start.lon + end.lon) / 2,
				// eslint-disable-next-line @typescript-eslint/no-magic-numbers
				lat: (start.lat + end.lat) / 2
			}
			const midpointId = getVertexIdOrInsert(
				midpoint,
				this.data.vertexDictionary,
				this.data.vertecies
			)
			const startSegment = {
				...oldSegment,
				end: midpointId,
				name: `${oldSegment.name}_a`
			}
			const endSegment = {
				...oldSegment,
				start: midpointId,
				name: `${oldSegment.name}_b`
			}
			const segments = [...this.data.segments]
			segments[index] = startSegment
			segments.push(endSegment)
			const file = this.clone()
			file.data = { ...this.data, segments }
			return file
		}
		return this
	}

	public bridgeVertices(a: number, b: number): SegmentFile {
		if (this.data) {
			const segment: InMemorySegment = { ...defaultSegment, start: a, end: b }
			const segments = [...this.data.segments, segment]
			const file = this.clone()
			file.data = { ...this.data, segments }
			return file
		}
		return this
	}

	public extrudeSegment(start: number, endVertex: Vertex): SegmentFile {
		if (this.data) {
			const verts = { ...this.data.vertecies }
			const dictionary = { ...this.data.vertexDictionary }

			const end = getVertexIdOrInsert(endVertex, dictionary, verts)
			const segment: InMemorySegment = { ...defaultSegment, start, end }
			const segments = [...this.data.segments, segment]

			const file = this.clone()
			file.data = { vertecies: verts, vertexDictionary: dictionary, segments }
			return file
		}
		return this
	}

	public deleteSegment(index: number): SegmentFile {
		if (this.data) {
			const segments = [...this.data.segments]
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			const segment = segments.splice(index, 1)[0]
			const file = this.clone()
			file.data = { ...this.data, segments }
			return file.tryRemoveVertex(segment.start).tryRemoveVertex(segment.end)
		}
		return this
	}

	public createSegment(startVertex: Vertex, endVertex: Vertex): SegmentFile {
		if (this.data) {
			const verts = { ...this.data.vertecies }
			const dictionary = { ...this.data.vertexDictionary }

			const start = getVertexIdOrInsert(startVertex, dictionary, verts)
			const end = getVertexIdOrInsert(endVertex, dictionary, verts)
			const segment: InMemorySegment = { ...defaultSegment, start, end }
			const segments = [...this.data.segments, segment]

			const file = this.clone()
			file.data = { vertecies: verts, vertexDictionary: dictionary, segments }
			return file
		}
		return this
	}
}
