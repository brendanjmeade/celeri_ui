import type { Block } from './Block'
import { createBlock } from './Block'
import type { BlockState } from './State'

export interface CreateBlockAction {
	data: Partial<Block>
}

export default function EditSegmentData(
	state: BlockState,
	{ data }: CreateBlockAction
): BlockState {
	return [...state, createBlock(data)]
}
