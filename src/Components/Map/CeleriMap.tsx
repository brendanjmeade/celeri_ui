/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable react-prefer-function-component/react-prefer-function-component */
import type MapboxDraw from '@mapbox/mapbox-gl-draw'
import type { MapboxGeoJSONFeature, Popup } from 'mapbox-gl'
import mapboxgl, { Map, NavigationControl } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import React, { createRef } from 'react'
import type { Vertex } from 'State/Segment/Vertex'
import { InverseTransformVertexCoordinates } from 'State/Segment/Vertex'
import MapDrawnPoints from './MapDrawnPoints'
import type {
	ArrowSource,
	DrawnPointSource,
	LineSource,
	PointSource
} from './Sources'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string
// const ARROW_ANGLE_1 = Math.PI / 6
// const ARROW_ANGLE_2 = 2 * Math.PI - ARROW_ANGLE_1

export interface MapState {
	map?: Map
	mapLoaded?: boolean
	draw?: MapboxDraw
	popup?: Popup
	internalPointSources?: PointSource[]
	internalArrowSources?: ArrowSource[]
	internalLineSources?: LineSource[]
	internalDrawnPointSource?: DrawnPointSource
	drawnPointSettings: {
		selectedColor: string
		selectedRadius: number
		color: string
		radius: number
	}
	internalSelections?: Record<string, number>
	mapReference: React.Ref<HTMLDivElement>
}

export interface MapProperties {
	pointSources: PointSource[]
	arrowSources: ArrowSource[]
	lineSources: LineSource[]
	drawnPointSource: DrawnPointSource
	selections: Record<string, number>
	click: (coordinates: Vertex) => void
}

export class CeleriMap extends React.Component<MapProperties, MapState> {
	public constructor(properties: MapProperties) {
		super(properties)
		this.state = {
			drawnPointSettings: {
				selectedColor: '',
				selectedRadius: 0,
				color: '',
				radius: 0
			},
			mapReference: createRef()
		}
	}

	public componentDidMount(): void {
		const { mapReference } = this.state
		const element =
			typeof mapReference === 'object' ? mapReference?.current : undefined
		if (mapboxgl.accessToken && element) {
			const innerMap = new Map({
				container: element,
				style: 'mapbox://styles/mapbox-public/ckngin2db09as17p84ejhe24y',
				// eslint-disable-next-line @typescript-eslint/no-magic-numbers
				center: [0, 0],
				// eslint-disable-next-line @typescript-eslint/no-magic-numbers
				zoom: 2
			})
			innerMap.addControl(new NavigationControl())

			this.setState({ map: innerMap })
			innerMap.on('load', () => {
				this.setState({ mapLoaded: true })
			})
			innerMap.on('click', ({ lngLat }) => {
				const { click } = this.props
				click(InverseTransformVertexCoordinates([lngLat.lng, lngLat.lat]))
			})
			innerMap.on(
				'draw.selectionchange',
				({ features }: { features: MapboxGeoJSONFeature[] }) => {
					const { internalDrawnPointSource } = this.state
					if (!internalDrawnPointSource || !internalDrawnPointSource?.select)
						return
					const feature = features[0]
					if (
						feature &&
						feature.type === 'Feature' &&
						feature.geometry.type === 'Point' &&
						feature.properties &&
						'index' in feature.properties &&
						typeof feature.properties.index === 'number'
					) {
						internalDrawnPointSource.select(feature.properties.index)
					}
				}
			)
			innerMap.on('draw.modechange', ({ mode }: { mode: string }) => {
				const { selections } = this.props
				const { draw } = this.state
				if (mode === 'simple_select' && selections.drawnPoint && draw) {
					draw.changeMode('direct_select', {
						featureId: `${selections.drawnPoint}`
					})
				}
			})
			innerMap.on(
				'draw.update',
				({
					features,
					action
				}: {
					features: MapboxGeoJSONFeature[]
					action: 'change_coordinates' | 'move'
				}) => {
					const { internalDrawnPointSource } = this.state
					if (!internalDrawnPointSource?.update) return
					if (action === 'move' && features.length > 0) {
						for (const feature of features) {
							if (
								feature.type === 'Feature' &&
								feature.geometry.type === 'Point' &&
								feature.properties &&
								'index' in feature.properties &&
								typeof feature.properties.index === 'number'
							) {
								internalDrawnPointSource.update(
									feature.properties.index,
									InverseTransformVertexCoordinates(
										feature.geometry.coordinates as [number, number]
									)
								)
							}
						}
					}
				}
			)
		}
	}

	public shouldComponentUpdate(
		nextProperties: MapProperties,
		nextState: MapState
	): boolean {
		MapDrawnPoints(
			state => this.setState(state as unknown as MapState),
			nextState,
			nextProperties
		)
		return false
	}

	public render(): React.ReactNode {
		const { mapReference } = this.state
		return (
			<div data-testid='map' className='w-full h-full' ref={mapReference} />
		)
	}
}

export default CeleriMap
