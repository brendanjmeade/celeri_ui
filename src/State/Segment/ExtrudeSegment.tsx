import type { InMemorySegment } from './Segment'
import { defaultSegment } from './Segment'
import type { SegmentState } from './State'
import type { Vertex } from './Vertex'
import { getVertexIdOrInsert } from './Vertex'

export interface ExtrudeSegmentAction {
	type: 'extrudeSegment'
	index: number
	targetPoint: Vertex
}

export default function ExtrudeSegment(
	state: SegmentState,
	action: ExtrudeSegmentAction
): SegmentState {
	const verts = { ...state.vertecies }
	const dictionary = { ...state.vertexDictionary }

	const end = getVertexIdOrInsert(action.targetPoint, dictionary, verts)
	const segment: InMemorySegment = {
		...defaultSegment,
		start: action.index,
		end
	}
	const segments = [...state.segments, segment]

	return { vertecies: verts, vertexDictionary: dictionary, segments }
}
