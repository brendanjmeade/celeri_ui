import type { Vertex } from '../Segment/Vertex'
import type { VelocityState } from './State'

export interface MoveVelocityAction {
	position: Vertex
	index: number
}

export default function MoveVelocity(
	state: VelocityState,
	{ index, position }: MoveVelocityAction
): VelocityState {
	const velocities = [...state]
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	const block = { ...velocities[index], ...position }
	velocities[index] = block
	return velocities
}
