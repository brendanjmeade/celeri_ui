/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { BlockDisplaySettings } from 'Components/BlockPanel'
import BlockPanel, { initialBlockDisplaySettings } from 'Components/BlockPanel'
import type { OpenableFile } from 'Components/Files'
import Files from 'Components/Files'
import InspectorPanel from 'Components/InspectorPanel'
import type { ArrowSource, DrawnLineSource, PointSource } from 'Components/Map'
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
import type { SegmentFile } from 'Utilities/SegmentFile'
import { createSegment } from 'Utilities/SegmentFile'
import type { VelocityFile } from 'Utilities/VelocityFile'

if (!window.location.search.includes('fake-dir')) {
	SetDirectoryHandle(FSOpenDirectory)
}

const windows = {
	files: 'Files',
	segment: 'Segment',
	block: 'Block',
	velocities: 'Velocities'
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

	const [selectedBlock, setSelectedBlock] = useState<number>(-1)
	const [selectedSegment, setSelectedSegment] = useState<number>(-1)

	const [pointSources, setPointSources] = useState<PointSource[]>([])
	const [arrowSources, setArrowSources] = useState<ArrowSource[]>([])
	const [drawnLineSource, setDrawnLineSource] = useState<DrawnLineSource>({
		color: segmentSettings.color,
		activeColor: segmentSettings.activeColor,
		activeWidth: segmentSettings.activeWidth,
		width: segmentSettings.width,
		active: segmentFile !== undefined,
		lines: [],
		clickLine: (index): void => {
			setSelectedSegment(index)
			setActiveTab('segment')
		}
	})

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
				clickPoint: (index, name): void => {
					setSelectedBlock(index)
					setActiveTab('block')
				}
			}
		])
	}, [blockSettings, blockFile])

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
					: []
			}
		])
	}, [velocitiesSettings, velocityFile])

	useEffect(() => {
		setDrawnLineSource({
			color: segmentSettings.color,
			activeColor: segmentSettings.activeColor,
			activeWidth: segmentSettings.activeWidth,
			width: segmentSettings.width,
			active: segmentFile !== undefined,
			lines: segmentFile?.data
				? segmentFile.data.map((segment, index) => ({
						startLongitude: segment.lon1,
						endLongitude: segment.lon2,
						startLatitude: segment.lat1,
						endLatitude: segment.lat2,
						name: segment.name,
						index,
						description: ''
				  }))
				: [],
			clickLine: (index): void => {
				setSelectedSegment(index)
				setActiveTab('segment')
			}
		})
	}, [segmentSettings, segmentFile])

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
					setBlockData={(index, data): void => {
						if (blockFile !== undefined) {
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
					segments={segmentFile?.data ?? []}
					selected={selectedSegment}
					setSegmentData={(index, data): void => {
						if (segmentFile !== undefined) {
							const segment =
								// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
								segmentFile.data && segmentFile.data[index]
									? { ...segmentFile.data[index], ...data }
									: createSegment(data)
							const dataArray = segmentFile.data ? [...segmentFile.data] : []
							dataArray[index] = segment
							const file = segmentFile.clone()
							file.data = dataArray
							setSegmentFile(file)
						}
					}}
				/>
			)
			break
		default:
			break
	}

	return (
		<div className='w-screen h-screen flex flex-col'>
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
			<Map
				pointSources={pointSources}
				arrowSources={arrowSources}
				drawnLineSource={drawnLineSource}
				selections={{ drawnLine: selectedSegment, blocks: selectedBlock }}
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
