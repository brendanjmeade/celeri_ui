import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import mapboxgl, { Map, NavigationControl } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { ReactElement } from 'react'
import { useEffect, useRef, useState } from 'react'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

function MapElement(): ReactElement {
	const mapReference = useRef<HTMLDivElement>(null)
	const [map, setMap] = useState<Map>()
	const [draw, setDraw] = useState<MapboxDraw>()
	useEffect(() => {
		if (!map && mapboxgl.accessToken && mapReference.current) {
			const innerMap = new Map({
				container: mapReference.current,
				style: 'mapbox://styles/mapbox/streets-v11',
				// eslint-disable-next-line @typescript-eslint/no-magic-numbers
				center: [0, 0],
				// eslint-disable-next-line @typescript-eslint/no-magic-numbers
				zoom: 2
			})
			innerMap.addControl(new NavigationControl())
			const innerDraw = new MapboxDraw({})
			innerMap.addControl(innerDraw)
			setMap(innerMap)
			setDraw(innerDraw)
		}
	}, [map, draw])
	return <div className='w-full h-full' ref={mapReference} />
}

export default MapElement
