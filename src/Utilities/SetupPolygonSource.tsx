import type { PolygonSource } from 'Components/Map/Sources'
import type { SegmentsDisplaySettings } from 'Components/SegmentsPanel'
import type { SelectionMode } from 'Selectors/SelectionMode'
import type { SegmentState } from 'State/Segment/State'
import { FaultDipProjection } from 'State/Segment/State'

export default function SetupPolygonSource(
	selectionMode: SelectionMode,
	segmentSettings: SegmentsDisplaySettings,
	segments: SegmentState,
	setPolygonSources: (sources: PolygonSource[]) => void
): void {
	const polygons: PolygonSource[] = []
	if (selectionMode !== 'normal' && selectionMode.mode === 'lasso') {
		polygons.push({
			name: 'selection_polygon',
			color: '#ffffff',
			borderColor: '#ffffff',
			borderRadius: 0.5,
			polygons: [
				{
					polygon: selectionMode.polygon,
					index: 0,
					name: '',
					description: ''
				}
			]
		})
	}
	if (!segmentSettings.hideProjection && !segmentSettings.hide) {
		polygons.push({
			name: 'fault_dip_projections',
			color: segmentSettings.projectionColor,
			borderColor: segmentSettings.projectionColor,
			borderRadius: 0.5,
			polygons: FaultDipProjection(segments).map((poly, index) => ({
				polygon: poly,
				index,
				name: '',
				description: ''
			}))
		})
	}
	setPolygonSources(polygons)
}
