# Open Memome data model

## Meme family

A recurring cultural pattern that passes the five-gate test: transmitted, recognizable, recurrent, variable, and traceable.

Required fields: title, neutral definition, type, domain, review state.

## Discovery lead

A catalogue or archive match imported for coverage. It stores a label, description, collection, and source URL. A lead is not yet claimed to be a meme.

## Variant

A mutation that preserves enough of a family to remain recognizable.

Required fields: parent family, distinguishing features, first documented occurrence.

## Occurrence

A dated appearance in a text, object, image, recording, performance, institution, event, or agent interaction.

Required fields: date or range, place or community, carrier, source URL, quotation or description.

## Propagation observation

A measurement of distribution or change.

Required fields: meme or variant, metric, value, date range, geography, channel, host class, population or denominator, and source.

Allowed metrics include reach, velocity, persistence, fidelity, mutation rate, and reproduction rate. A Wikimedia sitelink count is a long-run reach proxy. It is not measured virality.

## Historical view

A record's origin date is not a measure of its later influence. A time slider must aggregate dated propagation observations with comparable metrics. Every plotted value therefore needs a date range, geography, channel, host population, denominator, and source. Missing intervals remain missing rather than being interpolated by default.

## Relationship

An evidence claim between records. Allowed labels: origin, variant, influence, reaction, opposition, reinforcement, co-occurrence, and uncertain.

## Basin

A reviewed cluster of memes that frequently co-occur or reinforce one another in a community, organization, or system. Semantic proximity can suggest a basin but cannot establish it.

## Review

A contributor assessment of one evidence claim. Reviews record the rating, rationale, relevant expertise, source independence, and declared perspective. Minority rationales remain attached after a status is assigned.

## Effects claim

A claim that a meme has a positive, negative, or mixed effect for a stated host and outcome. Valence is never stored as an intrinsic property of the meme.
