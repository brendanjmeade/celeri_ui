import type { SegmentState } from './State'
import { VERTEX_PRECISION_MULTIPLIER } from './Vertex'

export interface MergeVerticesAction {
	type: 'mergeVertices'
	a: number
	b: number
}

export default function MergeVertices(
	state: SegmentState,
	{ a, b }: MergeVerticesAction
): SegmentState {
	for (const segment of state.segments) {
		if (segment.start === b) {
			segment.start = a
		}
		if (segment.end === b) {
			segment.end = a
		}
	}
	const vertex = state.vertecies[b]
	const key = `${Math.floor(
		vertex.lon * VERTEX_PRECISION_MULTIPLIER
	)},${Math.floor(vertex.lat * VERTEX_PRECISION_MULTIPLIER)}`
	const vertecies = { ...state.vertecies }
	// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
	delete vertecies[b]
	const vertexDictionary = { ...state.vertexDictionary }
	// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
	delete vertexDictionary[key]
	return { ...state, vertecies, vertexDictionary }
}
