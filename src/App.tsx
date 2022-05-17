/* eslint-disable unicorn/no-nested-ternary */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { BlockDisplaySettings } from 'Components/BlockPanel'
import { initialBlockDisplaySettings } from 'Components/BlockPanel'
import EditModePanel from 'Components/EditModePanel'
import FileExplorer from 'Components/FileExplorer'
import type { GenericSegmentDisplaySettings } from 'Components/GenericSegmentPanel'
import { initialGenericSegmentDisplaySettings } from 'Components/GenericSegmentPanel'
import CeleriMap from 'Components/Map/CeleriMap'
import type {
	ArrowSource,
	DrawnPointSource,
	LineSource,
	PointSource,
	PolygonSource
} from 'Components/Map/Sources'
import type { MapSettings } from 'Components/MapSettingsPanel'
import { initialMapSettings } from 'Components/MapSettingsPanel'
import type { MeshDisplaySettings } from 'Components/MeshPanel'
import { initialMeshDisplaySettings } from 'Components/MeshPanel'
import type { SegmentsDisplaySettings } from 'Components/SegmentsPanel'
import { initialSegmentDisplaySettings } from 'Components/SegmentsPanel'
import SelectionModeDetails from 'Components/SelectionModeDetails'
import TopBar from 'Components/TopBar'
import type { VelocitiesDisplaySettings } from 'Components/VelocitiesPanel'
import { initialVelocityDisplaySettings } from 'Components/VelocitiesPanel'
import type { VerticesDisplaySettings } from 'Components/VertexPanel'
import { initialVertexDisplaySettings } from 'Components/VertexPanel'
import type { LngLat } from 'mapbox-gl'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import type { SelectionMode } from 'Selectors/SelectionMode'
import { SelectionModeSelector } from 'Selectors/SelectionMode'
import { setRootFolder } from 'State/FileHandles/State'
import { useAppDispatch, useAppSelector } from 'State/Hooks'
import type { Vertex } from 'State/Segment/Vertex'
import { GenerateBlockFileString } from 'Utilities/BlockFile'
import type { Directory, File } from 'Utilities/FileSystemInterfaces'
import OpenDirectory from 'Utilities/FileSystemInterfaces'
import { PointsInPolygon } from 'Utilities/PointUtilities'
import { GenerateSegmentFileString } from 'Utilities/SegmentFile'
import { GenerateVelocityFileString } from 'Utilities/VelocityFile'
import Inspector from './Components/Inspector'
import { EditMode } from './Utilities/EditMode'
import SetupArrowSources from './Utilities/SetupArrowSources'
import SetupDrawnPointSource from './Utilities/SetupDrawnPointSource'
import SetupLineSources from './Utilities/SetupLineSources'
import SetupPointSources from './Utilities/SetupPointSources'
import SetupPolygonSource from './Utilities/SetupPolygonSource'

