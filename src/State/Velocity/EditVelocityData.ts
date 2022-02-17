import type { VelocityState } from './State'
import type { Velocity } from './Velocity'

export interface EditVelocityDataAction {
	index: number
	data: Partial<Velocity>
}

export default function EditVelocityData(
	state: VelocityState,
	payload: EditVelocityDataAction
): VelocityState {
	const blocks = [...state]
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	const block = { ...blocks[payload.index], ...payload.data }
	blocks[payload.index] = block
	return blocks
}
