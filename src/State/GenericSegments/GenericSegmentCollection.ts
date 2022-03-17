export interface GenericSegmentCollection {
	name: string
	startLon: string
	startLat: string
	endLon: string
	endLat: string
	segments: Record<string, number | string>[]
}
