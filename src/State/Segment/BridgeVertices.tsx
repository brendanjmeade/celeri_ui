import type { InMemorySegment } from './Segment'
import { defaultSegment } from './Segment'
import type { SegmentState } from './State'

export interface BridgeVerticesAction {
	type: 'bridgeVertices'
	a: number
	b: number
}

export default function BridgeVertices(
	state: SegmentState,
	action: BridgeVerticesAction
): SegmentState {
	const segment: InMemorySegment = {
		...defaultSegment,
		start: action.a,
		end: action.b
	}
	const segments = [...state.segments, segment]
	return { ...state, segments }
}
