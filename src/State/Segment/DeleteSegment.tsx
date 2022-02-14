import type { SegmentState } from './State'
import { tryRemoveVertex } from './Vertex'

export interface DeleteSegmentAction {
	type: 'deleteSegment'
	payload: {
		index: number
	}
}

export default function DeleteSegment(
	state: SegmentState,
	{ payload }: DeleteSegmentAction
): SegmentState {
	const segments = [...state.segments]
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	const segment = segments.splice(payload.index, 1)[0]
	return tryRemoveVertex(
		tryRemoveVertex({ ...state, segments }, segment.start),
		segment.end
	)
}
