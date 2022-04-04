/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { GeoJSONSource } from 'mapbox-gl'
import type { CeleriMap, MapProperties, MapState } from './CeleriMap'

export default function MapLineSegments(
	celeriMap: CeleriMap,
	setState: (state: Partial<MapState>) => void,
	{ map, popup, internalLineSources, mapLoaded, internalSelections }: MapState,
	{ lineSources, selections }: MapProperties
): void {
	if (map && mapLoaded && internalLineSources !== lineSources) {
		console.log('Setting lines in map!')
		if (internalLineSources) {
			for (const source of internalLineSources) {
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
				try {
					map.removeLayer(`layer:line:${source.name}:click`)
				} catch {
					console.log('no click layer')
				}
				try {
					map.removeLayer(`layer:line:${source.name}:labels`)
				} catch {
					console.log('no label layer')
				}
			}
			setState({ internalLineSources: undefined })
		} else {
			for (const source of lineSources) {
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

					map.addSource(`line:${source.name}:points`, {
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
								description:
									line.name || line.description
										? `<strong>${line.name}</strong><p>${line.description}</p>`
										: '',
								index: line.index,
								name: line.name,
								label: line.label ?? '',
								selected: selections[source.name]?.includes(line.index) || false
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
				if (source.lines[0]?.label) {
					const pointSource = map.getSource(`line:${source.name}:points`) as
						| GeoJSONSource
						| undefined
					if (pointSource) {
						pointSource.setData({
							type: 'FeatureCollection',
							features: source.lines.map(line => ({
								type: 'Feature',
								properties: {
									label: line.label
								},
								geometry: {
									type: 'Point',
									coordinates: [
										(line.startLongitude + line.endLongitude) / 2,
										(line.startLatitude + line.endLatitude) / 2
									]
								}
							}))
						})
						map.addLayer({
							id: `layer:line:${source.name}:labels`,
							type: 'symbol',
							source: `line:${source.name}:points`,
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
				if (source.click) {
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
								typeof feature.properties.description === 'string' &&
								feature.properties.description
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
							let currentClick: ((index: number) => void) | undefined
							if (celeriMap.state.internalLineSources) {
								for (const layer of celeriMap.state.internalLineSources) {
									if (layer.name === source.name) {
										currentClick = layer.click
									}
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
			}
			setState({ internalLineSources: lineSources })
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
						const indices = selections[sourcename]
						mapSource.setData({
							type: 'FeatureCollection',
							features: source.lines.map(line => ({
								type: 'Feature',
								properties: {
									description: `<strong>${line.name}</strong><p>${line.description}</p>`,
									index: line.index,
									name: line.name,
									selected: indices?.includes(line.index)
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
		setState({ internalSelections: updatedInternalSelections })
	}
}
