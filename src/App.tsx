/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { BlockDisplaySettings } from 'Components/BlockPanel'
import BlockPanel, { initialBlockDisplaySettings } from 'Components/BlockPanel'
import type { OpenableFile } from 'Components/Files'
import Files from 'Components/Files'
import InspectorPanel from 'Components/InspectorPanel'
import type {
	ArrowSource,
	DrawnPointSource,
	LineSource,
	PointSource
} from 'Components/Map'
import Map from 'Components/Map'
import type { SegmentsDisplaySettings } from 'Components/SegmentsPanel'
import SegmentsPanel, {
	initialSegmentDisplaySettings
} from 'Components/SegmentsPanel'
import TopBar from 'Components/TopBar'
import type { VelocitiesDisplaySettings } from 'Components/VelocitiesPanel'
import VelocitiesPanel, {
	initialVelocityDisplaySettings
} from 'Components/VelocitiesPanel'
import type { VerticesDisplaySettings } from 'Components/VertexPanel'
import VerticesPanel, {
	initialVertexDisplaySettings
} from 'Components/VertexPanel'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import type { BlockFile } from 'Utilities/BlockFile'
import { createBlock } from 'Utilities/BlockFile'
import type { CommandFile } from 'Utilities/CommandFile'
import {
	OpenBlockFile,
	OpenCommandFile,
	OpenSegmentFile,
	OpenVelocityFile
} from 'Utilities/FileOpeners'
import FSOpenDirectory from 'Utilities/FileSystem'
import type { Directory } from 'Utilities/FileSystemInterfaces'
import OpenDirectory, {
	SetDirectoryHandle
} from 'Utilities/FileSystemInterfaces'
import type { SegmentFile, Vertex } from 'Utilities/SegmentFile'
import {
	DEFAULT_VERTEX,
	GetShortestLineCoordinates
} from 'Utilities/SegmentFile'
import type { VelocityFile } from 'Utilities/VelocityFile'
import { createVelocity } from 'Utilities/VelocityFile'

if (!window.location.search.includes('fake-dir')) {
	SetDirectoryHandle(FSOpenDirectory)
}

export type SelectionMode =
	| 'normal'
	| ({ label: string } & (
			| { mode: 'mapClick'; callback: (point: Vertex) => void }
			| { mode: 'override'; type: string; callback: (index: number) => void }
	  ))

const windows = {
	files: 'Files',
	segment: 'Segment',
	block: 'Block',
	velocities: 'Velocities',
	vertex: 'Vertices'
	//  mesh: 'Mesh'
}

