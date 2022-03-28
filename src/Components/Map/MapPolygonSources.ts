/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { GeoJSONSource } from 'mapbox-gl'
import type { CeleriMap, MapProperties, MapState } from './CeleriMap'

export default function MapPolygonSources(
	celeriMap: CeleriMap,
	setState: (state: Partial<MapState>) => void,
	{ map, internalPolygonSources, mapLoaded }: MapState,
	{ polygonSources, selections }: MapProperties
): void {
	if (map && mapLoaded && internalPolygonSources !== polygonSources) {
		if (internalPolygonSources) {
			for (const source of internalPolygonSources) {
				const mapSource = map.getSource(`poly:${source.name}`) as
					| GeoJSONSource
					| undefined
				if (mapSource !== undefined) {
					mapSource.setData({
						type: 'FeatureCollection',
						features: []
					})
				}
				map.removeLayer(`layer:poly:${source.name}`)
				map.removeLayer(`layer:poly:${source.name}:fill`)
			}
			setState({ internalPolygonSources: undefined })
		} else {
			for (const source of polygonSources) {
				let mapSource = map.getSource(`poly:${source.name}`) as
					| GeoJSONSource
					| undefined
				const isNewLayer = mapSource === undefined
				if (isNewLayer) {
					map.addSource(`poly:${source.name}`, {
						type: 'geojson',
						data: {
							type: 'FeatureCollection',
							features: []
						}
					})
					mapSource = map.getSource(`poly:${source.name}`) as GeoJSONSource
				}
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (mapSource !== undefined) {
					mapSource.setData({
						type: 'FeatureCollection',
						features: source.polygons.map(line => ({
							type: 'Feature',
							properties: {
								description:
									line.name || line.description
										? `<strong>${line.name}</strong><p>${line.description}</p>`
										: '',
								index: line.index,
								name: line.name,
								selected: selections[source.name]?.includes(line.index) || false
							},
							geometry: {
								type: 'Polygon',
								coordinates: [line.polygon.map(p => [p.lon, p.lat])]
							}
						}))
					})
				}
				map.addLayer({
					id: `layer:poly:${source.name}:fill`,
					type: 'fill',
					source: `poly:${source.name}`,
					layout: {},
					paint: {
						'fill-color': source.color,
						'fill-opacity': 0.5
					}
				})
				map.addLayer({
					id: `layer:poly:${source.name}`,
					type: 'line',
					source: `poly:${source.name}`,
					layout: {
						'line-cap': 'round',
						'line-join': 'miter'
					},
					paint: {
						'line-color': source.borderColor,
						'line-width': source.borderRadius
					}
				})
			}
			setState({ internalPolygonSources: polygonSources })
		}
	}
}
