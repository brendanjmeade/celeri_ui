import type { InMemorySegment } from './Segment'
import { defaultSegment } from './Segment'
import type { SegmentState } from './State'
import type { Vertex } from './Vertex'
import { getVertexIdOrInsert } from './Vertex'

export interface CreateSegmentAction {
	start: Vertex
	end: Vertex
}

export default function CreateSegment(
	state: SegmentState,
	payload: CreateSegmentAction
): SegmentState {
	const verts = { ...state.vertecies }
	const dictionary = { ...state.vertexDictionary }
	const { lastIndex } = state

	const [start, lastIndex1] = getVertexIdOrInsert(
		payload.start,
		dictionary,
		verts,
		lastIndex
	)
	const [end, lastIndex2] = getVertexIdOrInsert(
		payload.end,
		dictionary,
		verts,
		lastIndex1
	)
	const segment: InMemorySegment = { ...defaultSegment, start, end }
	const segments = [...state.segments, segment]

	return {
		vertecies: verts,
		vertexDictionary: dictionary,
		segments,
		lastIndex: lastIndex2
	}
}
