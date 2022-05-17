export enum EditMode {
	Vertex = 'vertex',
	Block = 'block',
	Velocity = 'velocities',
	Segments = 'segment'
}
export const editModes: Record<string, EditMode> = {
	Block: EditMode.Block,
	Vertex: EditMode.Vertex,
	Velocity: EditMode.Velocity,
	Segment: EditMode.Segments
}
