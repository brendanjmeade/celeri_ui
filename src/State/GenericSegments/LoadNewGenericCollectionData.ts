import type { GenericSegmentState } from './State'

export interface LoadNewGenericCollectionDataAction {
	name: string
	data: Record<string, number | string>[]
}

export function LoadNewGenericCollectionData(
	state: GenericSegmentState,
	action: LoadNewGenericCollectionDataAction
): GenericSegmentState {
	return {
		...state,
		[action.name]: {
			name: action.name,
			startLat: 'startLat',
			startLon: 'startLon',
			endLat: 'endLat',
			endLon: 'endLon',
			plot: '',
			segments: action.data
		}
	}
}
