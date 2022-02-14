import type { SegmentState } from './State'

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

export const VERTEX_PRECISION_MULTIPLIER = 1000

export function getVertexIdOrInsert(
	vertex: Vertex,
	dictionary: Record<string, number>,
	array: Record<number, Vertex>,
	lastIndex: number
): [number, number] {
	const key = `${Math.floor(
		vertex.lon * VERTEX_PRECISION_MULTIPLIER
	)},${Math.floor(vertex.lat * VERTEX_PRECISION_MULTIPLIER)}`
	if (key in dictionary) {
		return [dictionary[key], lastIndex]
	}
	const id = lastIndex
	// eslint-disable-next-line no-param-reassign
	array[id] = vertex
	// eslint-disable-next-line no-param-reassign
	dictionary[key] = id
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	return [id, lastIndex + 1]
}

export function tryRemoveVertex(
	state: SegmentState,
	index: number
): SegmentState {
	let found = false
	for (const segment of state.segments) {
		if (segment.start === index || segment.end === index) {
			found = true
			break
		}
	}
	if (!found && state.vertecies[index]) {
		const vertex = state.vertecies[index]
		const key = `${Math.floor(
			vertex.lon * VERTEX_PRECISION_MULTIPLIER
		)},${Math.floor(vertex.lat * VERTEX_PRECISION_MULTIPLIER)}`
		const vertecies = { ...state.vertecies }
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		delete vertecies[index]
		const vertexDictionary = { ...state.vertexDictionary }
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		delete vertexDictionary[key]
		return { ...state, vertecies, vertexDictionary }
	}
	return state
}
