import type { SegmentState } from './State'
import type { Vertex } from './Vertex'
import { VERTEX_PRECISION_MULTIPLIER } from './Vertex'

export interface MoveVertexAction {
	type: 'moveVertex'
	index: number
	vertex: Vertex
}

export default function MoveVertex(
	state: SegmentState,
	{ index, vertex }: MoveVertexAction
): SegmentState {
	const vertecies = { ...state.vertecies }
	const vertexDictionary = { ...state.vertexDictionary }
	const segments = [...state.segments]

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
	return { segments, vertecies, vertexDictionary }
}
