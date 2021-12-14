import Map from 'Components/Map'
import TopBar from 'Components/TopBar'
import type { ReactElement } from 'react'

export default function App(): ReactElement {
	return (
		<div className='w-screen h-screen flex flex-col'>
			<TopBar />
			<Map />
		</div>
	)
}
