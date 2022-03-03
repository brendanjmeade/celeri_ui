import type { Segment } from './Segment'
import type { SegmentState } from './State'

export interface EditSegmentDataAction {
	indices: number[]
	data: Partial<Segment>
}

export default function EditSegmentData(
	state: SegmentState,
	payload: EditSegmentDataAction
): SegmentState {
	const segments = [...state.segments]
	for (const index of payload.indices) {
		const segment = { ...segments[index], ...payload.data }
		segments[index] = segment
	}
	return { ...state, segments }
}
