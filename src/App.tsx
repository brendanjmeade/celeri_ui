import InspectorPanel from 'Components/InspectorPanel'
import Map from 'Components/Map'
import TopBar from 'Components/TopBar'
import type { ReactElement } from 'react'
import { useState } from 'react'
import type { Directory } from 'Utilities/FileSystem'
import { OpenDirectory } from 'Utilities/FileSystem'

export default function App(): ReactElement {
	const [folderHandle, setFolderHandle] = useState<Directory>()
	const [activeTab, setActiveTab] = useState<string>('')

	return (
		<div className='w-screen h-screen flex flex-col'>
			<TopBar
				folder={folderHandle}
				openFolder={async (): Promise<void> => {
					const directory = await OpenDirectory()
					setFolderHandle(directory)
					setActiveTab('files')
				}}
			/>
			<Map />
			<InspectorPanel
				view={folderHandle ? <span>{folderHandle.name}</span> : undefined}
				buttons={
					folderHandle
						? {
								files: 'Files',
								segment: 'Segment',
								block: 'Block',
								mesh: 'Mesh'
						  }
						: undefined
				}
				active={activeTab}
				setActive={(active): void => setActiveTab(active)}
			/>
		</div>
	)
}
