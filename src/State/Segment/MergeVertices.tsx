import type { SegmentState } from './State'
import { VERTEX_PRECISION_MULTIPLIER } from './Vertex'

export interface MergeVerticesAction {
	a: number
	b: number
}

export default function MergeVertices(
	state: SegmentState,
	{ a, b }: MergeVerticesAction
): SegmentState {
	const segments = state.segments
		.map(s => {
			let segment = s
			if (segment.start === b) {
				segment = { ...segment, start: a }
			}
			if (segment.end === b) {
				segment = { ...segment, end: a }
			}
			return segment
		})
		.filter(s => s.start !== s.end)
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
	return { ...state, vertecies, vertexDictionary, segments }
}
