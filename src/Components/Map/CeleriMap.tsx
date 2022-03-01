/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable react-prefer-function-component/react-prefer-function-component */
import type MapboxDraw from '@mapbox/mapbox-gl-draw'
import type { MapboxGeoJSONFeature } from 'mapbox-gl'
import mapboxgl, { Map, NavigationControl, Popup } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import React, { createRef } from 'react'
import type { Vertex } from 'State/Segment/Vertex'
import { InverseTransformVertexCoordinates } from 'State/Segment/Vertex'
import MapArrows from './MapArrows'
import MapDrawnPoints from './MapDrawnPoints'
import MapGrid from './MapGrid'
import MapLineSegments from './MapLineSegments'
import MapPoints from './MapPoints'
import type {
	ArrowSource,
	DrawnPointSource,
	LineSource,
	PointSource
} from './Sources'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

export interface MapState {
	map?: Map
	mapLoaded?: boolean
	draw?: MapboxDraw
	popup: Popup
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
	internalSelections: Record<string, number[]>
	mapReference: React.Ref<HTMLDivElement>
	internalGridDisplay?: number
}

export interface MapProperties {
	pointSources: PointSource[]
	arrowSources: ArrowSource[]
	lineSources: LineSource[]
	drawnPointSource: DrawnPointSource
	selections: Record<string, number[]>
	click: (coordinates: Vertex) => void
	mouseMove?: (coordinates: Vertex) => void
	displayGrid?: number
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
			internalSelections: {},
			mapReference: createRef(),
			popup: new Popup({ closeButton: false, closeOnClick: false })
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
			innerMap.on('mousemove', ({ lngLat }): void => {
				const { mouseMove } = this.props
				if (mouseMove) {
					mouseMove(InverseTransformVertexCoordinates([lngLat.lng, lngLat.lat]))
				}
			})
			innerMap.on(
				'draw.selectionchange',
				({ features }: { features: MapboxGeoJSONFeature[] }) => {
					const { internalDrawnPointSource } = this.state
					if (!internalDrawnPointSource || !internalDrawnPointSource?.select)
						return
					const indices = features
						.map(feature =>
							feature &&
							feature.type === 'Feature' &&
							feature.geometry.type === 'Point' &&
							feature.properties &&
							'index' in feature.properties &&
							typeof feature.properties.index === 'number'
								? feature.properties.index
								: -1
						)
						.filter(v => v > -1)
					internalDrawnPointSource.select(indices)
				}
			)
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

	public componentDidUpdate(): boolean {
		MapGrid(
			this,
			state => this.setState(state as unknown as MapState),
			this.state,
			this.props
		)
		MapLineSegments(
			this,
			state => this.setState(state as unknown as MapState),
			this.state,
			this.props
		)
		MapArrows(
			this,
			state => this.setState(state as unknown as MapState),
			this.state,
			this.props
		)
		MapPoints(
			this,
			state => this.setState(state as unknown as MapState),
			this.state,
			this.props
		)
		MapDrawnPoints(
			state => this.setState(state as unknown as MapState),
			this.state,
			this.props
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
