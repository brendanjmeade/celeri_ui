import type { ReactElement } from 'react'
import { useState } from 'react'

export interface MapStyle {
	user: string
	styleId: string
}

export interface MapSettings {
	currentStyle: MapStyle
	currentStyleName: string
	savedStyles: Record<string, MapStyle>
}

const defaultMapSettings: MapSettings = {
	currentStyle: { user: 'mapbox-public', styleId: 'ckngin2db09as17p84ejhe24y' },
	currentStyleName: 'default',
	savedStyles: {
		default: { user: 'mapbox-public', styleId: 'ckngin2db09as17p84ejhe24y' },
		'Hill Shaded': { user: 'mapbox', styleId: 'outdoors-v11' },
		'Political Light': { user: 'mapbox', styleId: 'light-v10' },
		'Political Dark': { user: 'mapbox', styleId: 'dark-v10' }
	}
}

export const initialMapSettings = ((): MapSettings => {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	const settings = {
		...defaultMapSettings,
		...(JSON.parse(
			window.localStorage.getItem('mapSettings') ?? '{}'
		) as MapSettings)
	}
	settings.savedStyles = {
		...settings.savedStyles,
		...defaultMapSettings.savedStyles
	}
	return settings
})()

export function MapSettingsPanel({
	settings,
	setSettings
}: {
	settings: MapSettings
	setSettings: (settings: MapSettings) => void
}): ReactElement {
	const [currentStyleName, setCurrentStyleName] = useState('')
	const [currentStyleUser, setCurrentStyleUser] = useState('')
	const [currentStyleId, setCurrentStyleId] = useState('')

	const set = (s: MapSettings): void => {
		setSettings(s)
		window.localStorage.setItem('mapSettings', JSON.stringify(s))
	}

	return (
		<div className='flex flex-col gap-2'>
			<div className='flex flex-row justify-between items-center'>
				<span className='text-l font-bold'>Select Style</span>
				<span className='w-2/5 flex-shrink-0'>
					<select
						className='bg-gray-800 w-full'
						value={settings.currentStyleName}
						onChange={(event): void => {
							const name = event.target.value
							if (name === '***CUSTOM') {
								setCurrentStyleName('')
								setCurrentStyleId(settings.savedStyles.default.styleId)
								setCurrentStyleUser(settings.savedStyles.default.user)
								set({
									...settings,
									currentStyleName: '',
									currentStyle: settings.savedStyles.default
								})
							} else {
								const style = settings.savedStyles[name]
								setCurrentStyleName(name)
								setCurrentStyleId(style.styleId)
								setCurrentStyleUser(style.user)
								set({
									...settings,
									currentStyleName: name,
									currentStyle: style
								})
							}
						}}
					>
						<option value='***CUSTOM'>Custom</option>
						{Object.keys(settings.savedStyles).map(key => (
							<option key={key} value={key}>
								{key}
							</option>
						))}
					</select>
				</span>
			</div>
			{!(settings.currentStyleName in defaultMapSettings.savedStyles) ? (
				<>
					<div className='flex flex-row justify-between items-center'>
						<span className='text-l font-bold'>Style Name</span>
						<span className='w-2/5 flex-shrink-0'>
							<input
								className='bg-gray-800 w-full'
								type='text'
								value={currentStyleName}
								onChange={(event): void => {
									setCurrentStyleName(event.target.value)
								}}
							/>
						</span>

						<button
							type='button'
							className='flex-grow-0 bg-gray-700 hover:bg-gray-800 p-2 shaddow-inner'
							onClick={(): void => {
								if (
									currentStyleName &&
									!(currentStyleName in defaultMapSettings.savedStyles)
								) {
									set({
										currentStyle: {
											user: currentStyleUser,
											styleId: currentStyleId
										},
										currentStyleName,
										savedStyles: {
											...settings.savedStyles,
											[currentStyleName]: {
												user: currentStyleUser,
												styleId: currentStyleId
											}
										}
									})
								}
							}}
						>
							Save Style
						</button>
						<button
							type='button'
							className='flex-grow-0 bg-gray-700 hover:bg-gray-800 p-2 shaddow-inner'
							onClick={(): void => {
								if (
									currentStyleName &&
									currentStyleName in settings.savedStyles &&
									!(currentStyleName in defaultMapSettings.savedStyles)
								) {
									const updateSavedStyles: Record<string, MapStyle> = {}
									for (const key of Object.keys(settings.savedStyles)) {
										if (key !== currentStyleName) {
											updateSavedStyles[key] = settings.savedStyles[key]
										}
									}
									set({
										currentStyle: updateSavedStyles.default,
										currentStyleName: 'default',
										savedStyles: updateSavedStyles
									})
								}
							}}
						>
							Delete Style
						</button>
					</div>
					<div className='flex flex-row justify-between items-center'>
						<span className='text-l font-bold'>User</span>
						<span className='w-2/5 flex-shrink-0'>
							<input
								className='bg-gray-800 w-full'
								type='text'
								value={currentStyleUser}
								onChange={(event): void => {
									setCurrentStyleUser(event.target.value)
								}}
							/>
						</span>
						<span className='text-l font-bold'>Style Id</span>
						<span className='w-2/5 flex-shrink-0'>
							<input
								className='bg-gray-800 w-full'
								type='text'
								value={currentStyleId}
								onChange={(event): void => {
									setCurrentStyleId(event.target.value)
								}}
							/>
						</span>
					</div>
					<div>
						Adding a custom mapbox style:
						<ul>
							<li>
								If you are creating a new style, go to{' '}
								<a href='https://www.mapbox.com/mapbox-studio'>Mapbox Studio</a>
								, create the style there, and then provide your user &amp; the
								style&apos;s Id
							</li>
							<li>
								If you wish to use an existing style, you must figure out the
								user &amp; style id. If you found the style URL, you can read it
								from there: mapbox://styles/*user*/*style id*
							</li>
						</ul>
					</div>
				</>
			) : (
				<></>
			)}
		</div>
	)
}
