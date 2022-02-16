import type { BlockState } from './State'

export type LoadNewBlockDataAction = BlockState

export function LoadNewBlockData(
	state: BlockState,
	payload: LoadNewBlockDataAction
): BlockState {
	return payload
}
