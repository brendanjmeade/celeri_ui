import type { SegmentState } from './State'

export type LoadNewDataAction = SegmentState

export default function LoadNewData(
	state: SegmentState,
	action: LoadNewDataAction
): SegmentState {
	return action
}
