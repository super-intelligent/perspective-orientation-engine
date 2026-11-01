import { readFileSync } from 'node:fs'
import { parseInquiry } from '../src/lib/inquiry.ts'

const fixture = JSON.parse(readFileSync(new URL('../tests/fixtures/inquiry-mixed.json', import.meta.url), 'utf8'))
const inquiry = parseInquiry(fixture.inquiry, fixture.claims)
console.log('Synthetic inquiry fixture. Possible orientations, not final conclusions.')
console.log(JSON.stringify(inquiry, null, 2))
console.log('Correction retained; original questions and proposed relationships remain. No acceptance inferred.')
