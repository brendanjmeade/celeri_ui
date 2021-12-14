import type { ReactElement } from 'react'

function TopBar(): ReactElement {
	return (
		<div className='p-2 bg-gradient-to-r from-blue-700 to-green-700 text-white flex flex-row'>
			<h3 className='text-lg font-bold'>Celeri UI</h3>
		</div>
	)
}

export default TopBar
