/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { GeoJSONSource } from 'mapbox-gl'
import type { CeleriMap, MapProperties, MapState } from './CeleriMap'

const ARROW_ANGLE_1 = Math.PI / 6
const ARROW_ANGLE_2 = 2 * Math.PI - ARROW_ANGLE_1

export default function MapArrows(
	celeriMap: CeleriMap,
	setState: (state: Partial<MapState>) => void,
	{ map, popup, internalArrowSources, mapLoaded, internalSelections }: MapState,
	{ arrowSources, selections }: MapProperties
): void {
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
				map.removeLayer(`layer:arrow:${source.name}:click`)
				try {
					const layer = map.getLayer(`layer:arrow:${source.name}:labels`)
					if (layer) {
						map.removeLayer(`layer:arrow:${source.name}:labels`)
					}
				} catch {
					console.log('no label layer')
				}
			}
			// eslint-disable-next-line unicorn/no-useless-undefined
			setState({ internalArrowSources: undefined })
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
					map.addSource(`arrow:${source.name}:points`, {
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
						features: source.arrows.map(arrow => {
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
									description:
										arrow.name || arrow.description
											? `<strong>${arrow.name}</strong><p>${arrow.description}</p>`
											: '',
									index: arrow.index,
									name: arrow.name,
									selected: selections[source.name]?.includes(arrow.index)
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
						'line-color': [
							'case',
							['get', 'selected'],
							source.selectedColor,
							source.color
						],
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
						'line-width': 10
					}
				})

				if (source.arrows[0]?.label) {
					const pointSource = map.getSource(`arrow:${source.name}:points`) as
						| GeoJSONSource
						| undefined
					if (pointSource) {
						pointSource.setData({
							type: 'FeatureCollection',
							features: source.arrows.map(arrow => ({
								type: 'Feature',
								properties: {
									label: arrow.label
								},
								geometry: {
									type: 'Point',
									coordinates: [arrow.longitude, arrow.latitude]
								}
							}))
						})
						map.addLayer({
							id: `layer:arrow:${source.name}:labels`,
							type: 'symbol',
							source: `arrow:${source.name}:points`,
							layout: {
								'symbol-placement': 'point',
								'text-anchor': 'center',
								'text-field': ['get', 'label'],
								'text-justify': 'center',
								'text-size': 10,
								'symbol-z-order': 'source',
								'symbol-sort-key': 10
							},
							paint: {
								'text-halo-color': 'rgba(255,255,255,255)',
								'text-halo-width': 1,
								'text-color': '#000'
							}
						})
					}
				}
				if (isNewLayer) {
					map.on('mouseenter', `layer:arrow:${source.name}:click`, event => {
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
					map.on('mouseleave', `layer:arrow:${source.name}:click`, () => {
						popup.remove()
					})
					map.on('click', `layer:arrow:${source.name}:click`, event => {
						let currentClick: ((index: number) => void) | undefined
						if (celeriMap.state.internalArrowSources) {
							for (const layer of celeriMap.state.internalArrowSources) {
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

			setState({ internalArrowSources: arrowSources })
		}
	}

	const updatedInternalSelections = { ...internalSelections }
	let selectionChanged = false

	for (const sourcename of Object.keys(selections)) {
		if (selections[sourcename] !== internalSelections[sourcename]) {
			for (const source of arrowSources) {
				if (source.name === sourcename) {
					selectionChanged = true
					updatedInternalSelections[sourcename] = selections[sourcename]
					const mapSource = map?.getSource(`arrow:${source.name}`) as
						| GeoJSONSource
						| undefined
					if (mapSource) {
						const indices = selections[sourcename]
						mapSource.setData({
							type: 'FeatureCollection',
							features: source.arrows.map(arrow => {
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
										index: arrow.index,
										name: arrow.name,
										selected: indices?.includes(arrow.index)
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
				}
			}
		}
	}

	if (selectionChanged) {
		setState({ internalSelections: updatedInternalSelections })
	}
}
