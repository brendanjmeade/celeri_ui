/* eslint-disable @typescript-eslint/no-magic-numbers */
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import type { GeoJSONSource, MapboxGeoJSONFeature } from 'mapbox-gl'
import mapboxgl, { Map, NavigationControl, Popup } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { ReactElement } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { Vertex } from 'Utilities/SegmentFile'
import { InverseTransformVertexCoordinates } from 'Utilities/SegmentFile'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

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
	select?: (index: number) => void
	update?: (index: number, coordinates: Vertex) => void
}

const ARROW_ANGLE_1 = Math.PI / 6
const ARROW_ANGLE_2 = 2 * Math.PI - ARROW_ANGLE_1

const sourceClickEvents: Record<string, ((index: number) => void) | undefined> =
	{}

function MapElement({
	pointSources,
	arrowSources,
	lineSources,
	selections,
	drawnPointSource
}: {
	pointSources: PointSource[]
	arrowSources: ArrowSource[]
	lineSources: LineSource[]
	drawnPointSource: DrawnPointSource
	selections: Record<string, number>
}): ReactElement {
	const mapReference = useRef<HTMLDivElement>(null)

	const [map, setMap] = useState<Map>()
	const [mapLoaded, setMapLoaded] = useState(false)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [draw, setDraw] = useState<MapboxDraw>()
	const [popup] = useState<Popup>(
		new Popup({ closeButton: false, closeOnClick: false })
	)

	const [internalPointSources, setInternalPointSources] =
		useState<PointSource[]>()
	const [internalArrowSources, setInternalArrowSources] =
		useState<ArrowSource[]>()
	const [internalLineSources, setInternalLineSources] = useState<LineSource[]>()
	const [internalDrawnPointSource, setInternalDrawnPointSource] = useState<{
		source: DrawnPointSource | undefined
	}>({ source: undefined })
	const [drawnPointSettings, setDrawnPointSettings] = useState<{
		selectedColor: string
		selectedRadius: number
		color: string
		radius: number
	}>({ selectedColor: '', selectedRadius: 0, color: '', radius: 0 })

	const [internalSelections, setInternalSelections] = useState<
		Record<string, number>
	>({})

	useEffect(() => {
		if (!map && mapboxgl.accessToken && mapReference.current) {
			const innerMap = new Map({
				container: mapReference.current,
				style: 'mapbox://styles/mapbox-public/ckngin2db09as17p84ejhe24y',
				// eslint-disable-next-line @typescript-eslint/no-magic-numbers
				center: [0, 0],
				// eslint-disable-next-line @typescript-eslint/no-magic-numbers
				zoom: 2
			})
			innerMap.addControl(new NavigationControl())

			setMap(innerMap)
			innerMap.on('load', () => {
				setMapLoaded(true)
			})
			innerMap.on(
				'draw.selectionchange',
				({ features }: { features: MapboxGeoJSONFeature[] }) => {
					if (!internalDrawnPointSource.source?.select) return
					const feature = features[0]
					if (
						feature &&
						feature.type === 'Feature' &&
						feature.geometry.type === 'Point' &&
						feature.properties &&
						'index' in feature.properties &&
						typeof feature.properties.index === 'number'
					) {
						internalDrawnPointSource.source.select(feature.properties.index)
					}
				}
			)
			innerMap.on(
				'draw.update',
				({
					features,
					action
				}: {
					features: MapboxGeoJSONFeature[]
					action: 'change_coordinates' | 'move'
				}) => {
					if (!internalDrawnPointSource.source?.update) return
					if (action === 'move' && features.length > 0) {
						for (const feature of features) {
							if (
								feature.type === 'Feature' &&
								feature.geometry.type === 'Point' &&
								feature.properties &&
								'index' in feature.properties &&
								typeof feature.properties.index === 'number'
							) {
								internalDrawnPointSource.source.update(
									feature.properties.index,
									InverseTransformVertexCoordinates(
										feature.geometry.coordinates as [number, number]
									)
								)
							}
						}
					}
				}
			)
		}
		console.log('Updating map...')
	}, [draw, internalDrawnPointSource.source, map])

	useEffect(() => {
		if (
			map &&
			mapLoaded &&
			internalDrawnPointSource.source !== drawnPointSource
		) {
			console.log('Drawning Points')
			internalDrawnPointSource.source = drawnPointSource
			setInternalDrawnPointSource(internalDrawnPointSource)
			let localDraw = draw
			if (
				drawnPointSource.selectedColor !== drawnPointSettings.selectedColor ||
				drawnPointSource.selectedRadius !== drawnPointSettings.selectedRadius ||
				drawnPointSource.color !== drawnPointSettings.color ||
				drawnPointSource.radius !== drawnPointSettings.radius
			) {
				setDrawnPointSettings({
					color: drawnPointSource.color,
					radius: drawnPointSource.radius,
					selectedRadius: drawnPointSource.selectedRadius,
					selectedColor: drawnPointSource.selectedColor
				})
				if (draw) {
					map.removeControl(draw)
				}
				if (drawnPointSource) {
					localDraw = new MapboxDraw({
						displayControlsDefault: false,
						controls: {
							point: true
						},
						defaultMode: 'simple_select'
						// styles: [
						// 	// {
						// 	// 	id: 'highlight-active-points',
						// 	// 	type: 'circle',
						// 	// 	filter: [
						// 	// 		'all',
						// 	// 		['==', '$type', 'Point'],
						// 	// 		['==', 'meta', 'feature'],
						// 	// 		['==', 'active', 'true']
						// 	// 	],
						// 	// 	paint: {
						// 	// 		'circle-radius': drawnPointSource.selectedRadius,
						// 	// 		'circle-color': drawnPointSource.selectedColor
						// 	// 	}
						// 	// },
						// 	// {
						// 	// 	id: 'points-are-blue',
						// 	// 	type: 'circle',
						// 	// 	filter: [
						// 	// 		'all',
						// 	// 		['==', '$type', 'Point'],
						// 	// 		['==', 'meta', 'feature'],
						// 	// 		['==', 'active', 'false']
						// 	// 	],
						// 	// 	paint: {
						// 	// 		'circle-radius': drawnPointSource.radius,
						// 	// 		'circle-color': drawnPointSettings.color
						// 	// 	}
						// 	// }
						// ]
					})
					map.addControl(localDraw)
					setDraw(localDraw)
				} else {
					localDraw = undefined
				}
			}
			if (localDraw) {
				localDraw.set({
					type: 'FeatureCollection',
					features: drawnPointSource.points.map(point => ({
						type: 'Feature',
						properties: {
							description: ``,
							index: point.index,
							name: ``
						},
						geometry: {
							type: 'Point',
							coordinates: [point.longitude, point.latitude]
						}
					}))
				})
			}
		}
	}, [
		map,
		mapLoaded,
		internalDrawnPointSource,
		drawnPointSource,
		drawnPointSettings,
		draw
	])

	useEffect(() => {
		if (map && mapLoaded && internalArrowSources !== arrowSources) {
			console.log('Setting arrows in map!')
			if (internalArrowSources) {
				for (const source of internalArrowSources) {
					sourceClickEvents[`arrow:${source.name}`] = source.click
					const mapSource = map.getSource(`arrow:${source.name}`) as
						| GeoJSONSource
						| undefined
					if (mapSource !== undefined) {
						mapSource.setData({
							type: 'FeatureCollection',
							features: []
						})
					}
					map.removeLayer(`layer:arrow:${source.name}`)
					map.removeLayer(`layer:arrow:${source.name}:click`)
				}
				// eslint-disable-next-line unicorn/no-useless-undefined
				setInternalArrowSources(undefined)
			} else {
				for (const source of arrowSources) {
					sourceClickEvents[`arrow:${source.name}`] = source.click
					let mapSource = map.getSource(`arrow:${source.name}`) as
						| GeoJSONSource
						| undefined
					const isNewLayer = mapSource === undefined
					if (isNewLayer) {
						map.addSource(`arrow:${source.name}`, {
							type: 'geojson',
							data: {
								type: 'FeatureCollection',
								features: []
							}
						})
						mapSource = map.getSource(`arrow:${source.name}`) as GeoJSONSource
					}
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					if (mapSource !== undefined) {
						mapSource.setData({
							type: 'FeatureCollection',
							features: source.arrows.map((arrow, index) => {
								const scale = arrow.scale * source.scale
								const arrowHeadScale = source.scale * source.arrowHeadScale
								const targetPoint = [
									arrow.longitude + arrow.direction[0] * scale,
									arrow.latitude + arrow.direction[1] * scale
								]
								const arrowPoint1 = [
									targetPoint[0] +
										(Math.cos(ARROW_ANGLE_1) * -arrow.direction[0] -
											Math.sin(ARROW_ANGLE_1) * -arrow.direction[1]) *
											arrowHeadScale,
									targetPoint[1] +
										(Math.sin(ARROW_ANGLE_1) * -arrow.direction[0] +
											Math.cos(ARROW_ANGLE_1) * -arrow.direction[1]) *
											arrowHeadScale
								]
								const arrowPoint2 = [
									targetPoint[0] +
										(Math.cos(ARROW_ANGLE_2) * -arrow.direction[0] -
											Math.sin(ARROW_ANGLE_2) * -arrow.direction[1]) *
											arrowHeadScale,
									targetPoint[1] +
										(Math.sin(ARROW_ANGLE_2) * -arrow.direction[0] +
											Math.cos(ARROW_ANGLE_2) * -arrow.direction[1]) *
											arrowHeadScale
								]
								return {
									type: 'Feature',
									properties: {
										description: `<strong>${arrow.name}</strong><p>${arrow.description}</p>`,
										index,
										name: arrow.name
									},
									geometry: {
										type: 'LineString',
										coordinates: [
											[arrow.longitude, arrow.latitude],
											targetPoint,
											arrowPoint1,
											targetPoint,
											arrowPoint2
										]
									}
								}
							})
						})
					}
					map.addLayer({
						id: `layer:arrow:${source.name}`,
						type: 'line',
						source: `arrow:${source.name}`,
						layout: {
							'line-cap': 'round',
							'line-join': 'miter'
						},
						paint: {
							'line-color': source.color,
							'line-width': source.width
						}
					})
					map.addLayer({
						id: `layer:arrow:${source.name}:click`,
						type: 'line',
						source: `arrow:${source.name}`,
						layout: {
							'line-cap': 'round',
							'line-join': 'miter'
						},
						paint: {
							'line-color': 'rgba(0,0,0,0.01)',
							'line-width': source.width * 10
						}
					})
					if (isNewLayer) {
						map.on('mouseenter', `layer:arrow:${source.name}:click`, event => {
							if (!event.features) return
							const feature = event.features[0]
							if (
								feature.geometry.type === 'Point' &&
								feature.properties &&
								typeof feature.properties.description === 'string'
							) {
								const coordinates = [...feature.geometry.coordinates] as [
									number,
									number
								]
								const { description } = feature.properties

								while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
									coordinates[0] +=
										event.lngLat.lng > coordinates[0] ? 360 : -360
								}

								popup.setLngLat(coordinates).setHTML(description).addTo(map)
							}
						})
						map.on('mouseleave', `layer:arrow:${source.name}:click`, () => {
							popup.remove()
						})
						map.on('click', `layer:arrow:${source.name}:click`, event => {
							const click = sourceClickEvents[`arrow:${source.name}`]
							if (!event.features || !click) return
							const feature = event.features[0]
							if (
								feature.properties &&
								typeof feature.properties.index === 'number' &&
								typeof feature.properties.name === 'string'
							) {
								const { index } = feature.properties
								click(index)
							}
						})
					}
				}
				setInternalArrowSources(arrowSources)
			}
		}
	}, [map, internalArrowSources, arrowSources, mapLoaded, popup])

	useEffect(() => {
		if (map && mapLoaded && internalLineSources !== lineSources) {
			console.log('Setting lines in map!')
			if (internalLineSources) {
				for (const source of internalLineSources) {
					sourceClickEvents[`line:${source.name}`] = source.click
					const mapSource = map.getSource(`line:${source.name}`) as
						| GeoJSONSource
						| undefined
					if (mapSource !== undefined) {
						mapSource.setData({
							type: 'FeatureCollection',
							features: []
						})
					}
					map.removeLayer(`layer:line:${source.name}`)
					map.removeLayer(`layer:line:${source.name}:click`)
				}
				// eslint-disable-next-line unicorn/no-useless-undefined
				setInternalLineSources(undefined)
			} else {
				for (const source of lineSources) {
					sourceClickEvents[`line:${source.name}`] = source.click
					let mapSource = map.getSource(`line:${source.name}`) as
						| GeoJSONSource
						| undefined
					const isNewLayer = mapSource === undefined
					if (isNewLayer) {
						map.addSource(`line:${source.name}`, {
							type: 'geojson',
							data: {
								type: 'FeatureCollection',
								features: []
							}
						})
						mapSource = map.getSource(`line:${source.name}`) as GeoJSONSource
					}
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					if (mapSource !== undefined) {
						mapSource.setData({
							type: 'FeatureCollection',
							features: source.lines.map(line => ({
								type: 'Feature',
								properties: {
									description: `<strong>${line.name}</strong><p>${line.description}</p>`,
									index: line.index,
									name: line.name,
									selected: line.index === selections[source.name]
								},
								geometry: {
									type: 'LineString',
									coordinates: [
										[line.startLongitude, line.startLatitude],
										[line.endLongitude, line.endLatitude]
									]
								}
							}))
						})
					}
					map.addLayer({
						id: `layer:line:${source.name}`,
						type: 'line',
						source: `line:${source.name}`,
						layout: {
							'line-cap': 'round',
							'line-join': 'miter'
						},
						paint: {
							'line-color': [
								'case',
								['get', 'selected'],
								source.selectedColor,
								source.color
							],
							'line-width': [
								'case',
								['get', 'selected'],
								source.selectedWidth,
								source.width
							]
						}
					})
					map.addLayer({
						id: `layer:line:${source.name}:click`,
						type: 'line',
						source: `line:${source.name}`,
						layout: {
							'line-cap': 'round',
							'line-join': 'miter'
						},
						paint: {
							'line-color': 'rgba(0,0,0,0.01)',
							'line-width': source.width * 10
						}
					})
					if (isNewLayer) {
						map.on('mouseenter', `layer:line:${source.name}:click`, event => {
							if (!event.features) return
							const feature = event.features[0]
							if (
								feature.geometry.type === 'LineString' &&
								feature.properties &&
								typeof feature.properties.description === 'string'
							) {
								const coordinates = [
									(feature.geometry.coordinates[0][0] +
										feature.geometry.coordinates[1][0]) /
										2,
									(feature.geometry.coordinates[0][1] +
										feature.geometry.coordinates[1][1]) /
										2
								] as [number, number]
								const { description } = feature.properties

								while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
									coordinates[0] +=
										event.lngLat.lng > coordinates[0] ? 360 : -360
								}

								popup.setLngLat(coordinates).setHTML(description).addTo(map)
							}
						})
						map.on('mouseleave', `layer:line:${source.name}:click`, () => {
							popup.remove()
						})
						map.on('click', `layer:line:${source.name}:click`, event => {
							const click = sourceClickEvents[`line:${source.name}`]
							if (!event.features || !click) return
							const feature = event.features[0]
							if (
								feature.properties &&
								typeof feature.properties.index === 'number' &&
								typeof feature.properties.name === 'string'
							) {
								const { index } = feature.properties
								click(index)
							}
						})
					}
				}
				setInternalLineSources(lineSources)
			}
		}

		const updatedInternalSelections = { ...internalSelections }
		let selectionChanged = false

		for (const sourcename of Object.keys(selections)) {
			if (selections[sourcename] !== internalSelections[sourcename]) {
				for (const source of lineSources) {
					if (source.name === sourcename) {
						selectionChanged = true
						updatedInternalSelections[sourcename] = selections[sourcename]
						const mapSource = map?.getSource(`line:${source.name}`) as
							| GeoJSONSource
							| undefined
						if (mapSource) {
							const index = selections[sourcename]
							mapSource.setData({
								type: 'FeatureCollection',
								features: source.lines.map(line => ({
									type: 'Feature',
									properties: {
										description: `<strong>${line.name}</strong><p>${line.description}</p>`,
										index: line.index,
										name: line.name,
										selected: line.index === index
									},
									geometry: {
										type: 'LineString',
										coordinates: [
											[line.startLongitude, line.startLatitude],
											[line.endLongitude, line.endLatitude]
										]
									}
								}))
							})
						}
					}
				}
			}
		}

		if (selectionChanged) {
			setInternalSelections(updatedInternalSelections)
		}
	}, [
		map,
		internalLineSources,
		lineSources,
		mapLoaded,
		popup,
		selections,
		internalSelections
	])

	useEffect(() => {
		if (!map || !mapLoaded) return
		if (internalPointSources !== pointSources) {
			console.log('Setting points in map!')
			if (internalPointSources) {
				for (const source of internalPointSources) {
					sourceClickEvents[`point:${source.name}`] = source.click
					const mapSource = map.getSource(`point:${source.name}`) as
						| GeoJSONSource
						| undefined
					if (mapSource !== undefined) {
						mapSource.setData({
							type: 'FeatureCollection',
							features: []
						})
					}
					map.removeLayer(`layer:point:${source.name}`)
				}
				// eslint-disable-next-line unicorn/no-useless-undefined
				setInternalPointSources(undefined)
			} else {
				for (const source of pointSources) {
					sourceClickEvents[`point:${source.name}`] = source.click
					let mapSource = map.getSource(`point:${source.name}`) as
						| GeoJSONSource
						| undefined
					const isNewLayer = mapSource === undefined
					if (isNewLayer) {
						map.addSource(`point:${source.name}`, {
							type: 'geojson',
							data: {
								type: 'FeatureCollection',
								features: []
							}
						})
						mapSource = map.getSource(`point:${source.name}`) as GeoJSONSource
					}
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					if (mapSource !== undefined) {
						mapSource.setData({
							type: 'FeatureCollection',
							features: source.points.map(point => ({
								type: 'Feature',
								properties: {
									description: `<strong>${point.name}</strong><p>${point.description}</p>`,
									index: point.index,
									name: point.name,
									selected: point.index !== selections[source.name]
								},
								geometry: {
									type: 'Point',
									coordinates: [point.longitude, point.latitude]
								}
							}))
						})
					}
					map.addLayer({
						id: `layer:point:${source.name}`,
						type: 'circle',
						source: `point:${source.name}`,
						paint: {
							'circle-color': [
								'case',
								['get', 'selected'],
								source.selectedColor,
								source.color
							],
							'circle-radius': source.radius,
							'circle-stroke-width': 1,
							'circle-stroke-color': '#ffffff'
						}
					})
					if (isNewLayer) {
						map.on('mouseenter', `layer:point:${source.name}`, event => {
							if (!event.features) return
							const feature = event.features[0]
							if (
								feature.geometry.type === 'Point' &&
								feature.properties &&
								typeof feature.properties.description === 'string'
							) {
								const coordinates = [...feature.geometry.coordinates] as [
									number,
									number
								]
								const { description } = feature.properties

								while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
									coordinates[0] +=
										event.lngLat.lng > coordinates[0] ? 360 : -360
								}

								popup.setLngLat(coordinates).setHTML(description).addTo(map)
							}
						})
						map.on('mouseleave', `layer:point:${source.name}`, () => {
							popup.remove()
						})
						map.on('click', `layer:point:${source.name}`, event => {
							const click = sourceClickEvents[`point:${source.name}`]
							if (!event.features || !click) return
							const feature = event.features[0]
							if (
								feature.properties &&
								typeof feature.properties.index === 'number' &&
								typeof feature.properties.name === 'string'
							) {
								const { index } = feature.properties
								click(index)
							}
						})
					}
				}
				setInternalPointSources(pointSources)
			}
		}
		const updatedInternalSelections = { ...internalSelections }
		let selectionChanged = false

		for (const sourcename of Object.keys(selections)) {
			if (selections[sourcename] !== internalSelections[sourcename]) {
				for (const source of pointSources) {
					if (source.name === sourcename) {
						selectionChanged = true
						updatedInternalSelections[sourcename] = selections[sourcename]
						const mapSource = map.getSource(`point:${source.name}`) as
							| GeoJSONSource
							| undefined
						if (mapSource) {
							const index = selections[sourcename]
							mapSource.setData({
								type: 'FeatureCollection',
								features: source.points.map(point => ({
									type: 'Feature',
									properties: {
										description: `<strong>${point.name}</strong><p>${point.description}</p>`,
										index: point.index,
										name: point.name,
										selected: point.index !== index
									},
									geometry: {
										type: 'Point',
										coordinates: [point.longitude, point.latitude]
									}
								}))
							})
						}
					}
				}
			}
		}

		if (selectionChanged) {
			setInternalSelections(updatedInternalSelections)
		}
	}, [
		map,
		internalPointSources,
		pointSources,
		mapLoaded,
		popup,
		selections,
		internalSelections
	])

	return <div data-testid='map' className='w-full h-full' ref={mapReference} />
}

export default MapElement
