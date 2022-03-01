import type { ReactElement } from 'react'

function InspectorPanel({
	view,
	buttons,
	active,
	setActive
}: {
	view: ReactElement | undefined
	buttons: Record<string, string> | undefined
	active: string
	setActive: (active: string) => void
}): ReactElement {
	if (!buttons) return <span />
	const tabs: ReactElement[] = []
	for (const tab of Object.keys(buttons)) {
		const label = buttons[tab]
		const isActive = tab === active
		tabs.push(
			<button
				type='button'
				data-testid={`tab-${tab}`}
				key={tab}
				className={`${
					isActive ? 'bg-white' : 'bg-gray-200'
				} p-2 shadow-inner hover:bg-gray-100 rounded-t`}
				// eslint-disable-next-line react/jsx-handler-names
				onClick={(): void => setActive(isActive ? '' : tab)}
			>
				{label}
			</button>
		)
	}
	return (
		<div
			data-testid='inspector-container'
			className='absolute bottom-0 right-2 h-1/2 w-1/3 flex flex-col-reverse z-50'
		>
			{active ? (
				<div
					data-testid='inspector-view'
					className='flex flex-col bg-white flex-grow rounded-tr p-2 shadow-sm overflow-y-auto'
				>
					{view}
				</div>
			) : (
				''
			)}
			<div
				data-testid='inspector-tabs'
				className='flex flex-row rounded-sm gap-0 divide-x divide-gray-300'
			>
				{tabs}
			</div>
		</div>
	)
}

export default InspectorPanel
