import type { VelocityState } from './State'

export type DeleteVelocityAction = number[]

export default function DeleteVelocity(
	state: VelocityState,
	payload: DeleteVelocityAction
): VelocityState {
	const velocities: VelocityState = []
	for (const [index, element] of state.entries()) {
		if (!payload.includes(index)) {
			velocities.push(element)
		}
	}
	return velocities
}
