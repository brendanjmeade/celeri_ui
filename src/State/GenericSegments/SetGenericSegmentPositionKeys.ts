import type { GenericSegmentState } from './State'

export interface SetGenericSegmentPositionKeysAction {
	collection: string
	startLon: string
	startLat: string
	endLon: string
	endLat: string
	plot: string
}

export function SetGenericSegmentPositionKeys(
	state: GenericSegmentState,
	action: SetGenericSegmentPositionKeysAction
): GenericSegmentState {
	const oldValue = state[action.collection]
	if (!oldValue) return state
	const updated = {
		...oldValue,
		startLon: action.startLon,
		startLat: action.startLat,
		endLon: action.endLon,
		endLat: action.endLat,
		plot: action.plot
	}
	return {
		...state,
		[action.collection]: updated
	}
}
