import type { VelocityState } from './State'

export type LoadNewVelocityDataAction = VelocityState

export function LoadNewVelocityData(
	state: VelocityState,
	payload: LoadNewVelocityDataAction
): VelocityState {
	return payload
}
