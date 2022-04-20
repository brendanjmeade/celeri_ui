/* eslint-disable @typescript-eslint/no-magic-numbers */
import { expect } from 'chai'
import { SelectionModeSelector } from '../../src/Selectors/SelectionMode'

describe('The Selection Mode', () => {
	it('can set a normal selection', () => {
		const selection = {
			type: '',
			value: [0],
			tab: ''
		}
		const select = SelectionModeSelector({
			mode: 'normal',
			setActiveTab: v => {
				selection.tab = v
			},
			setSelectedBlock: v => {
				selection.type = 'block'
				selection.value = v
			},
			setSelectedSegment: v => {
				selection.type = 'segment'
				selection.value = v
			},
			setSelectedVelocity: v => {
				selection.type = 'velocities'
				selection.value = v
			},
			setSelectedVertex: v => {
				selection.type = 'vertex'
				selection.value = v
			}
		})
		select('vertex', [4, 5])
		expect(selection.tab).to.equal('vertex')
		expect(selection.type).to.equal('vertex')
		expect(selection.value).to.have.length(2)
		expect(selection.value[0]).to.equal(4)
		expect(selection.value[1]).to.equal(5)
	})
	it('can set a selection override', () => {
		const selection = {
			type: '',
			value: [0],
			tab: ''
		}
		const select = SelectionModeSelector({
			mode: {
				label: 'test',
				mode: 'override',
				type: 'test',
				callback: v => {
					selection.value = v
					selection.type = 'overridden'
				}
			},
			setActiveTab: v => {
				selection.tab = v
			},
			setSelectedBlock: v => {
				selection.type = 'block'
				selection.value = v
			},
			setSelectedSegment: v => {
				selection.type = 'segment'
				selection.value = v
			},
			setSelectedVelocity: v => {
				selection.type = 'velocities'
				selection.value = v
			},
			setSelectedVertex: v => {
				selection.type = 'vertex'
				selection.value = v
			}
		})
		select('test', [4, 5])
		expect(selection.tab).to.equal('')
		expect(selection.type).to.equal('overridden')
		expect(selection.value).to.have.length(2)
		expect(selection.value[0]).to.equal(4)
		expect(selection.value[1]).to.equal(5)
	})
	it('can set a map click - which ignores select calls', () => {
		const selection = {
			type: '',
			value: [0],
			tab: ''
		}
		const select = SelectionModeSelector({
			mode: {
				label: 'test',
				mode: 'mapClick',
				callback: v => {
					selection.value = [v.lat, v.lon]
					selection.type = 'overridden'
				}
			},
			setActiveTab: v => {
				selection.tab = v
			},
			setSelectedBlock: v => {
				selection.type = 'block'
				selection.value = v
			},
			setSelectedSegment: v => {
				selection.type = 'segment'
				selection.value = v
			},
			setSelectedVelocity: v => {
				selection.type = 'velocities'
				selection.value = v
			},
			setSelectedVertex: v => {
				selection.type = 'vertex'
				selection.value = v
			}
		})
		select('test', [4, 5])
		expect(selection.tab).to.equal('')
		expect(selection.type).to.equal('')
		expect(selection.value).to.have.length(1)
	})
})
