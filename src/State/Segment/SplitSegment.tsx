import type { SegmentState } from './State'
import { getVertexIdOrInsert } from './Vertex'

export interface SplitSegmentAction {
	type: 'splitSegment'
	index: number
}

export default function SplitSegment(
	state: SegmentState,
	{ index }: SplitSegmentAction
): SegmentState {
	const oldSegment = state.segments[index]
	const start = state.vertecies[oldSegment.start]
	const end = state.vertecies[oldSegment.end]
	const midpoint = {
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		lon: (start.lon + end.lon) / 2,
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		lat: (start.lat + end.lat) / 2
	}
	const midpointId = getVertexIdOrInsert(
		midpoint,
		state.vertexDictionary,
		state.vertecies
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
	segments[index] = startSegment
	segments.push(endSegment)
	return { ...state, segments }
}
