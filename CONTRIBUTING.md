# Contributing

Open Memome accepts small, sourced changes that improve the map.

## Start here

| Contribution | Use |
| --- | --- |
| New meme | [Candidate form](https://github.com/open-memome/open-memome/issues/new?template=meme-candidate.yml) |
| New or corrected source | [Evidence form](https://github.com/open-memome/open-memome/issues/new?template=evidence.yml) |
| Objection or appeal | [Dispute form](https://github.com/open-memome/open-memome/issues/new?template=dispute.yml) |
| Bug | [Bug report](https://github.com/open-memome/open-memome/issues/new?template=bug.yml) |
| Code or data change | Pull request |

Before proposing a record, read [METHODOLOGY.md](METHODOLOGY.md). Search open and closed issues for aliases or earlier decisions.

## A useful contribution

- Defines one copyable unit in a neutral sentence.
- Links to independent, dated evidence.
- Distinguishes the meme from its carrier, occurrence, host, and effects.
- States uncertainty and contrary evidence.
- Changes one claim at a time.

Large unsourced lists will be closed. One well-scoped record is more useful.

## Review flow

`discovery lead → candidate → documented`

A record may instead become `contested`, `rejected`, or `redirected` to an existing family, variant, carrier, or occurrence.

Maintainers check scope and source relevance. Independent reviewers check whether the evidence supports the claim. Documentation does not end review. Simple vote totals do not decide factual questions. Rationale, source independence, and disagreement remain visible.

## Pull requests

1. Fork the repository and create a focused branch.
2. Make the smallest complete change.
3. Run `npm run validate:data`, `npm run lint`, and `npm test`.
4. Explain what changed, why, and which evidence supports it.
5. Link the issue being resolved.

Generated data must be rebuilt through the scripts that own it. Do not hand-edit generated files without updating the source and regeneration path.

## Conduct

Be precise about claims and generous toward contributors. Critique evidence and scope, not people or communities. Follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
