import type { BlockDisplaySettings } from 'Components/BlockPanel'
import type { PointSource } from 'Components/Map/Sources'
import type { VerticesDisplaySettings } from 'Components/VertexPanel'
import type { SelectionMode } from 'Selectors/SelectionMode'
import type { BlockState } from 'State/Block/State'
import type { SegmentState } from 'State/Segment/State'
import { EditMode } from './EditMode'

export default function SetupPointSources({
	editMode,
	blockSettings,
	blocks,
	select,
	vertexSettings,
	segments,
	selectionMode,
	setPointSources
}: {
	editMode: EditMode
	blockSettings: BlockDisplaySettings
	blocks: BlockState
	select: { select: (type: string, indices: number[]) => void }
	vertexSettings: VerticesDisplaySettings
	segments: SegmentState
	selectionMode: SelectionMode
	setPointSources: (sources: PointSource[]) => void
}): void {
	const sources: PointSource[] = []
	if (editMode !== EditMode.Block && !blockSettings.hide) {
		sources.push({
			name: 'blocks',
			color: blockSettings.color,
			selectedColor: blockSettings.selectedColor,
			radius: blockSettings.radius,
			points: blocks.map((block, index) => ({
				longitude: block.interior_lon,
				latitude: block.interior_lat,
				name: block.name,
				description: ``,
				index,
				label:
					blockSettings.plottableKey in block
						? `${
								(block as unknown as Record<string, number | string>)[
									blockSettings.plottableKey
								]
						  }`
						: ``
			})),
			click: (index): void => {
				select.select('block', [index])
			}
		})
	}
	if (editMode !== EditMode.Vertex && !vertexSettings.hide) {
		sources.push({
			name: 'vertices',
			color: vertexSettings.color,
			selectedColor: vertexSettings.activeColor,
			radius: vertexSettings.radius,
			click: (index): void => {
				select.select('vertex', [index])
			},
			points: Object.keys(segments.vertecies)
				.map(v => {
					const index = Number.parseInt(v, 10)
					const vert = segments.vertecies[index]
					if (vert) {
						return {
							longitude: vert.lon,
							latitude: vert.lat,
							index,
							name: '',
							description: ''
						}
					}
					return false
				})
				.filter(v => !!v) as unknown as {
				longitude: number
				latitude: number
				index: number
				name: ''
				description: ''
			}[]
		})
	}
	if (selectionMode !== 'normal' && selectionMode.mode === 'lasso') {
		sources.push({
			name: 'selection',
			color: '#fff',
			selectedColor: '#fff',
			radius: 1.5,
			points: selectionMode.polygon.map((point, index) => ({
				longitude: point.lon,
				latitude: point.lat,
				name: '',
				description: ``,
				index
			}))
		})
	}
	setPointSources(sources)
}
