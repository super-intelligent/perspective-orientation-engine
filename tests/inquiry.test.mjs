import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { ZodError } from 'zod'
import { parseInquiry } from '../src/lib/inquiry.ts'

const fixture = JSON.parse(readFileSync(new URL('./fixtures/inquiry-mixed.json', import.meta.url), 'utf8'))
const fresh = () => structuredClone(fixture.inquiry)
const parse = input => parseInquiry(input, fixture.claims)
function rejects(change, pathPart) {
  const input = fresh()
  parse(input)
  change(input)
  assert.throws(() => parse(input), error => {
    assert.ok(error instanceof ZodError)
    assert.ok(error.issues.some(issue => issue.path.includes(pathPart)), JSON.stringify(error.issues))
    return true
  })
}

test('mixed inquiry preserves human words, inferred alternative, correction and proposal status', () => {
  const result = parse(fresh())
  assert.equal(result.questions[0].kind, 'explicit')
  assert.equal(result.questions[0].text, fixture.inquiry.sources[0].text)
  assert.equal(result.questions[1].kind, 'inferred')
  assert.equal(result.questions[1].proposed_by, 'interpreter-1')
  assert.equal(result.responses[0].question_id, 'q2')
  assert.equal(result.responses[0].kind, 'correction')
  assert.equal(result.relationships.length, 2)
  assert.ok(result.relationships.every(link => link.status === 'proposed'))
  assert.deepEqual(parse(JSON.parse(JSON.stringify(result))), result)
})

test('parse copies input and never mutates existing claims', () => {
  const input = fresh()
  const before = structuredClone(input)
  const claims = structuredClone(fixture.claims)
  const result = parseInquiry(input, claims)
  assert.deepEqual(input, before)
  assert.deepEqual(claims, fixture.claims)
  result.questions[0].text = 'A later consumer edit'
  result.sources[0].text = 'A later source edit'
  assert.deepEqual(input, before)
})

test('empty inquiry is valid and does not turn inferred claims into questions', () => {
  const input = { schema_version: 1, id: 'empty', actors: [], sources: [], questions: [], relationships: [], responses: [] }
  assert.deepEqual(parseInquiry(input, fixture.claims), input)
  assert.deepEqual(parseInquiry(input, []), input)
})

test('many-to-many links retain separate question and claim identities', () => {
  const input = fresh()
  const link = input.relationships[1]
  input.relationships.push({ ...structuredClone(link), id: 'link-3', question_id: 'q1' })
  input.relationships.push({ ...structuredClone(link), id: 'link-4', target: { kind: 'claim', id: 'c2' } })
  assert.equal(parse(input).relationships.length, 4)
  // A claim ID and a question ID may have the same spelling; target kind disambiguates.
  input.questions[0].id = 'c1'
  input.relationships[0].target.id = 'c1'
  input.relationships[2].question_id = 'c1'
  assert.equal(parse(input).relationships[2].target.kind, 'claim')
})

test('a human may propose an inferred question without making it explicit', () => {
  const input = fresh()
  input.questions[1].proposed_by = 'person-1'
  assert.equal(parse(input).questions[1].kind, 'inferred')
})

test('question punctuation is not a classifier; non-question-mark inquiry can be retained', () => {
  const input = fresh()
  const words = 'Tell me what I am missing'
  input.sources[0].text = words
  input.questions[0].text = words
  const reference = { source_id: 's1', start: 0, end: words.length, quote: words }
  input.questions[0].source = reference
  input.questions[1].basis = [reference]
  input.relationships.forEach(link => { link.basis = [reference] })
  assert.equal(parse(input).questions[0].text, words)
})

test('UTF-16 offsets preserve emoji, leading whitespace and repeated occurrences', () => {
  const input = fresh()
  const words = '  Where next?'
  const prefix = '🧭 Where next?\n'
  input.sources[0].text = prefix + words
  const reference = { source_id: 's1', start: prefix.length, end: prefix.length + words.length, quote: words }
  input.questions[0].text = words
  input.questions[0].source = reference
  input.questions[1].basis = [reference]
  input.relationships.forEach(link => { link.basis = [reference] })
  assert.deepEqual(parse(input).questions[0].source, reference)
})

