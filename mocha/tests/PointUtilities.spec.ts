/* eslint-disable @typescript-eslint/no-magic-numbers */
import { expect } from 'chai'
import type { Vertex } from '../../src/State/Segment/Vertex'
import { PointsInPolygon } from '../../src/Utilities/PointUtilities'

describe('Point Utilities', () => {
	it('Can filter a list of points within a polygon', () => {
		const points: { point: Vertex; id: number }[] = [
			{
				point: { lon: 0, lat: 1 },
				id: 0
			},
			{
				point: { lon: 100, lat: 50 },
				id: 1
			},
			{
				point: { lon: 150, lat: 45 },
				id: 2
			},
			{
				point: { lon: 300, lat: 80 },
				id: 3
			}
		]

		const polygon: Vertex[] = [
			{ lon: 90, lat: 40 },
			{ lon: 160, lat: 30 },
			{ lon: 165, lat: 55 },
			{ lon: 153, lat: 51 },
			{ lon: 87, lat: 58 }
		]

		const inPolygon = PointsInPolygon(points, polygon)

		expect(inPolygon).to.have.length(2)
		expect(inPolygon).to.contain(1)
		expect(inPolygon).to.contain(2)
	})
})
