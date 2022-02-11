import type { InMemorySegment } from './Segment'
import { defaultSegment } from './Segment'
import type { SegmentState } from './State'
import type { Vertex } from './Vertex'
import { getVertexIdOrInsert } from './Vertex'

export interface CreateSegmentAction {
	type: 'createSegmet'
	start: Vertex
	end: Vertex
}

export default function CreateSegment(
	state: SegmentState,
	action: CreateSegmentAction
): SegmentState {
	const verts = { ...state.vertecies }
	const dictionary = { ...state.vertexDictionary }

	const start = getVertexIdOrInsert(action.start, dictionary, verts)
	const end = getVertexIdOrInsert(action.end, dictionary, verts)
	const segment: InMemorySegment = { ...defaultSegment, start, end }
	const segments = [...state.segments, segment]

	return { vertecies: verts, vertexDictionary: dictionary, segments }
}
