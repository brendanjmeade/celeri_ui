import type { VelocityState } from './State'
import type { Velocity } from './Velocity'
import { createVelocity } from './Velocity'

export interface CreateVelocityAction {
	data: Partial<Velocity>
}

export default function CreateVelocity(
	state: VelocityState,
	{ data }: CreateVelocityAction
): VelocityState {
	return [...state, createVelocity(data)]
}
