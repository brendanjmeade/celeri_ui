import type { Vertex } from 'State/Segment/Vertex'

export interface PointSource {
	name: string
	color: string
	selectedColor: string
	radius: number
	points: {
		longitude: number
		latitude: number
		name: string
		description: string
		index: number
	}[]
	click?: (index: number) => void
}

export interface ArrowSource {
	name: string
	color: string
	selectedColor: string
	scale: number
	width: number
	arrowHeadScale: number
	arrows: {
		longitude: number
		latitude: number
		scale: number
		direction: [number, number]
		name: string
		description: string
		index: number
	}[]
	click?: (index: number) => void
}

export interface LineSource {
	name: string
	color: string
	selectedColor: string
	width: number
	selectedWidth: number
	lines: {
		startLongitude: number
		startLatitude: number
		endLongitude: number
		endLatitude: number
		name: string
		description: string
		index: number
	}[]
	click?: (index: number) => void
}
export interface DrawnPointSource {
	color: string
	selectedColor: string
	radius: number
	selectedRadius: number
	points: {
		longitude: number
		latitude: number
		index: number
	}[]
	select?: (index: number[]) => void
	update?: (index: number, coordinates: Vertex) => void
}

export interface PolygonSource {
	name: string
	borderColor: string
	color: string
	borderRadius: number
	polygons: {
		polygon: Vertex[]
		index: number
		name: string
		description: string
	}[]
}
