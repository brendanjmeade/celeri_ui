import type { Block } from './Block'
import type { BlockState } from './State'

export interface EditBlockDataAction {
	indices: number[]
	data: Partial<Block>
}

export default function EditBlockData(
	state: BlockState,
	payload: EditBlockDataAction
): BlockState {
	const blocks = [...state]
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	for (const index of payload.indices) {
		const block = { ...blocks[index], ...payload.data }
		blocks[index] = block
	}
	return blocks
}
