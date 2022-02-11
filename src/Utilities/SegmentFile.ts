import type { FileSegment, InMemorySegment } from '../State/Segment/Segment'
import { defaultSegment, fieldNames } from '../State/Segment/Segment'
import type { Vertex } from '../State/Segment/Vertex'
import {
	getVertexIdOrInsert,
	VERTEX_PRECISION_MULTIPLIER
} from '../State/Segment/Vertex'
import { parse, stringify } from './CsvUtils'
import type { ParsedFile } from './FileOpeners'
import type { File } from './FileSystemInterfaces'

export function createSegment(partial: Partial<FileSegment>): FileSegment {
	const segment = { ...defaultSegment, ...partial } as unknown as FileSegment
	return segment
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