export default function App(): ReactElement {
	const dispatch = useAppDispatch()
	const folderHandle = useAppSelector<Directory | undefined>(
		state => state.main.present.fileHandles.rootFolder
	)
	const [fileOpenCallback, setFileOpenCallback] = useState<
		| false
		| {
				callback: (file: File, path: string[]) => void
				extension: string
				isSaveFile?: boolean
		  }
	>(false)

	const [activeTab, setActiveTab] = useState<string>('command')

	const segmentFile = useAppSelector<
		{ path: string[]; file: File } | undefined
	>(state => state.main.present.fileHandles.files.segment)
	const blockFile = useAppSelector<{ path: string[]; file: File } | undefined>(
		state => state.main.present.fileHandles.files.block
	)
	const velocityFile = useAppSelector<
		{ path: string[]; file: File } | undefined
	>(state => state.main.present.fileHandles.files.velocity)
	const commandFile = useAppSelector<
		{ path: string[]; file: File } | undefined
	>(state => state.main.present.fileHandles.files.command)
	const meshParametersFile = useAppSelector<
		{ path: string[]; file: File } | undefined
	>(state => state.main.present.fileHandles.files.mesh_params)

	const segments = useAppSelector(state => state.main.present.segment)
	const blocks = useAppSelector(state => state.main.present.block)
	const velocities = useAppSelector(state => state.main.present.velocity)
	const meshLines = useAppSelector(state => state.main.present.meshLine)
	const genericSegments = useAppSelector(
		state => state.main.present.genericSegments
	)
	const command = useAppSelector(state => state.main.present.command)

	const [velocitiesSettings, setVelocitiesSettings] =
		useState<VelocitiesDisplaySettings>(initialVelocityDisplaySettings)
	const [blockSettings, setBlockSettings] = useState<BlockDisplaySettings>(
		initialBlockDisplaySettings
	)
	const [segmentSettings, setSegmentSettings] =
		useState<SegmentsDisplaySettings>(initialSegmentDisplaySettings)
	const [vertexSettings, setVertexSettings] = useState<VerticesDisplaySettings>(
		initialVertexDisplaySettings
	)
	const [meshLineSettings, setMeshLineSettings] = useState<MeshDisplaySettings>(
		initialMeshDisplaySettings
	)
	const [genericSegmentSettings, setGenericSegmentSettings] =
		useState<GenericSegmentDisplaySettings>(
			initialGenericSegmentDisplaySettings
		)
	const [mapSettings, setMapSettings] =
		useState<MapSettings>(initialMapSettings)

	const [selectionMode, setSelectionMode] = useState<SelectionMode>('normal')
	const [editMode, setEditMode] = useState<EditMode>(EditMode.Vertex)

	const [selectedBlock, setSelectedBlock] = useState<number[]>([])
	const [selectedSegment, setSelectedSegment] = useState<number[]>([])
	const [selectedVelocity, setSelectedVelocity] = useState<number[]>([])
	const [selectedVertex, setSelectedVertex] = useState<number[]>([])
	const [lassoSelection, setLassoSelection] = useState<number[]>([])

	const [select, setSelect] = useState<{
		select: (type: string, indices: number[]) => void
	}>({
		select: SelectionModeSelector({
			mode: selectionMode,
			setSelectedBlock,
			setSelectedSegment,
			setSelectedVelocity,
			setSelectedVertex,
			setActiveTab,
			setLassoSelection
		})
	})

	const [pointSources, setPointSources] = useState<PointSource[]>([])
	const [arrowSources, setArrowSources] = useState<ArrowSource[]>([])
	const [lineSources, setLineSources] = useState<LineSource[]>([])
	const [polygonSources, setPolygonSources] = useState<PolygonSource[]>([])
	const [drawnPointSource, setDrawnPointSource] = useState<DrawnPointSource>({
		color: vertexSettings.color,
		selectedColor: vertexSettings.activeColor,
		radius: vertexSettings.radius,
		selectedRadius: vertexSettings.activeRadius,
		points: []
	})

	const [hoverPoint, setHoverPoint] = useState<Vertex>({ lon: 0, lat: 0 })
	const [displayGrid, setDisplayGrid] = useState(false)

	const [currentMapPosition, setCurrentMapPosition] =
		useState<{ zoom: number; center: LngLat }>()

	useEffect(() => {
		select.select = SelectionModeSelector({
			mode: selectionMode,
			setSelectedBlock,
			setSelectedSegment,
			setSelectedVelocity,
			setSelectedVertex,
			setActiveTab,
			setLassoSelection
		})
	}, [selectionMode, select])

	useEffect(() => {
		SetupPointSources({
			editMode,
			blockSettings,
			blocks,
			select,
			vertexSettings,
			segments,
			selectionMode,
			setPointSources
		})
	}, [
		blockSettings,
		blocks,
		segmentSettings,
		select,
		editMode,
		vertexSettings,
		segments,
		selectionMode
	])

	useEffect(() => {
		SetupLineSources({
			segmentSettings,
			segments,
			select,
			meshLineSettings,
			meshLines,
			genericSegmentSettings,
			genericSegments,
			setLineSources
		})
	}, [
		segments,
		segmentSettings,
		genericSegmentSettings,
		genericSegments,
		meshLineSettings,
		meshLines,
		select
	])

	useEffect(() => {
		SetupDrawnPointSource({
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
		})
	}, [
		blockSettings,
		blocks,
		dispatch,
		editMode,
		segments,
		select,
		velocities,
		velocitiesSettings,
		vertexSettings
	])

	useEffect(() => {
		SetupArrowSources({
			velocitiesSettings,
			setArrowSources,
			velocities,
			select
		})
	}, [select, velocitiesSettings, velocities])

	useEffect(() => {
		SetupPolygonSource(
			selectionMode,
			segmentSettings,
			segments,
			setPolygonSources
		)
	}, [segmentSettings, segments, selectionMode])

	const hiddenState: Record<string, { state: boolean; change: () => void }> = {
		Block: {
			state: blockSettings.hide,
			change: () => {
				setBlockSettings({ ...blockSettings, hide: !blockSettings.hide })
			}
		},
		Vertex: {
			state: vertexSettings.hide,
			change: () => {
				setVertexSettings({ ...vertexSettings, hide: !vertexSettings.hide })
			}
		},
		Velocity: {
			state: velocitiesSettings.hide,
			change: () => {
				setVelocitiesSettings({
					...velocitiesSettings,
					hide: !velocitiesSettings.hide
				})
			}
		},
		Segment: {
			state: segmentSettings.hide,
			change: () => {
				setSegmentSettings({ ...segmentSettings, hide: !segmentSettings.hide })
			}
		},
		Grid: {
			state: !displayGrid,
			change: () => {
				setDisplayGrid(!displayGrid)
			}
		},
		Mesh: {
			state: meshLineSettings.hide,
			change: () => {
				setMeshLineSettings({
					...meshLineSettings,
					hide: !meshLineSettings.hide
				})
			}
		},
		GenericSegments: {
			state: genericSegmentSettings.hide,
			change: () => {
				setGenericSegmentSettings({
					...genericSegmentSettings,
					hide: !genericSegmentSettings.hide
				})
			}
		}
	}

	return (
		// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
		<div
			role='document'
			className='w-screen h-screen flex flex-col text-white'
			onKeyDown={(event): void => {
				if (event.key === 'Escape') {
					setSelectionMode('normal')
				} else if (
					event.key === 'Enter' &&
					selectionMode !== 'normal' &&
					selectionMode.mode === 'lasso'
				) {
					if (selectionMode.polygon.length > 2) {
						let selectableItems: { point: Vertex; id: number }[] = []
						const selectionType = editMode

						switch (selectionType) {
							case EditMode.Block:
								selectableItems = blocks.map((value, index) => ({
									point: { lon: value.interior_lon, lat: value.interior_lat },
									id: index
								}))
								break
							case EditMode.Velocity:
								selectableItems = velocities.map((value, index) => ({
									point: { lon: value.lon, lat: value.lat },
									id: index
								}))
								break
							case EditMode.Vertex:
								selectableItems = Object.keys(segments.vertecies).map(
									index => ({
										point: segments.vertecies[index as unknown as number],
										id: index as unknown as number
									})
								)
								break
							case EditMode.Segments:
								selectableItems = segments.segments.map((value, index) => {
									const start = segments.vertecies[value.start]
									const end = segments.vertecies[value.end]
									return {
										point: {
											lon: (start.lon + end.lon) / 2,
											lat: (start.lat + end.lat) / 2
										},
										id: index
									}
								})
								break
							default:
								setSelectionMode('normal')
								return
						}

						const { polygon } = selectionMode

						const selectedItems = PointsInPolygon(selectableItems, polygon)
						select.select(selectionType, selectedItems)
					}
					setSelectionMode('normal')
				}
			}}
		>
			<TopBar
				filesOpen={folderHandle !== undefined}
				saveFiles={async (): Promise<void> => {
					// if (commandFile) await commandFile.save()
					if (segmentFile) {
						await segmentFile.file.setContents(
							GenerateSegmentFileString(segments)
						)
					}
					if (blockFile) {
						await blockFile.file.setContents(GenerateBlockFileString(blocks))
					}
					if (velocityFile) {
						await velocityFile.file.setContents(
							GenerateVelocityFileString(velocities)
						)
					}
				}}
				folder={folderHandle}
				openFolder={async (): Promise<void> => {
					const directory = await OpenDirectory()
					dispatch(setRootFolder(directory))
					setActiveTab('command')
				}}
			/>
			<SelectionModeDetails selectionMode={selectionMode} />
			<EditModePanel
				selectionMode={selectionMode}
				setSelectionMode={setSelectionMode}
				hoverPoint={hoverPoint}
				editMode={editMode}
				setEditMode={setEditMode}
				hiddenState={hiddenState}
			/>
			<CeleriMap
				key={`${mapSettings.currentStyle.user}:${mapSettings.currentStyle.styleId}`}
				pointSources={pointSources}
				arrowSources={arrowSources}
				lineSources={lineSources}
				drawnPointSource={drawnPointSource}
				polygonSources={polygonSources}
				selections={{
					segments: selectedSegment,
					blocks: selectedBlock,
					velocities: selectedVelocity,
					vertices: selectedVertex,
					draw: lassoSelection
				}}
				displayGrid={displayGrid ? 10 : -1}
				click={(point): void => {
					if (
						typeof selectionMode !== 'string' &&
						selectionMode.mode === 'mapClick'
					) {
						selectionMode.callback(point)
					} else if (
						typeof selectionMode !== 'string' &&
						selectionMode.mode === 'lasso'
					) {
						setSelectionMode({
							mode: 'lasso',
							polygon: [...selectionMode.polygon, point]
						})
					}
				}}
				mouseMove={(point): void => {
					setHoverPoint(point)
				}}
				styleUri={`mapbox://styles/${mapSettings.currentStyle.user}/${mapSettings.currentStyle.styleId}`}
				mapMoved={(zoom, center): void =>
					setCurrentMapPosition({ zoom, center })
				}
				initialPosition={currentMapPosition}
			/>
			{folderHandle ? (
				<Inspector
					activeTab={activeTab}
					setActiveTab={(active): void => setActiveTab(active)}
					setFileOpenCallback={setFileOpenCallback}
					dispatch={dispatch}
					velocitiesSettings={velocitiesSettings}
					setVelocitiesSettings={setVelocitiesSettings}
					selectedVelocity={selectedVelocity}
					velocities={velocities}
					select={select}
					setSelectionMode={setSelectionMode}
					velocityFile={velocityFile}
					blockSettings={blockSettings}
					setBlockSettings={setBlockSettings}
					selectedBlock={selectedBlock}
					blocks={blocks}
					blockFile={blockFile}
					segmentSettings={segmentSettings}
					setSegmentSettings={setSegmentSettings}
					segments={segments}
					selectedSegment={selectedSegment}
					segmentFile={segmentFile}
					vertexSettings={vertexSettings}
					setVertexSettings={setVertexSettings}
					selectedVertex={selectedVertex}
					folderHandle={folderHandle}
					meshLineSettings={meshLineSettings}
					setMeshLineSettings={setMeshLineSettings}
					genericSegmentSettings={genericSegmentSettings}
					setGenericSegmentSettings={setGenericSegmentSettings}
					genericSegments={genericSegments}
					mapSettings={mapSettings}
					setMapSettings={setMapSettings}
					command={command}
					meshParametersFile={meshParametersFile}
					commandFile={commandFile}
				/>
			) : (
				<></>
			)}
			{folderHandle && fileOpenCallback ? (
				<FileExplorer
					root={folderHandle}
					chooseFile={(file, path): void => {
						fileOpenCallback.callback(file, path)
						setFileOpenCallback(false)
					}}
					close={(): void => {
						setFileOpenCallback(false)
					}}
					extension={fileOpenCallback.extension}
					isSaveDialog={fileOpenCallback.isSaveFile === true}
				/>
			) : (
				<></>
			)}
		</div>
	)
}
