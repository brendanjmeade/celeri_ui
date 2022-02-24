/* eslint-disable @typescript-eslint/no-magic-numbers */
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import type { MapProperties, MapState } from './CeleriMap'

export default function MapDrawnPoints(
	setState: (state: Partial<MapState>) => void,
	{
		map,
		draw,
		drawnPointSettings,
		mapLoaded,
		internalDrawnPointSource
	}: MapState,
	{ drawnPointSource }: MapProperties
): void {
	if (map && mapLoaded && internalDrawnPointSource !== drawnPointSource) {
		console.log('Drawning Points')
		setState({ internalDrawnPointSource: drawnPointSource })
		let localDraw: MapboxDraw | undefined = draw
		if (
			drawnPointSource.selectedColor !== drawnPointSettings.selectedColor ||
			drawnPointSource.selectedRadius !== drawnPointSettings.selectedRadius ||
			drawnPointSource.color !== drawnPointSettings.color ||
			drawnPointSource.radius !== drawnPointSettings.radius
		) {
			setState({
				drawnPointSettings: {
					color: drawnPointSource.color,
					radius: drawnPointSource.radius,
					selectedRadius: drawnPointSource.selectedRadius,
					selectedColor: drawnPointSource.selectedColor
				}
			})
			if (draw) {
				map.removeControl(draw)
				localDraw = undefined
			}
			if (drawnPointSource) {
				localDraw = new MapboxDraw({
					displayControlsDefault: false,
					defaultMode: 'simple_select',
					styles: [
						{
							id: 'highlight-active-points',
							type: 'circle',
							filter: [
								'all',
								['==', '$type', 'Point'],
								['==', 'meta', 'feature'],
								['==', 'active', 'true']
							],
							paint: {
								'circle-radius': drawnPointSource.selectedRadius,
								'circle-color': drawnPointSource.selectedColor
							}
						},
						{
							id: 'points',
							type: 'circle',
							filter: [
								'all',
								['==', '$type', 'Point'],
								['==', 'meta', 'feature'],
								['==', 'active', 'false']
							],
							paint: {
								'circle-radius': drawnPointSource.radius,
								'circle-color': drawnPointSource.color
							}
						}
					]
				})
				map.addControl(localDraw)
				setState({ draw: localDraw })
			} else {
				localDraw = undefined
			}
		}
		if (localDraw) {
			const data = localDraw.getAll()
			const selection =
				drawnPointSource.points.length !== data.features.length
					? undefined
					: localDraw.getSelected()
			const updatedFeatures: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
				type: 'FeatureCollection',
				features: drawnPointSource.points.map(point => ({
					type: 'Feature',
					id: point.index.toString(),
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
			}
			localDraw.set(updatedFeatures)
			if (
				selection &&
				selection.features.length > 0 &&
				selection.features[0].properties &&
				typeof selection.features[0].properties.index === 'number'
			) {
				const featureId = selection.features[0].id as string
				if (featureId) {
					localDraw.changeMode('simple_select', {
						featureIds: [featureId]
					})
				}
			}
		}
	}
}
