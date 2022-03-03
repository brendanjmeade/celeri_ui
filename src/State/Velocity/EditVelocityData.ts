import type { VelocityState } from './State'
import type { Velocity } from './Velocity'

export interface EditVelocityDataAction {
	indices: number[]
	data: Partial<Velocity>
}

export default function EditVelocityData(
	state: VelocityState,
	payload: EditVelocityDataAction
): VelocityState {
	const blocks = [...state]
	for (const index of payload.indices) {
		const block = { ...blocks[index], ...payload.data }
		blocks[index] = block
	}
	return blocks
}
