/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { GeoJSONSource } from 'mapbox-gl'
import type { CeleriMap, MapProperties, MapState } from './CeleriMap'

const GRID_SOURCE = `grid`

export default function MapGrid(
	celeriMap: CeleriMap,
	setState: (state: Partial<MapState>) => void,
	{ map, internalGridDisplay, popup, mapLoaded }: MapState,
	{ displayGrid }: MapProperties
): void {
	if (map && mapLoaded && internalGridDisplay !== displayGrid) {
		console.log('Drawing Grid on map!')
		if (internalGridDisplay && internalGridDisplay > 0) {
			const mapSource = map.getSource(GRID_SOURCE) as GeoJSONSource | undefined
			if (mapSource !== undefined) {
				mapSource.setData({
					type: 'FeatureCollection',
					features: []
				})
			}
			map.removeLayer(GRID_SOURCE)
			setState({ internalGridDisplay: undefined })
		} else if (displayGrid && displayGrid > 0) {
			let mapSource = map.getSource(GRID_SOURCE) as GeoJSONSource | undefined
			const isNewLayer = mapSource === undefined
			if (isNewLayer) {
				map.addSource(GRID_SOURCE, {
					type: 'geojson',
					data: {
						type: 'FeatureCollection',
						features: []
					}
				})
				mapSource = map.getSource(GRID_SOURCE) as GeoJSONSource
			}
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (mapSource !== undefined) {
				const features: {
					type: 'Feature'
					properties: { label: string }
					geometry: {
						type: 'LineString'
						coordinates: [[number, number], [number, number]]
					}
				}[] = []
				for (let lon = -170; lon <= 180; lon += displayGrid) {
					features.push({
						type: 'Feature',
						properties: { label: `Lon: ${lon < 0 ? lon + 360 : lon}` },
						geometry: {
							type: 'LineString',
							coordinates: [
								[lon, -90],
								[lon, 90]
							]
						}
					})
				}
				for (let lat = -90; lat <= 90; lat += displayGrid) {
					features.push({
						type: 'Feature',
						properties: { label: `Lat: ${lat}` },
						geometry: {
							type: 'LineString',
							coordinates: [
								[180, lat],
								[-180, lat]
							]
						}
					})
				}
				mapSource.setData({
					type: 'FeatureCollection',
					features
				})
			}
			map.addLayer({
				id: GRID_SOURCE,
				type: 'line',
				source: GRID_SOURCE,
				layout: {
					'line-cap': 'round',
					'line-join': 'miter'
				},
				paint: {
					'line-color': 'rgba(0,0,0,0.2)',
					'line-width': 1
				}
			})
			map.addLayer({
				id: `${GRID_SOURCE}:click`,
				type: 'line',
				source: GRID_SOURCE,
				layout: {
					'line-cap': 'round',
					'line-join': 'miter'
				},
				paint: {
					'line-color': 'rgba(0,0,0,0.01)',
					'line-width': 5
				}
			})
			if (isNewLayer) {
				map.on('mouseenter', `${GRID_SOURCE}:click`, event => {
					if (!event.features) return
					const feature = event.features[0]
					if (
						feature.geometry.type === 'LineString' &&
						feature.properties &&
						typeof feature.properties.label === 'string'
					) {
						popup
							.setLngLat(event.lngLat)
							.setHTML(`${feature.properties.label}`)
							.addTo(map)
					}
				})
				map.on('mouseleave', `${GRID_SOURCE}:click`, () => {
					popup.remove()
				})
			}
		}
		setState({ internalGridDisplay: displayGrid })
	}
}
