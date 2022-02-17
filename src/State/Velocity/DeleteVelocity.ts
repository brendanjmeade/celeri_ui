import type { VelocityState } from './State'

export type DeleteVelocityAction = number

export default function DeleteVelocity(
	state: VelocityState,
	payload: DeleteVelocityAction
): VelocityState {
	const blocks = [...state]
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	blocks.splice(payload, 1)
	return blocks
}
