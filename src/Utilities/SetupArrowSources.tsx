import type { ArrowSource } from 'Components/Map/Sources'
import type { VelocitiesDisplaySettings } from 'Components/VelocitiesPanel'
import type { VelocityState } from 'State/Velocity/State'

export default function SetupArrowSources({
	velocitiesSettings,
	setArrowSources,
	velocities,
	select
}: {
	velocitiesSettings: VelocitiesDisplaySettings
	setArrowSources: (sources: ArrowSource[]) => void
	velocities: VelocityState
	select: { select: (type: string, indices: number[]) => void }
}): void {
	if (velocitiesSettings.hide) {
		setArrowSources([])
	} else {
		setArrowSources([
			{
				name: 'velocities',
				color: velocitiesSettings.color,
				selectedColor: velocitiesSettings.selectedColor,
				scale: velocitiesSettings.scale,
				arrowHeadScale: velocitiesSettings.arrowHead,
				width: velocitiesSettings.width,
				arrows: velocities.map((velocity, index) => {
					const scale = Math.sqrt(
						velocity.east_vel * velocity.east_vel +
							velocity.north_vel * velocity.north_vel
					)
					return {
						longitude: velocity.lon,
						latitude: velocity.lat,
						direction: [velocity.east_vel / scale, velocity.north_vel / scale],
						scale,
						name: velocity.name,
						description: `north: ${velocity.north_vel}, east: ${velocity.east_vel}`,
						index,
						label:
							velocitiesSettings.plottableKey in velocity
								? `${
										(velocity as unknown as Record<string, number | string>)[
											velocitiesSettings.plottableKey
										]
								  }`
								: ``
					}
				}),
				click: (index): void => {
					select.select('velocities', [index])
				}
			}
		])
	}
}
