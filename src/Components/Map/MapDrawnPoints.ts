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
		internalDrawnPointSource,
		internalSelections
	}: MapState,
	{ drawnPointSource, selections }: MapProperties
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
								'circle-color': drawnPointSource.selectedColor,
								'circle-stroke-width': 2,
								'circle-stroke-color': '#ffffff'
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
								'circle-color': drawnPointSource.color,
								'circle-stroke-width': 1,
								'circle-stroke-color': '#ffffff'
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
			let selection =
				drawnPointSource.points.length !== data.features.length
					? undefined
					: localDraw
							.getSelected()
							.features.map(point => (point.properties?.index as number) ?? -1)
							.filter(v => v > -1)
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
			if (internalSelections.draw !== selections.draw) {
				selection = selections.draw
				setState({
					internalSelections: { ...internalSelections, draw: selections.draw }
				})
			}
			if (selection && selection.length > 0) {
				localDraw.changeMode('simple_select', {
					featureIds: selection.map(index => `${index}`)
				})
			}
		}
	}
	if (draw && internalSelections.draw !== selections.draw) {
		const selection = selections.draw ?? []
		setState({
			internalSelections: { ...internalSelections, draw: selections.draw }
		})
		draw.changeMode('simple_select', {
			featureIds: selection.map(index => `${index}`)
		})
	}
}
