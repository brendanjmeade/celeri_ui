import type { BlockDisplaySettings } from 'Components/BlockPanel'
import type { DrawnPointSource } from 'Components/Map/Sources'
import type { VelocitiesDisplaySettings } from 'Components/VelocitiesPanel'
import type { VerticesDisplaySettings } from 'Components/VertexPanel'
import type { BlockState } from 'State/Block/State'
import { moveBlock } from 'State/Block/State'
import type { SegmentState } from 'State/Segment/State'
import { moveVertex } from 'State/Segment/State'
import type { AppDispatch } from 'State/State'
import type { VelocityState } from 'State/Velocity/State'
import { moveVelocity } from 'State/Velocity/State'
import { EditMode } from './EditMode'

export default function SetupDrawnPointSource({
	editMode,
	setDrawnPointSource,
	vertexSettings,
	segments,
	dispatch,
	select,
	blockSettings,
	blocks,
	velocitiesSettings,
	velocities
}: {
	editMode: EditMode
	setDrawnPointSource: (source: DrawnPointSource) => void
	vertexSettings: VerticesDisplaySettings
	segments: SegmentState
	dispatch: AppDispatch
	select: { select: (type: string, indices: number[]) => void }
	blockSettings: BlockDisplaySettings
	blocks: BlockState
	velocitiesSettings: VelocitiesDisplaySettings
	velocities: VelocityState
}): void {
	switch (editMode) {
		case EditMode.Vertex: {
			setDrawnPointSource({
				color: vertexSettings.color,
				radius: vertexSettings.radius,
				selectedColor: vertexSettings.activeColor,
				selectedRadius: vertexSettings.activeRadius,
				points: vertexSettings.hide
					? []
					: (Object.keys(segments.vertecies)
							.map(v => {
								const index = Number.parseInt(v, 10)
								const vert = segments.vertecies[index]
								if (vert) {
									return {
										longitude: vert.lon,
										latitude: vert.lat,
										index
									}
								}
								return false
							})
							.filter(v => !!v) as unknown as {
							longitude: number
							latitude: number
							index: number
					  }[]),
				update: (index, vertex) => {
					dispatch(moveVertex({ index, vertex }))
				},
				select: index => {
					select.select('vertex', index)
				}
			})

			break
		}
		case EditMode.Block: {
			setDrawnPointSource({
				color: blockSettings.color,
				radius: blockSettings.radius,
				selectedColor: blockSettings.selectedColor,
				selectedRadius: blockSettings.radius,
				points: blockSettings.hide
					? []
					: blocks.map((block, index) => ({
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
				update: (index, vertex) => {
					dispatch(moveBlock({ index, position: vertex }))
				},
				select: index => {
					select.select('block', index)
				}
			})

			break
		}
		case EditMode.Velocity: {
			setDrawnPointSource({
				color: velocitiesSettings.color,
				radius: velocitiesSettings.width,
				selectedColor: velocitiesSettings.selectedColor,
				selectedRadius: velocitiesSettings.width,
				points: velocitiesSettings.hide
					? []
					: velocities.map((velocity, index) => ({
							longitude: velocity.lon,
							latitude: velocity.lat,
							name: velocity.name,
							description: ``,
							index
					  })),
				update: (index, vertex) => {
					dispatch(moveVelocity({ index, position: vertex }))
				},
				select: index => {
					select.select('velocities', index)
				}
			})

			break
		}
		default:
			break
	}
}
