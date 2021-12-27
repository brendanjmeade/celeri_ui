import { expect } from 'chai'
import type { FileName } from '../../src/Utilities/FileSystemInterfaces'
import OpenDirectory from '../../src/Utilities/InMemoryFileSystem'
import { createSegment, SegmentFile } from '../../src/Utilities/SegmentFile'

describe('File Openers Work as Expected', () => {
	it('Can Open Segment Files Properly', async () => {
		const directoryStructure = {
			root: {
				'segment.csv': `name,lon1,lat1,lon2,lat2,dip,res,other3,other6,other7,other8,other9,other10,other11,other12,locking_depth,locking_depth_sig,locking_depth_flag,dip_sig,dip_flag,ss_rate,ss_rate_sig,ss_rate_flag,ds_rate,ds_rate_sig,ds_rate_flag,ts_rate,ts_rate_sig,ts_rate_flag,burial_depth,burial_depth_sig,burial_depth_flag,resolution_override,resolution_other,patch_file_name,patch_flag,patch_slip_file,patch_slip_flag,
BRa                                                                ,247.087,43.873,247.764,42.286,90,100,0,0,0,0,0,0,0,0,15,5,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
BRb                                                                ,245.927,44.722,247.087,43.873,90,100,0,0,0,0,0,0,0,0,15,5,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,`
			}
		}
		const directory = await OpenDirectory(directoryStructure)
		const file = await directory.getFile('segment.csv' as FileName)
		const segment = new SegmentFile(file)
		await segment.initialize()
		if (segment.data) {
			expect(segment.data[0].name).to.contain('BRa')
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			expect(segment.data[1].name).to.contain('BRb')
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			expect(segment.data).to.have.length(2)
		} else {
			expect(segment.data).to.not.be.undefined
		}
	})
	it('Can Write Segment Files Properly', async () => {
		const directoryStructure = {
			root: {
				'segment.csv': `name,lon1,lat1,lon2,lat2,dip,res,other3,other6,other7,other8,other9,other10,other11,other12,locking_depth,locking_depth_sig,locking_depth_flag,dip_sig,dip_flag,ss_rate,ss_rate_sig,ss_rate_flag,ds_rate,ds_rate_sig,ds_rate_flag,ts_rate,ts_rate_sig,ts_rate_flag,burial_depth,burial_depth_sig,burial_depth_flag,resolution_override,resolution_other,patch_file_name,patch_flag,patch_slip_file,patch_slip_flag,`
			}
		}
		const directory = await OpenDirectory(directoryStructure)
		const file = await directory.getFile('segment.csv' as FileName)
		const segment = new SegmentFile(file)
		await segment.initialize()
		if (segment.data) {
			expect(segment.data).to.have.length(0)
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			const test = createSegment({ name: 'test', lon1: 100 })
			segment.data = [test]
			await segment.save()
			expect(directoryStructure.root['segment.csv']).to.contain('test,100')
		} else {
			expect(segment.data).to.not.be.undefined
		}
	})
})
