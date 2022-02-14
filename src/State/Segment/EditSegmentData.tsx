import type { Segment } from './Segment'
import type { SegmentState } from './State'

export interface EditSegmentDataAction {
	type: 'editSegmentData'
	payload: {
		index: number
		data: Partial<Segment>
	}
}

export default function EditSegmentData(
	state: SegmentState,
	{ payload }: EditSegmentDataAction
): SegmentState {
	const segments = [...state.segments]
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	const segment = { ...segments[payload.index], ...payload.data }
	segments[payload.index] = segment
	return { ...state, segments }
}
