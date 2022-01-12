/* eslint-disable @typescript-eslint/no-magic-numbers */
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import type { GeoJSONSource } from 'mapbox-gl'
import mapboxgl, { Map, NavigationControl, Popup } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { ReactElement } from 'react'
import { useEffect, useRef, useState } from 'react'

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
	clickPoint?: (index: number, name: string) => void
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
	clickArrow?: (index: number, name: string) => void
}

export interface DrawnLineSource {
	color: string
	activeColor: string
	width: number
	activeWidth: number
	active: boolean
	lines: {
		startLongitude: number
		startLatitude: number
		endLongitude: number
		endLatitude: number
		name: string
		description: string
		index: number
	}[]
	clickLine?: (index: number) => void
	createLine?: (coordinates: { lat: number; lon: number }[]) => void
	updateLine?: (
		index: number,
		coordinates: { lat: number; lon: number }[]
	) => void
}

const ARROW_ANGLE_1 = Math.PI / 6
const ARROW_ANGLE_2 = 2 * Math.PI - ARROW_ANGLE_1

function MapElement({
	pointSources,
	arrowSources,
	drawnLineSource,
	selections
}: {
	pointSources: PointSource[]
	arrowSources: ArrowSource[]
	drawnLineSource: DrawnLineSource
	selections: Record<string, number>
}): ReactElement {
	const mapReference = useRef<HTMLDivElement>(null)

	const [map, setMap] = useState<Map>()
	const [mapLoaded, setMapLoaded] = useState(false)
	const [draw, setDraw] = useState<MapboxDraw>()
	const [popup] = useState<Popup>(
		new Popup({ closeButton: false, closeOnClick: false })
	)

	const [drawLineSettings, setDrawLineSettings] = useState({
		color: drawnLineSource.color,
		width: drawnLineSource.activeWidth,
		activeWidth: drawnLineSource.activeWidth,
		activeColor: drawnLineSource.activeColor,
		active: drawnLineSource.active
	})

	const [internalPointSources, setInternalPointSources] =
		useState<PointSource[]>()
	const [internalArrowSources, setInternalArrowSources] =
		useState<ArrowSource[]>()
	const [internalDrawLineSource, setInternalDrawnLineSource] = useState<{
		source?: DrawnLineSource
	}>({})

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
				({ features }: { features: mapboxgl.MapboxGeoJSONFeature[] }) => {
					if (!internalDrawLineSource.source?.clickLine) return
					let selected = -1
					for (const feature of features) {
						if (
							feature.geometry.type === 'LineString' &&
							feature.properties &&
							'index' in feature.properties &&
							typeof feature.properties.index === 'number'
						) {
							selected = feature.properties.index
							draw?.changeMode('direct_select', {
								featureId: feature.id as string
							})
							break
						}
					}
					internalDrawLineSource.source.clickLine(selected)
				}
			)
			innerMap.on(
				'draw.create',
				({ features }: { features: mapboxgl.MapboxGeoJSONFeature[] }) => {
					console.log('CREATING LINE')
					if (!internalDrawLineSource.source?.createLine) return
					const coordinates: { lat: number; lon: number }[] = []
					for (const feature of features) {
						if (feature.geometry.type === 'LineString') {
							for (const point of feature.geometry.coordinates) {
								coordinates.push({ lon: point[0], lat: point[1] })
							}
						}
					}
					if (coordinates.length > 1) {
						internalDrawLineSource.source.createLine(coordinates)
					}
				}
			)
			innerMap.on(
				'draw.update',
				({
					features
				}: {
					features: mapboxgl.MapboxGeoJSONFeature[]
					action: 'change_coordinates' | 'move'
				}) => {
					console.log('UPDATING LINE')
					if (!internalDrawLineSource.source?.updateLine) return
					console.log('Got the function')
					const coordinates: { lat: number; lon: number }[] = []
					let selected = -1
					for (const feature of features) {
						if (
							feature.geometry.type === 'LineString' &&
							feature.properties &&
							'index' in feature.properties &&
							typeof feature.properties.index === 'number'
						) {
							console.log('Found the feature')
							selected = feature.properties.index
							for (const point of feature.geometry.coordinates) {
								coordinates.push({ lon: point[0], lat: point[1] })
							}
							break
						}
					}
					console.log('will call update function')
					if (coordinates.length > 1 && selected > -1) {
						console.log('Calling update function')
						internalDrawLineSource.source.updateLine(selected, coordinates)
					}
				}
			)
		}
		console.log('Updating map...')
	}, [draw, internalDrawLineSource, map])

	useEffect(() => {
		if (map && mapLoaded && internalDrawLineSource.source !== drawnLineSource) {
			console.log('Drawning lines')
			internalDrawLineSource.source = drawnLineSource
			setInternalDrawnLineSource(internalDrawLineSource)
			let localDraw = draw
			if (
				drawnLineSource.activeColor !== drawLineSettings.activeColor ||
				drawnLineSource.activeWidth !== drawLineSettings.activeWidth ||
				drawnLineSource.color !== drawLineSettings.color ||
				drawnLineSource.width !== drawLineSettings.width
			) {
				setDrawLineSettings({
					color: drawnLineSource.color,
					width: drawnLineSource.activeWidth,
					activeWidth: drawnLineSource.activeWidth,
					activeColor: drawnLineSource.activeColor,
					active: drawnLineSource.active
				})
				if (draw) {
					map.removeControl(draw)
				}
				if (drawnLineSource.active) {
					localDraw = new MapboxDraw({
						displayControlsDefault: false,
						controls: {
							line_string: true
						},
						defaultMode: 'simple_select',
						styles: [
							{
								id: 'gl-draw-polygon-midpoint',
								type: 'circle',
								filter: [
									'all',
									['==', '$type', 'Point'],
									['==', 'meta', 'midpoint']
								],
								paint: {
									'circle-radius': 2 * drawnLineSource.activeWidth,
									'circle-color': drawnLineSource.activeColor
								}
							},
							{
								id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
								type: 'circle',
								filter: [
									'all',
									['==', 'meta', 'vertex'],
									['==', '$type', 'Point'],
									['!=', 'mode', 'static']
								],
								paint: {
									'circle-radius': 3 * drawnLineSource.activeWidth + 2,
									'circle-color': '#fff'
								}
							},
							{
								id: 'gl-draw-polygon-and-line-vertex-inactive',
								type: 'circle',
								filter: [
									'all',
									['==', 'meta', 'vertex'],
									['==', '$type', 'Point'],
									['!=', 'mode', 'static']
								],
								paint: {
									'circle-radius': 3 * drawnLineSource.activeWidth,
									'circle-color': drawnLineSource.activeColor
								}
							},
							{
								id: 'gl-draw-line-active',
								type: 'line',
								filter: [
									'all',
									['==', '$type', 'LineString'],
									['==', 'active', 'true']
								],
								layout: {
									'line-cap': 'round',
									'line-join': 'round'
								},
								paint: {
									'line-color': drawnLineSource.activeColor,
									'line-dasharray': [0.2, 2],
									'line-width': drawnLineSource.activeWidth
								}
							},
							{
								id: 'gl-draw-line-inactive',
								type: 'line',
								filter: [
									'all',
									['==', 'active', 'false'],
									['==', '$type', 'LineString'],
									['!=', 'mode', 'static']
								],
								layout: {
									'line-cap': 'round',
									'line-join': 'round'
								},
								paint: {
									'line-color': [
										'case',
										['==', ['get', 'selected'], 1],
										drawnLineSource.activeColor,
										drawnLineSource.color
									],
									'line-width': drawnLineSource.width
								}
							},
							{
								id: 'gl-draw-line-static',
								type: 'line',
								filter: [
									'all',
									['==', 'mode', 'static'],
									['==', '$type', 'LineString']
								],
								layout: {
									'line-cap': 'round',
									'line-join': 'round'
								},
								paint: {
									'line-color': [
										'case',
										['==', ['get', 'selected'], 1],
										drawnLineSource.activeColor,
										drawnLineSource.color
									],
									'line-width': drawnLineSource.width
								}
							}
						]
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
					features: drawnLineSource.lines.flatMap(line => [
						{
							type: 'Feature',
							properties: {
								name: line.name,
								index: line.index,
								selected: selections.drawnLine === line.index
							},
							id: line.index,
							geometry: {
								type: 'LineString',
								coordinates: [
									[line.startLongitude, line.startLatitude],
									[line.endLongitude, line.endLatitude]
								]
							}
						}
					])
				})
			}
		}
	}, [
		map,
		mapLoaded,
		internalDrawLineSource,
		drawnLineSource,
		drawLineSettings,
		draw,
		selections.drawnLine
	])

	useEffect(() => {
		if (!map || !mapLoaded) return
		if (internalPointSources !== pointSources) {
			console.log('Setting points in map!')
			if (internalPointSources) {
				for (const source of internalPointSources) {
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
							if (!event.features || !source.clickPoint) return
							const feature = event.features[0]
							if (
								feature.properties &&
								typeof feature.properties.index === 'number' &&
								typeof feature.properties.name === 'string'
							) {
								const { index, name } = feature.properties
								source.clickPoint(index, name)
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

	useEffect(() => {
		if (map && mapLoaded && internalArrowSources !== arrowSources) {
			console.log('Setting arrows in map!')
			if (internalArrowSources) {
				for (const source of internalArrowSources) {
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
				}
				// eslint-disable-next-line unicorn/no-useless-undefined
				setInternalArrowSources(undefined)
			} else {
				for (const source of arrowSources) {
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
					if (isNewLayer) {
						map.on('mouseenter', `layer:arrow:${source.name}`, event => {
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
						map.on('mouseleave', `layer:arrow:${source.name}`, () => {
							popup.remove()
						})
						map.on('click', `layer:arrow:${source.name}`, event => {
							if (!event.features || !source.clickArrow) return
							const feature = event.features[0]
							if (
								feature.properties &&
								typeof feature.properties.index === 'number' &&
								typeof feature.properties.name === 'string'
							) {
								const { index, name } = feature.properties
								source.clickArrow(index, name)
							}
						})
					}
				}
				setInternalArrowSources(arrowSources)
			}
		}
	}, [map, internalArrowSources, arrowSources, mapLoaded, popup])

	return <div data-testid='map' className='w-full h-full' ref={mapReference} />
}

export default MapElement
