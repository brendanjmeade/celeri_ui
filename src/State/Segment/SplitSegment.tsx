import type { SegmentState } from './State'
import { getVertexIdOrInsert } from './Vertex'

export type SplitSegmentAction = number[]

export default function SplitSegment(
	state: SegmentState,
	payload: SplitSegmentAction
): SegmentState {
	const vertecies = { ...state.vertecies }
	const vertexDictionary = { ...state.vertexDictionary }
	const segments = [...state.segments]
	let { lastIndex } = state

	for (const index of payload) {
		const oldSegment = state.segments[index]
		const start = state.vertecies[oldSegment.start]
		const end = state.vertecies[oldSegment.end]
		const midpoint = {
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			lon: (start.lon + end.lon) / 2,
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			lat: (start.lat + end.lat) / 2
		}
		const [midpointId, updatedLastIndex] = getVertexIdOrInsert(
			midpoint,
			vertexDictionary,
			vertecies,
			lastIndex
		)
		lastIndex = updatedLastIndex
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
		segments[index] = startSegment
		segments.push(endSegment)
	}

	return { vertecies, vertexDictionary, segments, lastIndex }
}
