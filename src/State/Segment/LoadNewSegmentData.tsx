import type { SegmentState } from './State'

export type LoadNewSegmentDataAction = SegmentState

export default function LoadNewSegmentData(
	state: SegmentState,
	action: LoadNewSegmentDataAction
): SegmentState {
	return action
}
