/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable import/prefer-default-export */
import {
	featureCollection,
	point as turfPoint,
	pointsWithinPolygon,
	polygon as turfPolygon
} from '@turf/turf'
import type { Vertex } from '../State/Segment/Vertex'

export function PointsInPolygon(
	points: { point: Vertex; id: number }[],
	polygon: Vertex[]
): number[] {
	if (points.length === 0 || polygon.length === 0) return []
	const pointList = featureCollection(
		points.map(point =>
			turfPoint([point.point.lon, point.point.lat], { index: point.id })
		)
	)
	const polygonList = featureCollection([
		turfPolygon([[...polygon, polygon[0]].map(point => [point.lon, point.lat])])
	])
	const filtered = pointsWithinPolygon(pointList, polygonList)
	return filtered.features
		.map(feature => feature.properties.index ?? -1)
		.filter(v => v >= 0)
}
