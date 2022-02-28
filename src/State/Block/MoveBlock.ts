import type { Vertex } from '../Segment/Vertex'
import type { BlockState } from './State'

export interface MoveBlockAction {
	position: Vertex
	index: number
}

export default function MoveBlock(
	state: BlockState,
	{ index, position }: MoveBlockAction
): BlockState {
	const s = [...state]
	const b = { ...s[index] }
	b.interior_lat = position.lat
	b.interior_lon = position.lon
	s[index] = b
	return s
}
