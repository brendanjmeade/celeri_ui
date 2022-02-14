import type { SegmentState } from './State'

export interface LoadNewDataAction {
	type: 'loadNewData'
	payload: SegmentState
}

export default function LoadNewData(
	state: SegmentState,
	action: LoadNewDataAction
): SegmentState {
	return action.payload
}
