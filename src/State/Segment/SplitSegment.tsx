import type { SegmentState } from './State'
import { getVertexIdOrInsert } from './Vertex'

export interface SplitSegmentAction {
	type: 'splitSegment'
	payload: number
}

export default function SplitSegment(
	state: SegmentState,
	{ payload }: SplitSegmentAction
): SegmentState {
	const oldSegment = state.segments[payload]
	const start = state.vertecies[oldSegment.start]
	const end = state.vertecies[oldSegment.end]
	const midpoint = {
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		lon: (start.lon + end.lon) / 2,
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		lat: (start.lat + end.lat) / 2
	}
	const [midpointId, lastIndex] = getVertexIdOrInsert(
		midpoint,
		state.vertexDictionary,
		state.vertecies,
		state.lastIndex
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
	const segments = [...state.segments]
	segments[payload] = startSegment
	segments.push(endSegment)
	return { ...state, segments, lastIndex }
}
