import { z } from 'zod'
import type { Claim } from '../types/orientation'

const id = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/)
// Check for content without trimming or otherwise rewriting source words.
const text = z.string().refine(value => value.trim().length > 0, 'Must contain text')
const span = z.strictObject({
  source_id: id,
  start: z.number().int().nonnegative(),
  end: z.number().int().positive(),
  quote: text,
})
const actor = z.strictObject({ id, kind: z.enum(['human', 'model', 'analyst']) })
const source = z.strictObject({ id, actor_id: id, locator: text, text })
const question = z.discriminatedUnion('kind', [
  z.strictObject({ id, kind: z.literal('explicit'), text, source: span }),
  z.strictObject({
    id,
    kind: z.literal('inferred'),
    text,
    proposed_by: id,
    basis: z.array(span).min(1),
    rationale: text,
  }),
])
const relationship = z.strictObject({
  id,
  question_id: id,
  target: z.strictObject({ kind: z.enum(['question', 'claim']), id }),
  relation: z.enum(['possibly_underlies', 'possibly_informs']),
  status: z.literal('proposed'),
  proposed_by: id,
  basis: z.array(span).min(1),
  rationale: text,
})
const response = z.strictObject({
  id,
  question_id: id,
  kind: z.enum(['response', 'correction']),
  text,
  source: span,
})
const document = z.strictObject({
  schema_version: z.literal(1),
  id,
  actors: z.array(actor),
  sources: z.array(source),
  questions: z.array(question),
  relationships: z.array(relationship),
  responses: z.array(response),
})

export type InquiryDocument = z.infer<typeof document>
export type InquiryQuestion = InquiryDocument['questions'][number]
export type InquiryRelationship = InquiryDocument['relationships'][number]
type SourceSpan = z.infer<typeof span>
type Path = (string | number)[]

/**
 * Validate a supplied inquiry against an existing orientation's claim IDs.
 * Does not extract questions, authenticate actors, accept interpretations,
 * mutate claims, perform I/O or establish cross-session identity.
 * Throws ZodError with field paths; no repair or silent normalization.
 */
export function parseInquiry(
  input: unknown,
  claims: readonly Pick<Claim, 'id'>[],
): InquiryDocument {
  // Existing full Claim objects are permitted, but only identity is consumed.
  const claimIds = z.array(z.object({ id })).superRefine((values, ctx) => {
    const seen = new Set<string>()
    values.forEach((value, index) => {
      if (seen.has(value.id)) {
        ctx.addIssue({ code: 'custom', path: [index, 'id'], message: 'Duplicate claim ID' })
      }
      seen.add(value.id)
    })
  }).parse(claims).map(claim => claim.id)

  return document.superRefine((value, ctx) => {
    const issue = (path: Path, message: string) => ctx.addIssue({ code: 'custom', path, message })
    for (const key of ['actors', 'sources', 'questions', 'relationships', 'responses'] as const) {
      const seen = new Set<string>()
      value[key].forEach((item, index) => {
        if (seen.has(item.id)) issue([key, index, 'id'], `Duplicate ${key} ID`)
        seen.add(item.id)
      })
    }

    const actors = new Map(value.actors.map(item => [item.id, item]))
    const sources = new Map(value.sources.map(item => [item.id, item]))
    const questions = new Set(value.questions.map(item => item.id))
    const knownClaims = new Set(claimIds)

    const requireActor = (actorId: string, path: Path) => {
      if (!actors.has(actorId)) issue(path, 'Unknown actor')
    }
    const requireQuestion = (questionId: string, path: Path) => {
      if (!questions.has(questionId)) issue(path, 'Unknown question')
    }
    const checkSpan = (reference: SourceSpan, path: Path, humanOnly = false) => {
      const original = sources.get(reference.source_id)
      if (!original) {
        issue([...path, 'source_id'], 'Unknown source')
        return
      }
      if (reference.end <= reference.start || reference.end > original.text.length) {
        issue(path, 'Span must be nonempty and inside the source text')
      } else if (original.text.slice(reference.start, reference.end) !== reference.quote) {
        issue([...path, 'quote'], 'Quote must exactly match the source span')
      }
      if (humanOnly && actors.get(original.actor_id)?.kind !== 'human') {
        issue([...path, 'source_id'], 'Requires a source attributed to a human')
      }
    }

    value.sources.forEach((item, index) => requireActor(item.actor_id, ['sources', index, 'actor_id']))
    value.questions.forEach((item, index) => {
      const path: Path = ['questions', index]
      if (item.kind === 'explicit') {
        checkSpan(item.source, [...path, 'source'], true)
        if (item.text !== item.source.quote) {
          issue([...path, 'text'], 'Explicit question text must equal its source quote')
        }
      } else {
        requireActor(item.proposed_by, [...path, 'proposed_by'])
        item.basis.forEach((basis, n) => checkSpan(basis, [...path, 'basis', n]))
      }
    })
    value.relationships.forEach((item, index) => {
      const path: Path = ['relationships', index]
      requireQuestion(item.question_id, [...path, 'question_id'])
      requireActor(item.proposed_by, [...path, 'proposed_by'])
      item.basis.forEach((basis, n) => checkSpan(basis, [...path, 'basis', n]))
      if (item.target.kind === 'claim') {
        if (!knownClaims.has(item.target.id)) issue([...path, 'target', 'id'], 'Unknown claim')
        if (item.relation !== 'possibly_informs') issue([...path, 'relation'], 'Claim target requires possibly_informs')
      } else {
        requireQuestion(item.target.id, [...path, 'target', 'id'])
        if (item.target.id === item.question_id) issue([...path, 'target', 'id'], 'Question cannot link to itself')
        if (item.relation !== 'possibly_underlies') issue([...path, 'relation'], 'Question target requires possibly_underlies')
      }
    })
    value.responses.forEach((item, index) => {
      const path: Path = ['responses', index]
      requireQuestion(item.question_id, [...path, 'question_id'])
      checkSpan(item.source, [...path, 'source'], true)
      if (item.text !== item.source.quote) issue([...path, 'text'], 'Response text must equal its source quote')
    })
  }).parse(input)
}
