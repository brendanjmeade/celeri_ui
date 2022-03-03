import type { BlockState } from './State'

export type DeleteBlockAction = number[]

export default function DeleteBlock(
	state: BlockState,
	payload: DeleteBlockAction
): BlockState {
	const blocks: BlockState = []
	for (const [index, element] of state.entries()) {
		if (!payload.includes(index)) {
			blocks.push(element)
		}
	}
	return blocks
}
