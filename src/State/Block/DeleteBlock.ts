import type { BlockState } from './State'

export type DeleteBlockAction = number

export default function DeleteBlock(
	state: BlockState,
	payload: DeleteBlockAction
): BlockState {
	const blocks = [...state]
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	blocks.splice(payload, 1)
	return blocks
}