export default function App(): ReactElement {
	const [folderHandle, setFolderHandle] = useState<Directory>()
	const [activeTab, setActiveTab] = useState<string>('')
	const [files, setFiles] = useState<Record<string, OpenableFile>>({
		command: {
			name: 'Command File',
			description: 'A file pointing to all the other relevant files',
			extension: '.json',
			currentFilePath: ''
		},
		segment: {
			name: 'Segment File',
			description: 'A CSV containing the details of fault locations',
			extension: '.csv',
			currentFilePath: ''
		},
		block: {
			name: 'Block File',
			description: 'A CSV containing information on blocks/plates',
			extension: '.csv',
			currentFilePath: ''
		},
		velocities: {
			name: 'Velocity Estimations',
			description:
				'A CSV containing velocity estimations for various points on the globe',
			extension: '.csv',
			currentFilePath: ''
		}
	})

	const [commandFile, setCommandFile] = useState<CommandFile>()
	const [segmentFile, setSegmentFile] = useState<SegmentFile>()
	const [blockFile, setBlockFile] = useState<BlockFile>()
	const [velocityFile, setVelocityFile] = useState<VelocityFile>()

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

	const [selectionMode, setSelectionMode] = useState<SelectionMode>('normal')

	const [selectedBlock, setSelectedBlock] = useState<number>(-1)
	const [selectedSegment, setSelectedSegment] = useState<number>(-1)
	const [selectedVelocity, setSelectedVelocity] = useState<number>(-1)
	const [selectedVertex, setSelectedVertex] = useState<number>(-1)

	const [select, setSelect] = useState<{
		select: (type: string, index: number) => void
	}>({
		select: (type: string, index: number): void => {
			setSelectedBlock(type === 'block' ? index : -1)
			setSelectedSegment(type === 'segment' ? index : -1)
			setSelectedVelocity(type === 'velocities' ? index : -1)
			setSelectedVertex(type === 'vertex' ? index : -1)
			setActiveTab(type)
		}
	})

	const [pointSources, setPointSources] = useState<PointSource[]>([])
	const [arrowSources, setArrowSources] = useState<ArrowSource[]>([])
	const [lineSources, setLineSources] = useState<LineSource[]>([])
	const [drawnPointSource, setDrawnPointSource] = useState<DrawnPointSource>({
		color: vertexSettings.color,
		selectedColor: vertexSettings.activeColor,
		radius: vertexSettings.radius,
		selectedRadius: vertexSettings.activeRadius,
		points: []
	})

	useEffect(() => {
		if (selectionMode === 'normal') {
			setSelect({
				select: (type: string, index: number): void => {
					setSelectedBlock(type === 'block' ? index : -1)
					setSelectedSegment(type === 'segment' ? index : -1)
					setSelectedVelocity(type === 'velocities' ? index : -1)
					setSelectedVertex(type === 'vertex' ? index : -1)
					setActiveTab(type)
				}
			})
		} else if (selectionMode.mode === 'override') {
			setSelect({
				select: (type: string, index: number): void => {
					if (type === selectionMode.type) {
						selectionMode.callback(index)
					}
				}
			})
		} else {
			setSelect({ select: (): void => {} })
		}
	}, [selectionMode])

	useEffect(() => {
		setPointSources([
			{
				name: 'blocks',
				color: blockSettings.color,
				selectedColor: blockSettings.selectedColor,
				radius: blockSettings.radius,
				points: blockFile?.data
					? blockFile.data.map((block, index) => ({
							longitude: block.interior_lon,
							latitude: block.interior_lat,
							name: block.name,
							description: ``,
							index
					  }))
					: [],
				click: (index): void => {
					select.select('block', index)
				}
			}
		])
	}, [blockSettings, blockFile, segmentSettings, segmentFile, select])

	useEffect(() => {
		setLineSources([
			{
				name: 'segments',
				color: segmentSettings.color,
				selectedColor: segmentSettings.activeColor,
				width: segmentSettings.width,
				selectedWidth: segmentSettings.activeWidth,
				lines: segmentFile?.data?.segments
					? segmentFile.data.segments.map((segment, index) => {
							const start =
								segmentFile.data?.vertecies[segment.start] ?? DEFAULT_VERTEX
							const end =
								segmentFile.data?.vertecies[segment.end] ?? DEFAULT_VERTEX
							const [
								[startLongitude, startLatitude],
								[endLongitude, endLatitude]
							] = GetShortestLineCoordinates(start, end)
							return {
								startLongitude,
								startLatitude,
								endLongitude,
								endLatitude,
								name: segment.name,
								description: `${start.lon},${start.lat} to ${end.lon},${end.lat}`,
								index
							}
					  })
					: [],
				click: (index): void => {
					select.select('segment', index)
				}
			}
		])
	}, [segmentFile, segmentSettings, select])

	useEffect(() => {
		setDrawnPointSource({
			color: vertexSettings.color,
			radius: vertexSettings.radius,
			selectedColor: vertexSettings.activeColor,
			selectedRadius: vertexSettings.activeRadius,
			points: segmentFile?.data?.vertecies
				? (Object.keys(segmentFile.data.vertecies)
						.map(v => {
							const index = Number.parseInt(v, 10)
							const vert = segmentFile.data?.vertecies[index]
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
				  }[])
				: [],
			update: (index, vertex) => {
				if (segmentFile) {
					const file = segmentFile.moveVertex(index, vertex)
					setSegmentFile(file)
				}
			},
			select: index => {
				select.select('vertex', index)
			}
		})
	}, [vertexSettings, segmentFile, select])

	useEffect(() => {
		setArrowSources([
			{
				name: 'velocity',
				color: velocitiesSettings.color,
				scale: velocitiesSettings.scale,
				arrowHeadScale: velocitiesSettings.arrowHead,
				width: velocitiesSettings.width,
				arrows: velocityFile?.data
					? velocityFile.data.map(velocity => {
							const scale = Math.sqrt(
								velocity.east_vel * velocity.east_vel +
									velocity.north_vel * velocity.north_vel
							)
							return {
								longitude: velocity.lon,
								latitude: velocity.lat,
								direction: [
									velocity.east_vel / scale,
									velocity.north_vel / scale
								],
								scale,
								name: velocity.name,
								description: `north: ${velocity.north_vel}, east: ${velocity.east_vel}`
							}
					  })
					: [],
				click: (index): void => {
					select.select('velocities', index)
				}
			}
		])
	}, [select, velocitiesSettings, velocityFile])

	let view = <span />

	switch (activeTab) {
		case 'files':
			view = folderHandle ? (
				<Files
					folder={folderHandle}
					files={files}
					setFile={async (file, name, handle): Promise<void> => {
						if (handle) {
							let updated = { ...files }
							updated[file] = { ...updated[file], currentFilePath: name }
							switch (file) {
								case 'segment':
									setSegmentFile(await OpenSegmentFile(handle))
									break
								case 'block':
									setBlockFile(await OpenBlockFile(handle))
									break
								case 'velocity':
									setVelocityFile(await OpenVelocityFile(handle))
									break
								case 'command':
									// eslint-disable-next-line no-case-declarations
									const commandResult = await OpenCommandFile(
										folderHandle,
										handle,
										files
									)
									setCommandFile(commandResult.commands)
									setSegmentFile(commandResult.segments)
									setBlockFile(commandResult.blocks)
									setVelocityFile(commandResult.velocities)
									updated = commandResult.openableFiles
									break
								default:
									break
							}
							setFiles(updated)
						}
					}}
				/>
			) : (
				<span />
			)
			break
		case 'velocities':
			view = (
				<VelocitiesPanel
					settings={velocitiesSettings}
					setSettings={setVelocitiesSettings}
					selected={selectedVelocity}
					velocitys={velocityFile?.data ?? []}
					setVelocityData={(index, data): void => {
						if (velocityFile !== undefined) {
							if (data) {
								const velocity =
									// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
									velocityFile.data && velocityFile.data[index]
										? { ...velocityFile.data[index], ...data }
										: createVelocity(data)
								const dataArray = velocityFile.data
									? [...velocityFile.data]
									: []
								dataArray[index] = velocity
								const file = velocityFile.clone()
								file.data = dataArray
								setVelocityFile(file)
							} else {
								const dataArray = velocityFile.data
									? [...velocityFile.data]
									: []
								dataArray.splice(index, 1)
								const file = velocityFile.clone()
								file.data = dataArray
								setVelocityFile(file)
							}
						}
					}}
					addNewVelocity={(): void => {
						if (velocityFile !== undefined) {
							const dataArray = velocityFile.data ? [...velocityFile.data] : []
							const velocity = createVelocity({})
							dataArray.push(velocity)
							const file = velocityFile.clone()
							file.data = dataArray
							setVelocityFile(file)
						}
					}}
				/>
			)
			break
		case 'block':
			view = (
				<BlockPanel
					settings={blockSettings}
					setSettings={setBlockSettings}
					selected={selectedBlock}
					blocks={blockFile?.data ?? []}
					addNewBlock={(): void => {
						setSelectionMode({
							label: 'Click to place new block',
							mode: 'mapClick',
							callback: point => {
								if (blockFile !== undefined) {
									const dataArray = blockFile.data ? [...blockFile.data] : []
									const block = createBlock({
										interior_lon: point.lon,
										interior_lat: point.lat
									})
									const id = dataArray.length
									dataArray.push(block)
									const file = blockFile.clone()
									file.data = dataArray
									setBlockFile(file)
									setSelectionMode('normal')
									select.select('block', id)
								}
							}
						})
					}}
					setBlockData={(index, data): void => {
						if (blockFile !== undefined) {
							if (data) {
								const block =
									// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
									blockFile.data && blockFile.data[index]
										? { ...blockFile.data[index], ...data }
										: createBlock(data)
								const dataArray = blockFile.data ? [...blockFile.data] : []
								dataArray[index] = block
								const file = blockFile.clone()
								file.data = dataArray
								setBlockFile(file)
							} else {
								const dataArray = blockFile.data ? [...blockFile.data] : []
								dataArray.splice(index, 1)
								const file = blockFile.clone()
								file.data = dataArray
								setBlockFile(file)
							}
						}
					}}
				/>
			)
			break
		case 'segment':
			view = (
				<SegmentsPanel
					settings={segmentSettings}
					setSettings={setSegmentSettings}
					segments={segmentFile?.data?.segments ?? []}
					selected={selectedSegment}
					setSelectionMode={(mode): void => setSelectionMode(mode)}
					addNewSegment={(a, b): void => {
						if (segmentFile !== undefined) {
							setSegmentFile(segmentFile.createSegment(a, b))
						}
					}}
					setSegmentData={(index, data): void => {
						if (segmentFile !== undefined) {
							if (data) {
								const segment =
									// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
									segmentFile.data && segmentFile.data.segments[index]
										? { ...segmentFile.data.segments[index], ...data }
										: undefined
								const dataArray = segmentFile.data
									? [...segmentFile.data.segments]
									: []
								if (segment) {
									dataArray[index] = segment
									const file = segmentFile.clone()
									file.data = {
										vertecies: file.data?.vertecies ?? [],
										vertexDictionary: file.data?.vertexDictionary ?? {},
										segments: dataArray
									}
									setSegmentFile(file)
								}
							} else {
								setSegmentFile(segmentFile.deleteSegment(index))
							}
						}
					}}
					splitSegment={(index): void => {
						if (segmentFile) {
							const file = segmentFile.splitSegment(index)
							setSegmentFile(file)
						}
					}}
				/>
			)
			break
		case 'vertex':
			view = (
				<VerticesPanel
					settings={vertexSettings}
					setSettings={setVertexSettings}
					vertices={segmentFile?.data?.vertecies ?? {}}
					selected={selectedVertex}
					setVertexData={function (
						index: number,
						data?: Partial<Vertex>
					): void {
						throw new Error('Function not implemented.')
					}}
					setSelectionMode={(mode): void => setSelectionMode(mode)}
					mergeVertices={(a, b): void => {
						if (segmentFile) {
							setSegmentFile(segmentFile.mergeVertices(a, b))
						}
					}}
					bridgeVertices={(a, b): void => {
						if (segmentFile) {
							setSegmentFile(segmentFile.bridgeVertices(a, b))
						}
					}}
					extrudeVertex={(start, end): void => {
						if (segmentFile) {
							setSegmentFile(segmentFile.extrudeSegment(start, end))
						}
					}}
				/>
			)
			break
		default:
			break
	}

	return (
		// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
		<div
			role='document'
			className='w-screen h-screen flex flex-col'
			onKeyDown={(event): void => {
				if (event.key === 'Escape') {
					setSelectionMode('normal')
				}
			}}
		>
			<TopBar
				filesOpen={(commandFile ?? segmentFile ?? blockFile) !== undefined}
				saveFiles={async (): Promise<void> => {
					if (commandFile) await commandFile.save()
					if (segmentFile) await segmentFile.save()
					if (blockFile) await blockFile.save()
				}}
				folder={folderHandle}
				openFolder={async (): Promise<void> => {
					const directory = await OpenDirectory()
					setFolderHandle(directory)
					setActiveTab('files')
				}}
			/>
			{selectionMode !== 'normal' ? (
				<div className=''>
					<span className=''>{selectionMode.label}</span>
					<span className=''>Press Escape to cancel</span>
				</div>
			) : (
				<></>
			)}
			<Map
				pointSources={pointSources}
				arrowSources={arrowSources}
				lineSources={lineSources}
				drawnPointSource={drawnPointSource}
				selections={{
					segments: selectedSegment,
					blocks: selectedBlock,
					velocities: selectedVelocity
				}}
				click={(point): void => {
					if (
						typeof selectionMode !== 'string' &&
						selectionMode.mode === 'mapClick'
					) {
						selectionMode.callback(point)
					}
				}}
			/>
			<InspectorPanel
				view={view}
				buttons={folderHandle ? windows : undefined}
				active={activeTab}
				setActive={(active): void => setActiveTab(active)}
			/>
		</div>
	)
}
