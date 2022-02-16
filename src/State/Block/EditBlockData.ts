import type { Block } from './Block'
import type { BlockState } from './State'

export interface EditBlockDataAction {
	index: number
	data: Partial<Block>
}

export default function EditBlockData(
	state: BlockState,
	payload: EditBlockDataAction
): BlockState {
	const blocks = [...state]
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	const block = { ...blocks[payload.index], ...payload.data }
	blocks[payload.index] = block
	return blocks
}
