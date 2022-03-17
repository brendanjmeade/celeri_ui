import type { GenericSegmentState } from './State'

export interface SetGenericSegmentPositionKeysAction {
	collection: string
	startLon: string
	startLat: string
	endLon: string
	endLat: string
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
		endLat: action.endLat
	}
	return {
		...state,
		[action.collection]: updated
	}
}
