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
		const updatedDrawnPointSource = drawnPointSource
		setState({ internalDrawnPointSource: updatedDrawnPointSource })
		let localDraw = draw
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
}
