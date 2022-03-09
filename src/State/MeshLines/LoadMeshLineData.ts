import type { MeshLine } from './MeshLine'
import type { MeshLineState } from './State'

export type LoadMeshLineDataAction = MeshLine[]

export function LoadMeshLineData(
	state: MeshLineState,
	action: LoadMeshLineDataAction
): MeshLineState {
	return action
}
