import type { GenericSegmentState } from './State'

export type RemoveGenericCollectionAction = string

export function RemoveGenericCollection(
	state: GenericSegmentState,
	action: RemoveGenericCollectionAction
): GenericSegmentState {
	const result: GenericSegmentState = {}
	for (const key of Object.keys(state)) {
		if (key !== action) {
			result[key] = state[key]
		}
	}
	return result
}
