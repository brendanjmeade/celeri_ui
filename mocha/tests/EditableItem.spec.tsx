/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import '@testing-library/dom'
import { render, screen } from '@testing-library/react'
import { expect } from 'chai'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react'
import EditableItem from '../../src/Components/EditableItem'

describe('The editable item displays & edits correctly', () => {
	it('Displays the correct buttons', () => {
		render(
			<EditableItem
				title='Editable Item'
				item={{ string: 'hey', number: 1 }}
				setItem={(): void => {}}
				fieldDefinitions={{}}
				deletable={false}
			/>
		)
		expect(screen.getByTestId('editable-item-title').textContent).to.equal(
			'Editable Item'
		)
		expect(
			(screen.getByTestId('input-editor-string') as HTMLInputElement).value
		).to.equal('hey')
		expect(
			(screen.getByTestId('input-editor-string') as HTMLInputElement).type
		).to.equal('text')
		expect(
			(screen.getByTestId('input-editor-number') as HTMLInputElement).value
		).to.equal('1')
		expect(
			(screen.getByTestId('input-editor-number') as HTMLInputElement).type
		).to.equal('number')
	})
})
