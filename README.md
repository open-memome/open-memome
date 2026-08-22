# Open Memome

**A public, evidence-based map of the memes humans transmit.**

[Explore the map](https://open-memome.cocoa-toast-3272.chatgpt.site) · [Propose a meme](https://github.com/open-memome/open-memome/issues/new?template=meme-candidate.yml) · [Review the queue](https://github.com/open-memome/open-memome/issues) · [Read the method](METHODOLOGY.md)

## What is a memome?

Open Memome uses **memome** to mean the set of memes present in a population, together with their variants and relationships.

A meme is a learned cultural unit that recurs in recognizable form: a belief, narrative, rule, practice, frame, symbol, technique, style, slogan, or joke. A memome is the larger system those units form.

The term has appeared in memetics and cultural-evolution research, but it has no single settled scientific definition. This project therefore states its working definition and tests every record against public rules.

## Why this exists

Ideas spread, mutate, reinforce one another, and sometimes trap people inside intellectual basins. We have many catalogues of books, beliefs, trends, and internet memes. We do not have a shared map that connects cultural units across domains and shows the evidence for how they move.

The immediate spark came from [Alexander Wissner-Gross's challenge in a Moonshots episode](https://youtu.be/TaJH0D2FKN8?t=3342): build a Human Memome Project that maps memes and mind viruses, then studies how quickly they propagate. Open Memome is an independent, open-source attempt to make that idea testable and useful.

## What belongs on the map?

A candidate should pass five checks:

1. **Transmitted:** learned from another person, group, artifact, or system.
2. **Recognizable:** the copied content can be stated in one neutral sentence.
3. **Recurrent:** found in at least two independent occurrences.
4. **Variable:** able to change while remaining recognizably related.
5. **Traceable:** supported by dated evidence of movement or persistence.

People, products, organizations, events, places, and broad subjects are usually carriers or contexts. Popularity alone does not make something a meme.

These checks are an operational synthesis, not a claimed scientific consensus. Their basis and limitations are documented in [METHODOLOGY.md](METHODOLOGY.md).

## How to contribute

Choose one small, reviewable task:

- [Propose a meme](https://github.com/open-memome/open-memome/issues/new?template=meme-candidate.yml)
- [Add evidence to a record](https://github.com/open-memome/open-memome/issues/new?template=evidence.yml)
- [Challenge a decision](https://github.com/open-memome/open-memome/issues/new?template=dispute.yml)
- [Fix the code or data](CONTRIBUTING.md)

New accepted contributions keep their sources, discussion, reviewer rationale, and version history. Discovery leads remain outside the default map until they pass review.

## Current status

Open Memome is an early public alpha. The semantic canvas and a small documented corpus work today. Here, `documented` means that at least two dated sources are attached; it does not mean that community review is complete. Thousands of catalogue matches remain unassessed in a separate discovery backlog. Counts describe coverage work, not verified memes.

Bubble size currently uses Wikimedia sitelinks as a reproducible long-run footprint proxy. It does not measure present-day virality. Records without a comparable reach source remain explicitly unscored.

## Repository map

- `app/`: interface, reviewed records, and generated map data
- `scripts/`: import, mapping, and validation pipelines
- `public/memome-candidates.*`: discovery dataset exports
- `METHODOLOGY.md`: scope, evidence rules, metrics, and limitations
- `DATA_MODEL.md`: record types and required fields
- `GOVERNANCE.md`: roles, decisions, disputes, and releases
- `CONTRIBUTING.md`: contribution workflow

## Development

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run validate:data
npm run lint
npm test
```

Code is licensed under the [MIT License](LICENSE). Project-authored data is released under [CC0 1.0](DATA_LICENSE.md). Imported records retain their source attribution and licence.
