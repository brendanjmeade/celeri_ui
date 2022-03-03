import type { InMemorySegment } from './Segment'
import type { SegmentState } from './State'
import { tryRemoveVertex } from './Vertex'

export interface DeleteSegmentAction {
	index: number[]
}

export default function DeleteSegment(
	state: SegmentState,
	payload: DeleteSegmentAction
): SegmentState {
	const segments: InMemorySegment[] = []
	const removedSegments: InMemorySegment[] = []

	let adjustedState = { ...state }

	for (const [index, segment] of state.segments.entries()) {
		if (!payload.index.includes(index)) {
			segments.push(segment)
		} else {
			removedSegments.push(segment)
		}
	}

	adjustedState.segments = segments

	for (const segment of removedSegments) {
		adjustedState = tryRemoveVertex(
			tryRemoveVertex(adjustedState, segment.start),
			segment.end
		)
	}

	return adjustedState
}
