import Map from 'Components/Map'
import TopBar from 'Components/TopBar'
import type { ReactElement } from 'react'
import { useState } from 'react'
import type { Directory } from 'Utilities/FileSystem'
import { OpenDirectory } from 'Utilities/FileSystem'

export default function App(): ReactElement {
	const [folderHandle, setFolderHandle] = useState<Directory>()
	return (
		<div className='w-screen h-screen flex flex-col'>
			<TopBar
				folder={folderHandle}
				openFolder={async (): Promise<void> => {
					const directory = await OpenDirectory()
					setFolderHandle(directory)
				}}
			/>
			<Map />
		</div>
	)
}
