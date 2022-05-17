import '@testing-library/dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { expect } from 'chai'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react'
import InspectorPanel from '../../src/Components/InspectorPanelBase'

describe('The inspector panel can display multiple tabs and their content', () => {
	it('Displays the correct buttons', () => {
		render(
			<InspectorPanel
				view={<span />}
				buttons={{ tab1: 'Tab 1', tab2: 'Tab 2' }}
				active=''
				setActive={(): void => {}}
			/>
		)
		expect(screen.getByTestId('tab-tab1').textContent).to.equal('Tab 1')
		expect(screen.getByTestId('tab-tab2').textContent).to.equal('Tab 2')
	})
	it('Can change the active panel when clicked', () => {
		let active = ''
		const { rerender } = render(
			<InspectorPanel
				view={<span>{active}</span>}
				buttons={{ tab1: 'Tab 1', tab2: 'Tab 2' }}
				active={active}
				setActive={(a): void => {
					active = a
				}}
			/>
		)
		expect(screen.queryAllByTestId('inspector-view')).to.have.lengthOf(0)
		fireEvent.click(screen.getByTestId('tab-tab1'))
		rerender(
			<InspectorPanel
				view={<span>{active}</span>}
				buttons={{ tab1: 'Tab 1', tab2: 'Tab 2' }}
				active={active}
				setActive={(a): void => {
					active = a
				}}
			/>
		)
		expect(screen.getByTestId('inspector-view').textContent).to.equal(active)
	})
	it('Closes the view when the active tab is clicked', () => {
		let active = 'tab1'
		const { rerender } = render(
			<InspectorPanel
				view={<span>{active}</span>}
				buttons={{ tab1: 'Tab 1', tab2: 'Tab 2' }}
				active={active}
				setActive={(a): void => {
					active = a
				}}
			/>
		)
		expect(screen.getByTestId('inspector-view').textContent).to.equal(active)
		fireEvent.click(screen.getByTestId('tab-tab1'))
		rerender(
			<InspectorPanel
				view={<span>{active}</span>}
				buttons={{ tab1: 'Tab 1', tab2: 'Tab 2' }}
				active={active}
				setActive={(a): void => {
					active = a
				}}
			/>
		)
		expect(screen.queryAllByTestId('inspector-view')).to.have.lengthOf(0)
	})
})
