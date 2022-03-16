import type { Vertex } from 'State/Segment/Vertex'

export type MeshLine =
	| [Vertex, Vertex, Record<string, number | string>]
	| [Vertex, Vertex]
