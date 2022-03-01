/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { GeoJSONSource } from 'mapbox-gl'
import type { CeleriMap, MapProperties, MapState } from './CeleriMap'

export default function MapPoints(
	celeriMap: CeleriMap,
	setState: (state: Partial<MapState>) => void,
	{ map, popup, internalPointSources, mapLoaded, internalSelections }: MapState,
	{ pointSources, selections }: MapProperties
): void {
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
			setState({ internalPointSources: undefined })
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
								description:
									point.name || point.description
										? `<strong>${point.name}</strong><p>${point.description}</p>`
										: '',
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
							source.color,
							source.selectedColor
						],
						'circle-radius': source.radius
					}
				})
				if (isNewLayer) {
					map.on('mouseenter', `layer:point:${source.name}`, event => {
						if (!event.features) return
						const feature = event.features[0]
						if (
							feature.geometry.type === 'Point' &&
							feature.properties &&
							typeof feature.properties.description === 'string' &&
							feature.properties.description
						) {
							const coordinates = [...feature.geometry.coordinates] as [
								number,
								number
							]
							const { description } = feature.properties

							while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
								coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360
							}

							popup.setLngLat(coordinates).setHTML(description).addTo(map)
						}
					})
					map.on('mouseleave', `layer:point:${source.name}`, () => {
						popup.remove()
					})
					map.on('click', `layer:point:${source.name}`, event => {
						let currentClick: ((index: number) => void) | undefined
						if (celeriMap.state.internalPointSources) {
							for (const layer of celeriMap.state.internalPointSources) {
								currentClick = layer.click
							}
						}
						if (!event.features || !currentClick) return
						const feature = event.features[0]
						if (
							feature.properties &&
							typeof feature.properties.index === 'number' &&
							typeof feature.properties.name === 'string'
						) {
							const { index } = feature.properties
							currentClick(index)
						}
					})
				}
			}
			setState({ internalPointSources: pointSources })
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
		setState({ internalSelections: updatedInternalSelections })
	}
}
