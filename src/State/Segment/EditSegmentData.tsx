import type { Segment } from './Segment'
import type { SegmentState } from './State'

export interface EditSegmentDataAction {
	type: 'editSegmentData'
	index: number
	data: Partial<Segment>
}

export default function EditSegmentData(
	state: SegmentState,
	action: EditSegmentDataAction
): SegmentState {
	const segments = [...state.segments]
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	const segment = { ...segments[action.index], ...action.data }
	segments[action.index] = segment
	return { ...state, segments }
}
