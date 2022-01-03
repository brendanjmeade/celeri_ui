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
		selected?: boolean
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

const ARROW_ANGLE_1 = Math.PI / 6
const ARROW_ANGLE_2 = 2 * Math.PI - ARROW_ANGLE_1

function MapElement({
	pointSources,
	arrowSources
}: {
	pointSources: PointSource[]
	arrowSources: ArrowSource[]
}): ReactElement {
	const mapReference = useRef<HTMLDivElement>(null)

	const [map, setMap] = useState<Map>()
	const [mapLoaded, setMapLoaded] = useState(false)
	const [draw, setDraw] = useState<MapboxDraw>()
	const [popup] = useState<Popup>(
		new Popup({ closeButton: false, closeOnClick: false })
	)

	const [internalPointSources, setInternalPointSources] =
		useState<PointSource[]>()
	const [internalArrowSources, setInternalArrowSources] =
		useState<ArrowSource[]>()

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
			const innerDraw = new MapboxDraw({
				displayControlsDefault: false,
				controls: {
					line_string: true,
					trash: true
				},
				defaultMode: 'simple_select'
			})
			innerMap.addControl(innerDraw)
			setMap(innerMap)
			setDraw(innerDraw)
			innerMap.on('load', () => {
				setMapLoaded(true)
			})
		}
		console.log('Updating map...')
	}, [map, draw])

	useEffect(() => {
		console.log('Adding layers')
		if (map && mapLoaded && internalPointSources !== pointSources) {
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
					const selectedMapSource = map.getSource(
						`point:${source.name}:selected`
					) as GeoJSONSource | undefined
					if (selectedMapSource !== undefined) {
						selectedMapSource.setData({
							type: 'FeatureCollection',
							features: []
						})
					}
					map.removeLayer(`layer:point:${source.name}:selected`)
				}
				// eslint-disable-next-line unicorn/no-useless-undefined
				setInternalPointSources(undefined)
			} else {
				for (const source of pointSources) {
					let mapSource = map.getSource(`point:${source.name}`) as
						| GeoJSONSource
						| undefined
					let selectedMapSource = map.getSource(
						`point:${source.name}:selected`
					) as GeoJSONSource | undefined
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
						map.addSource(`point:${source.name}:selected`, {
							type: 'geojson',
							data: {
								type: 'FeatureCollection',
								features: []
							}
						})
						selectedMapSource = map.getSource(
							`point:${source.name}:selected`
						) as GeoJSONSource
					}
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					if (mapSource !== undefined && selectedMapSource !== undefined) {
						mapSource.setData({
							type: 'FeatureCollection',
							features: source.points
								.filter(point => !point.selected)
								.map(point => ({
									type: 'Feature',
									properties: {
										description: `<strong>${point.name}</strong><p>${point.description}</p>`,
										index: point.index,
										name: point.name
									},
									geometry: {
										type: 'Point',
										coordinates: [point.longitude, point.latitude]
									}
								}))
						})
						selectedMapSource.setData({
							type: 'FeatureCollection',
							features: source.points
								.filter(point => point.selected)
								.map(point => ({
									type: 'Feature',
									properties: {
										description: `<strong>${point.name}</strong><p>${point.description}</p>`,
										index: point.index,
										name: point.name
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
							'circle-color': source.color,
							'circle-radius': source.radius,
							'circle-stroke-width': 1,
							'circle-stroke-color': '#ffffff'
						}
					})
					map.addLayer({
						id: `layer:point:${source.name}:selected`,
						type: 'circle',
						source: `point:${source.name}:selected`,
						paint: {
							'circle-color': source.selectedColor,
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
	}, [map, internalPointSources, pointSources, mapLoaded, popup])

	useEffect(() => {
		console.log('Adding layers')
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
