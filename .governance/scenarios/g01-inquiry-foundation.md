# G01 build-facing scenarios

These are public build-facing scenarios. Independent auditor holdouts remain separate.

## Mixed inquiry and a later correction

1. A developer loads the synthetic team-orientation fixture and supplies its existing claim IDs.
2. Running `npm run demo:inquiry` validates and prints the retained inquiry.
3. The explicit question remains an exact human quotation; the inferred question names its proposer, rationale and source basis.
4. Both question-to-question and question-to-claim relationships remain visibly `proposed`.
5. A later human correction remains attached to the earlier question. The correction does not delete that question, its alternative, or its proposed links.
6. Parsing then serializing and parsing again yields the same content. Neither source nor existing claims is mutated.

## Broken provenance and unauthorized certainty

1. A developer changes an explicit quotation while leaving its original source span unchanged, or attributes the source to a model.
2. Validation rejects it, identifying the invalid field. It never silently relabels the entry or repairs text.
3. Changing a proposed relationship to `accepted`, inserting `accepted: true`, pointing it to an absent claim/question, or using the wrong relation for its target also fails.
4. A model-authored response cannot be recorded as a human response/correction.

## Sparse and plural inquiry

1. A claim-only legacy context is supplied with empty questions, relationships and responses.
2. Validation accepts the empty inquiry without inferring a hidden question.
3. A populated fixture adds several links from one question to different claims and several questions to one claim. Validation accepts those links without forcing a single upstream root.
4. All commands complete locally; no request is sent to the extraction route, provider or database.
