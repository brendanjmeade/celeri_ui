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
	points: {
		longitude: number
		latitude: number
		name: string
		description: string
	}[]
	clickPoint?: (index: number, name: string) => void
}

function MapElement({
	pointSources
}: {
	pointSources: PointSource[]
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
			const innerDraw = new MapboxDraw({})
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
							features: source.points.map((point, index) => ({
								type: 'Feature',
								properties: {
									description: `<strong>${point.name}</strong><p>${point.description}</p>`,
									index,
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
							'circle-radius': 6,
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
	return <div data-testid='map' className='w-full h-full' ref={mapReference} />
}

export default MapElement
