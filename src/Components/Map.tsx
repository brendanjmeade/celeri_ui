import mapboxgl, { Map, NavigationControl } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { ReactElement } from 'react'
import { useEffect, useRef, useState } from 'react'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

function MapElement(): ReactElement {
	const mapReference = useRef<HTMLDivElement>(null)
	const [map, setMap] = useState<Map>()
	useEffect(() => {
		if (!map && mapReference.current) {
			const innerMap = new Map({
				container: mapReference.current,
				style: 'mapbox://styles/mapbox/streets-v11',
				// eslint-disable-next-line @typescript-eslint/no-magic-numbers
				center: [-74.5, 40],
				// eslint-disable-next-line @typescript-eslint/no-magic-numbers
				zoom: 9
			})
			innerMap.addControl(new NavigationControl())
			setMap(innerMap)
		}
	}, [map])
	return <div className='w-full h-full' ref={mapReference} />
}

export default MapElement
