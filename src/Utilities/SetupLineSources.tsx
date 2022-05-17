import type { GenericSegmentDisplaySettings } from 'Components/GenericSegmentPanel'
import type { LineSource } from 'Components/Map/Sources'
import type { MeshDisplaySettings } from 'Components/MeshPanel'
import type { SegmentsDisplaySettings } from 'Components/SegmentsPanel'
import type { GenericSegmentState } from 'State/GenericSegments/State'
import type { MeshLineState } from 'State/MeshLines/State'
import type { SegmentState } from 'State/Segment/State'
import type { Vertex } from 'State/Segment/Vertex'
import {
	DEFAULT_VERTEX,
	GetShortestLineCoordinates
} from 'State/Segment/Vertex'

export default function SetupLineSources({
	segmentSettings,
	segments,
	select,
	meshLineSettings,
	meshLines,
	genericSegmentSettings,
	genericSegments,
	setLineSources
}: {
	segmentSettings: SegmentsDisplaySettings
	segments: SegmentState
	select: { select: (type: string, indices: number[]) => void }
	meshLineSettings: MeshDisplaySettings
	meshLines: MeshLineState
	genericSegmentSettings: GenericSegmentDisplaySettings
	genericSegments: GenericSegmentState
	setLineSources: (lines: LineSource[]) => void
}): void {
	const sources: LineSource[] = []
	if (!segmentSettings.hide) {
		sources.push({
			name: 'segments',
			color: segmentSettings.color,
			selectedColor: segmentSettings.activeColor,
			width: segmentSettings.width,
			selectedWidth: segmentSettings.activeWidth,
			lines: segments.segments.map((segment, index) => {
				const start = segments.vertecies[segment.start] ?? DEFAULT_VERTEX
				const end = segments.vertecies[segment.end] ?? DEFAULT_VERTEX
				const [[startLongitude, startLatitude], [endLongitude, endLatitude]] =
					GetShortestLineCoordinates(start, end)
				return {
					startLongitude,
					startLatitude,
					endLongitude,
					endLatitude,
					name: segment.name,
					description: `${start.lon},${start.lat} to ${end.lon},${end.lat}`,
					index,
					label:
						segmentSettings.plottableKey in segment
							? `${
									(segment as unknown as Record<string, number | string>)[
										segmentSettings.plottableKey
									]
							  }`
							: ``
				}
			}),
			click: (index): void => {
				select.select('segment', [index])
			}
		})
	}
	if (!meshLineSettings.hide) {
		for (const key of Object.keys(meshLines)) {
			const mesh = meshLines[key].line
			sources.push({
				name: `mesh:${key}`,
				color: meshLineSettings.color,
				selectedColor: meshLineSettings.activeColor,
				width: meshLineSettings.width,
				selectedWidth: meshLineSettings.activeWidth,
				lines:
					mesh.map((line, index) => {
						const start = line[0]
						const end = line[1]
						const [
							[startLongitude, startLatitude],
							[endLongitude, endLatitude]
						] = GetShortestLineCoordinates(start, end)
						return {
							startLongitude,
							startLatitude,
							endLongitude,
							endLatitude,
							name: '',
							description: '',
							index
						}
					}) || []
			})
		}
	}
	if (!genericSegmentSettings.hide) {
		for (const key of Object.keys(genericSegments)) {
			const {
				startLat,
				startLon,
				endLat,
				endLon,
				plot,
				segments: availableSegments
			} = genericSegments[key]
			if (
				startLat in availableSegments[0] &&
				endLat in availableSegments[0] &&
				startLon in availableSegments[0] &&
				endLon in availableSegments[0]
			) {
				sources.push({
					name: `generic_segment:${key}`,
					color: genericSegmentSettings.color,
					selectedColor: genericSegmentSettings.activeColor,
					width: genericSegmentSettings.width,
					selectedWidth: genericSegmentSettings.activeWidth,
					lines:
						availableSegments
							.map((line, index) => {
								const start = { lat: line[startLat], lon: line[startLon] }
								const end = { lat: line[endLat], lon: line[endLon] }
								if (
									typeof start.lat !== 'number' ||
									typeof start.lon !== 'number' ||
									typeof end.lat !== 'number' ||
									typeof end.lon !== 'number'
								)
									return false as unknown as {
										startLongitude: number
										startLatitude: number
										endLongitude: number
										endLatitude: number
										name: string
										description: string
										index: number
									}
								const [
									[startLongitude, startLatitude],
									[endLongitude, endLatitude]
								] = GetShortestLineCoordinates(start as Vertex, end as Vertex)
								return {
									startLongitude,
									startLatitude,
									endLongitude,
									endLatitude,
									name: '',
									description: '',
									index,
									label: plot && plot in line ? `${line[plot]}` : ''
								}
							})
							.filter(v => v) || []
				})
			}
		}
	}
	setLineSources(sources)
}