test('source arrays and ID references do not depend on collection ordering', () => {
  const input = fresh()
  input.actors.reverse()
  input.sources.reverse()
  input.questions.reverse()
  assert.deepEqual(parse(input), input)
})

for (const [label, change, path] of [
  ['altered explicit text', value => { value.questions[0].text = 'Why is my team failing?' }, 'text'],
  ['altered source quote', value => { value.questions[0].source.quote = 'invented' }, 'quote'],
  ['negative offset', value => { value.questions[0].source.start = -1 }, 'start'],
  ['fractional offset', value => { value.questions[0].source.start = 0.5 }, 'start'],
  ['reversed offset', value => { value.questions[0].source.start = 35 }, 'source'],
  ['out-of-bounds offset', value => { value.questions[0].source.end = 500 }, 'source'],
  ['missing source', value => { value.questions[1].basis[0].source_id = 'absent' }, 'source_id'],
  ['model-attributed explicit question', value => { value.sources[0].actor_id = 'interpreter-1' }, 'source_id'],
  ['model-attributed correction', value => { value.sources[1].actor_id = 'interpreter-1' }, 'source_id'],
  ['altered correction text', value => { value.responses[0].text = 'Agreed' }, 'text'],
  ['missing source actor', value => { value.sources[1].actor_id = 'absent' }, 'actor_id'],
  ['missing inferred proposer', value => { value.questions[1].proposed_by = 'absent' }, 'proposed_by'],
  ['missing link proposer', value => { value.relationships[0].proposed_by = 'absent' }, 'proposed_by'],
  ['empty inference basis', value => { value.questions[1].basis = [] }, 'basis'],
  ['empty link basis', value => { value.relationships[0].basis = [] }, 'basis'],
  ['empty rationale', value => { value.questions[1].rationale = '  ' }, 'rationale'],
  ['dangling claim', value => { value.relationships[1].target.id = 'absent' }, 'id'],
  ['dangling target question', value => { value.relationships[0].target.id = 'absent' }, 'id'],
  ['dangling source question', value => { value.relationships[0].question_id = 'absent' }, 'question_id'],
  ['dangling response question', value => { value.responses[0].question_id = 'absent' }, 'question_id'],
  ['question self-link', value => { value.relationships[0].target.id = 'q2' }, 'id'],
  ['wrong claim relation', value => { value.relationships[1].relation = 'possibly_underlies' }, 'relation'],
  ['wrong question relation', value => { value.relationships[0].relation = 'possibly_informs' }, 'relation'],
  ['accepted relationship', value => { value.relationships[0].status = 'accepted' }, 'status'],
  ['invented question acceptance', value => { value.questions[1].accepted = true }, 'questions'],
  ['invented response acceptance', value => { value.responses[0].accepted = true }, 'responses'],
  ['invented document acceptance', value => { value.accepted = true }, undefined],
  ['unsupported schema version', value => { value.schema_version = 2 }, 'schema_version'],
]) {
  test(`rejects ${label}`, () => {
    if (path === undefined) {
      const input = fresh()
      change(input)
      assert.throws(() => parse(input), ZodError)
    } else {
      rejects(change, path)
    }
  })
}

for (const key of ['actors', 'sources', 'questions', 'relationships', 'responses']) {
  test(`rejects duplicate ${key} IDs`, () => rejects(input => { input[key].push(structuredClone(input[key][0])) }, 'id'))
}

test('rejects duplicate and invalid claim context IDs instead of resolving ambiguously', () => {
  assert.throws(() => parseInquiry(fresh(), [{ id: 'c1' }, { id: 'c1' }]), ZodError)
  assert.throws(() => parseInquiry(fresh(), [{ id: '' }]), ZodError)
})
