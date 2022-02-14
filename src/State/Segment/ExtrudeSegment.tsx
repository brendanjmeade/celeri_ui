import type { InMemorySegment } from './Segment'
import { defaultSegment } from './Segment'
import type { SegmentState } from './State'
import type { Vertex } from './Vertex'
import { getVertexIdOrInsert } from './Vertex'

export interface ExtrudeSegmentAction {
	index: number
	targetPoint: Vertex
}

export default function ExtrudeSegment(
	state: SegmentState,
	payload: ExtrudeSegmentAction
): SegmentState {
	const verts = { ...state.vertecies }
	const dictionary = { ...state.vertexDictionary }

	const [end, lastIndex] = getVertexIdOrInsert(
		payload.targetPoint,
		dictionary,
		verts,
		state.lastIndex
	)
	const segment: InMemorySegment = {
		...defaultSegment,
		start: payload.index,
		end
	}
	const segments = [...state.segments, segment]

	return { vertecies: verts, vertexDictionary: dictionary, segments, lastIndex }
}
