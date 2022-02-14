import type { InMemorySegment } from './Segment'
import { defaultSegment } from './Segment'
import type { SegmentState } from './State'

export interface BridgeVerticesAction {
	a: number
	b: number
}

export default function BridgeVertices(
	state: SegmentState,
	{ a, b }: BridgeVerticesAction
): SegmentState {
	const segment: InMemorySegment = {
		...defaultSegment,
		start: a,
		end: b
	}
	const segments = [...state.segments, segment]
	return { ...state, segments }
}
