"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { candidateRecords } from "./corpus.generated";
import { domains, events, memes, sources } from "./data";
import {
  documentedRecords,
  statusOverrides,
  type RecordDocumentation,
} from "./documented";
import MemomeCanvas from "./MemomeCanvas";

type View = "map" | "index" | "evidence" | "project";
type RecordState =
  | "Discovery lead"
  | "Candidate"
  | "Documented"
  | "Probable"
  | "Contested";
type EvidenceFilter =
  | "All layers"
  | "Expanded map"
  | "Candidate layer"
  | "Discovery leads"
  | "Starting source"
  | "Missing source"
  | "Documented only";
type IndexRecord = {
  id: string;
  title: string;
  summary: string;
  domain: string;
  kind: string;
  state: RecordState;
  era: string;
  region: string;
  sourceUrl: string;
  sourceLabel: string;
  collection: string;
  reach: number | null;
  level: string;
  documentation?: RecordDocumentation;
};

const GITHUB = "https://github.com/open-memome/open-memome";
const candidateIssue = `${GITHUB}/issues/new?template=meme-candidate.yml`;
const evidenceIssue = `${GITHUB}/issues/new?template=evidence.yml`;
const normalizeTitle = (title: string) =>
  title
    .trim()
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
const importedByTitle = new Map(
  candidateRecords.map((record) => [normalizeTitle(record.title), record]),
);
const handTitles = new Set(memes.map((record) => normalizeTitle(record.title)));

const handRecords: IndexRecord[] = memes.map((m) => {
  const imported = importedByTitle.get(normalizeTitle(m.title));
  const documentation = imported ? documentedRecords[imported.id] : undefined;
  return {
    id: m.id,
    title: m.title,
    summary: m.summary,
    domain: m.domain,
    kind: m.kind,
    state: documentation ? "Documented" : "Candidate",
    era: documentation?.period || m.era,
    region: documentation?.region || m.region,
    sourceUrl: documentation?.evidence[0]?.url || imported?.sourceUrl || "",
    sourceLabel: documentation
      ? `${documentation.evidence.length} attached sources`
      : imported?.source || "Evidence needed",
    collection: "Curated seed",
    reach: imported?.reach ?? null,
    level: documentation?.level || "Candidate unit",
    documentation,
  };
});

const importedRecords: IndexRecord[] = candidateRecords
  .filter((r) => !handTitles.has(normalizeTitle(r.title)))
  .map((r) => {
    const documentation = documentedRecords[r.id];
    return {
      id: r.id,
      title: r.title,
      summary: r.summary,
      domain: r.domain,
      kind: r.kind,
      state: documentation ? "Documented" : statusOverrides[r.id] || r.status,
      era: documentation?.period || "To be documented",
      region: documentation?.region || "To be documented",
      sourceUrl: documentation?.evidence[0]?.url || r.sourceUrl,
      sourceLabel: documentation
        ? `${documentation.evidence.length} attached sources`
        : r.source,
      collection: r.collection,
      reach: r.reach,
      level:
        documentation?.level ||
        (statusOverrides[r.id]
          ? "Broad subject"
          : r.status === "Discovery lead"
            ? "Discovery lead"
            : "Candidate unit"),
      documentation,
    };
  });

const records = [...handRecords, ...importedRecords];
const scopedRecords = records.filter(
  (record) => record.state !== "Discovery lead",
);
const discoveryNoise =
  /\b(company|organization|business|brand|person|politician|actor|singer|athlete|city|town|village|country|region|province|district|island|river|mountain|film|album|song|novel|book|television series|video game|fictional character|disease|syndrome|disorder|medical condition|drug|gene|protein|cell line|species|aircraft|satellite|locomotive|rolling stock)\b/i;
const balancedDiscoveryIds = new Set(
  domains.flatMap((domainName) =>
    importedRecords
      .filter(
        (record) =>
          record.domain === domainName &&
          record.state === "Discovery lead" &&
          (record.reach ?? 0) >= 8 &&
          !discoveryNoise.test(`${record.title} ${record.summary}`),
      )
      .sort(
        (a, b) =>
          (b.reach ?? 0) - (a.reach ?? 0) ||
          a.title.localeCompare(b.title),
      )
      .slice(0, 55)
      .map((record) => record.id),
  ),
);
for (const record of importedRecords) {
  if (
    record.state === "Discovery lead" &&
    record.collection === "Internet memes" &&
    (record.reach ?? 0) >= 5 &&
    !discoveryNoise.test(`${record.title} ${record.summary}`)
  ) {
    balancedDiscoveryIds.add(record.id);
  }
}
const expandedRecordIds = new Set([
  ...scopedRecords.map((record) => record.id),
  ...balancedDiscoveryIds,
]);
const expandedRecords = records.filter((record) =>
  expandedRecordIds.has(record.id),
);
const scopedCoverage = domains.map((name) => ({
  name,
  count: scopedRecords.filter((record) => record.domain === name).length,
}));
const scopedCoverageMax = Math.max(
  ...scopedCoverage.map((item) => item.count),
);

function evidenceMatches(record: IndexRecord, evidence: EvidenceFilter) {
  if (evidence === "Expanded map") return expandedRecordIds.has(record.id);
  if (evidence === "Candidate layer") return record.state !== "Discovery lead";
  if (evidence === "Discovery leads") return record.state === "Discovery lead";
  if (evidence === "Starting source") return Boolean(record.sourceUrl);
  if (evidence === "Missing source") return !record.sourceUrl;
  if (evidence === "Documented only") return record.state === "Documented";
  return true;
}
function matches(
  record: IndexRecord,
  query: string,
  domain: string,
  kind: string,
  evidence: EvidenceFilter,
) {
  const text =
    `${record.title} ${record.summary} ${record.region} ${record.era} ${record.collection}`.toLowerCase();
  return (
    (domain === "All domains" || record.domain === domain) &&
    (kind === "All types" || record.kind === kind) &&
    evidenceMatches(record, evidence) &&
    text.includes(query.toLowerCase())
  );
}
const domainColors: Record<string, string> = {
  "Belief & cosmology": "violet",
  "Governance & power": "red",
  "Economy & exchange": "yellow",
  "Identity & belonging": "pink",
  "Ethics & social order": "green",
  "Knowledge & truth": "blue",
  "Technology & progress": "cyan",
  "Health & body": "orange",
  "Family & kinship": "coral",
  "Nature & ecology": "leaf",
  "Culture & aesthetics": "purple",
  "Digital culture": "lime",
};

function Icon({ name }: { name: "search" | "plus" | "arrow" | "download" }) {
  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    download: <path d="M12 3v12m-5-5 5 5 5-5M5 20h14" />,
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function State({ value }: { value: RecordState }) {
  return (
    <span className={`state ${value.toLowerCase().replace(/\s+/g, "-")}`}>
      {value}
    </span>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("map");
  const [active, setActive] = useState(records[0].id);
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("All domains");
  const [kind, setKind] = useState("All types");
  const [evidence, setEvidence] = useState<EvidenceFilter>("Expanded map");
  const [limit, setLimit] = useState(60);

  const current = records.find((r) => r.id === active) || records[0];
  const filtered = useMemo(
    () =>
      records.filter((record) =>
        matches(record, query, domain, kind, evidence),
      ),
    [query, domain, kind, evidence],
  );
  const highlightIds = useMemo(
    () => new Set(filtered.map((r) => r.id)),
    [filtered],
  );
  const visibleIds = useMemo(
    () =>
      new Set(
        records
          .filter((record) => evidenceMatches(record, evidence))
          .map((r) => r.id),
      ),
    [evidence],
  );
  const visibleCoverage = useMemo(
    () =>
      domains.map((name) => ({
        name,
        count: records.filter(
          (record) => record.domain === name && visibleIds.has(record.id),
        ).length,
      })),
    [visibleIds],
  );

  function selectFirst(
    nextQuery: string,
    nextDomain: string,
    nextKind: string,
    nextEvidence: EvidenceFilter,
  ) {
    const first = records.find((record) =>
      matches(record, nextQuery, nextDomain, nextKind, nextEvidence),
    );
    if (first) setActive(first.id);
  }
  function updateQuery(value: string) {
    setQuery(value);
    selectFirst(value, domain, kind, evidence);
  }
  function updateDomain(value: string) {
    setDomain(value);
    selectFirst(query, value, kind, evidence);
  }
  function updateKind(value: string) {
    setKind(value);
    selectFirst(query, domain, value, evidence);
  }
  function updateEvidence(value: EvidenceFilter) {
    setEvidence(value);
    selectFirst(query, domain, kind, value);
  }

  function changeView(next: View) {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openRecord(id: string) {
    const record = records.find((item) => item.id === id);
    if (record?.state === "Discovery lead") setEvidence("Discovery leads");
    setActive(id);
    setView("map");
    window.scrollTo({ top: 310, behavior: "smooth" });
  }
  function evidenceUrl(record: IndexRecord) {
    return `${evidenceIssue}&title=${encodeURIComponent(`Evidence: ${record.title}`)}`;
  }

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => changeView("map")}>
          <span className="mark">M</span>
          <span>OPEN MEMOME</span>
          <small>THE HUMAN MEME MAP</small>
        </button>
        <nav>
          {(
            [
              { id: "map", label: "Map" },
              { id: "index", label: "Index" },
              { id: "evidence", label: "Method" },
              { id: "project", label: "Contribute" },
            ] as { id: View; label: string }[]
          ).map((item) => (
            <button
              className={view === item.id ? "active" : ""}
              onClick={() => changeView(item.id)}
              key={item.id}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <a
          className="contribute"
          href={candidateIssue}
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="plus" />
          Propose a meme
        </a>
      </header>

      {view === "map" && (
        <>
          <section className="pitch">
            <div className="pitch-main">
              <p className="eyebrow">
                {expandedRecords.length.toLocaleString()} visible by default ·{" "}
                {scopedRecords.length.toLocaleString()} scoped · 12 domains
              </p>
              <h1>The open map of humanity&apos;s memes.</h1>
              <p>
                <strong>
                  A memome is the set of memes present in a population, together
                  with their variants and relationships.
                </strong>{" "}
                Explore the beliefs, practices, narratives, rules, symbols and
                frames people learn from one another. Nearby points share
                meaning. Bubble size estimates long-run cultural footprint.
              </p>
              <div className="pitch-actions">
                <button
                  onClick={() =>
                    document
                      .getElementById("memome-map")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Explore the map <Icon name="arrow" />
                </button>
                <a href={candidateIssue} target="_blank" rel="noreferrer">
                  Propose a meme
                </a>
                <a href={GITHUB} target="_blank" rel="noreferrer">
                  GitHub <Icon name="arrow" />
                </a>
              </div>
              <p className="origin-line">
                Inspired by{" "}
                <a
                  href="https://youtu.be/TaJH0D2FKN8?t=3342"
                  target="_blank"
                  rel="noreferrer"
                >
                  Alexander Wissner-Gross&apos;s Human Memome Project challenge
                </a>
                . Built independently in the open.
              </p>
            </div>
            <div className="how">
              <p>WHY USE AN INCLUSION TEST?</p>
              <h2>How Open Memome evaluates a meme</h2>
              <div className="how-intro">
                A shared test lets contributors evaluate very different
                cultural units consistently. Every decision can be checked and
                challenged.{" "}
                <button onClick={() => changeView("evidence")}>
                  Method and sources
                </button>
              </div>
              <p className="test-label">THE FIVE CHECKS</p>
              <ol>
                <li>
                  <b>1</b>
                  <span>
                    <strong>Transmitted</strong>Learned from people, artifacts,
                    groups, or systems.
                  </span>
                </li>
                <li>
                  <b>2</b>
                  <span>
                    <strong>Recognizable</strong>The copyable unit fits one
                    neutral sentence.
                  </span>
                </li>
                <li>
                  <b>3</b>
                  <span>
                    <strong>Recurrent</strong>It appears in independent
                    occurrences.
                  </span>
                </li>
                <li>
                  <b>4</b>
                  <span>
                    <strong>Variable</strong>It changes while remaining
                    recognizably related.
                  </span>
                </li>
                <li>
                  <b>5</b>
                  <span>
                    <strong>Traceable</strong>Dated evidence shows movement or
                    persistence.
                  </span>
                </li>
              </ol>
            </div>
          </section>
          <FilterBar
            query={query}
            setQuery={updateQuery}
            domain={domain}
            setDomain={updateDomain}
            kind={kind}
            setKind={updateKind}
            evidence={evidence}
            setEvidence={updateEvidence}
            count={filtered.length}
          />
          <section className="map-workspace" id="memome-map">
            <aside className="domain-list">
              <p>12 DOMAINS</p>
              {visibleCoverage.map((item) => (
                <button
                  key={item.name}
                  className={domain === item.name ? "selected" : ""}
                  onClick={() =>
                    updateDomain(
                      domain === item.name ? "All domains" : item.name,
                    )
                  }
                >
                  <i className={domainColors[item.name]} />
                  <span>{item.name}</span>
                  <b>{item.count.toLocaleString()}</b>
                </button>
              ))}
              <button
                className={domain === "All domains" ? "selected all" : "all"}
                onClick={() => updateDomain("All domains")}
              >
                All domains
              </button>
            </aside>
            <MemomeCanvas
              records={records}
              activeId={active}
              highlightIds={highlightIds}
              visibleIds={visibleIds}
              searchActive={Boolean(query.trim())}
              onSelect={setActive}
            />
            <aside className="record-panel">
              <div className="record-tags">
                <span className={`type ${domainColors[current.domain]}`}>
                  {current.kind}
                </span>
                <span className="level-tag">{current.level}</span>
              </div>
              <h2>{current.title}</h2>
              <p>{current.summary}</p>
              <p
                className={`candidate-note ${current.state.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <strong>{current.state}</strong>
                {current.state === "Documented"
                  ? " The unit is scoped and at least two dated sources are attached. Independent review may still challenge it."
                  : current.state === "Discovery lead"
                    ? " Catalogue match only. It may be a broad subject, carrier, duplicate or genuine meme."
                    : " The copyable unit is defined. Evidence and scope still need review."}
              </p>
              {current.documentation && (
                <p className="scope-note">
                  <strong>Scope</strong>
                  {current.documentation.scope}
                </p>
              )}
              <dl>
                <div>
                  <dt>Domain</dt>
                  <dd>{current.domain}</dd>
                </div>
                <div>
                  <dt>Period</dt>
                  <dd>{current.era}</dd>
                </div>
                <div>
                  <dt>Place</dt>
                  <dd>{current.region}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    <State value={current.state} />
                  </dd>
                </div>
                <div>
                  <dt>Long-run reach</dt>
                  <dd>
                    {current.reach === null
                      ? "Unscored"
                      : `${current.reach.toLocaleString()} Wikimedia sitelinks`}
                  </dd>
                </div>
              </dl>
              <h3>
                {current.documentation
                  ? `SOURCES · ${current.documentation.evidence.length} ATTACHED`
                  : "STARTING SOURCE"}
              </h3>
              {current.documentation ? (
                <div className="evidence-list">
                  {current.documentation.evidence.map((item) => (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      key={`${item.label}-${item.date}`}
                    >
                      <span>
                        <b>
                          {item.kind} · {item.date}
                        </b>
                        <strong>{item.label}</strong>
                        <small>{item.note}</small>
                      </span>
                      <Icon name="arrow" />
                    </a>
                  ))}
                </div>
              ) : current.sourceUrl ? (
                <>
                  <a
                    className="source-link"
                    href={current.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>
                      <b>{current.collection}</b>
                      {current.sourceLabel}
                    </span>
                    <Icon name="arrow" />
                  </a>
                  <p className="source-note">
                    This supports discovery. Dated occurrences and lineage still
                    need review.
                  </p>
                </>
              ) : (
                <p className="missing-source">
                  No dated occurrence has been attached yet.
                </p>
              )}
              <a
                className="review-record"
                href={evidenceUrl(current)}
                target="_blank"
                rel="noreferrer"
              >
                Add or challenge evidence <Icon name="arrow" />
              </a>
            </aside>
          </section>
        </>
      )}

      {view === "index" && (
        <section className="content-view index-view">
          <header>
            <div>
              <p className="eyebrow">
                {scopedRecords.length.toLocaleString()} scoped records ·{" "}
                {(records.length - scopedRecords.length).toLocaleString()}{" "}
                discovery leads
              </p>
              <h1>The working index</h1>
              <p>
                The default view contains scoped candidates and documented
                memes. Catalogue matches remain in a separate backlog until
                assessed.
              </p>
            </div>
            <a className="download" href="/memome-candidates.json" download>
              <Icon name="download" />
              Discovery data
            </a>
          </header>
          <FilterBar
            query={query}
            setQuery={updateQuery}
            domain={domain}
            setDomain={updateDomain}
            kind={kind}
            setKind={updateKind}
            evidence={evidence}
            setEvidence={updateEvidence}
            count={filtered.length}
          />
          <div className="index-table">
            <div className="index-row head">
              <span>Record</span>
              <span>Type</span>
              <span>Domain</span>
              <span>Discovery collection</span>
              <span>Status</span>
            </div>
            {filtered.slice(0, limit).map((r) => (
              <button
                className="index-row"
                key={r.id}
                onClick={() => openRecord(r.id)}
              >
                <strong>
                  {r.title}
                  <small>{r.summary}</small>
                </strong>
                <span>{r.kind}</span>
                <span>{r.domain}</span>
                <span>{r.collection}</span>
                <State value={r.state} />
              </button>
            ))}
          </div>
          {limit < filtered.length && (
            <button className="load-more" onClick={() => setLimit(limit + 60)}>
              Show 60 more{" "}
              <span>
                {Math.min(limit, filtered.length)} of {filtered.length}
              </span>
            </button>
          )}
        </section>
      )}

      {view === "evidence" && (
        <section className="content-view evidence-view">
          <header>
            <div>
              <p className="eyebrow">Scope, evidence and propagation</p>
              <h1>What qualifies as a meme?</h1>
              <p>
                A record must identify something learned from others that recurs
                in recognizable form. A catalogue topic alone is only a
                discovery lead.
              </p>
            </div>
          </header>
          <div className="criteria-basis">
            <strong>Why these criteria?</strong>
            <p>
              They turn the broad idea of cultural transmission into observable
              review rules. The basis combines Dawkins&apos;s replicator
              concept, research on cultural traits as identifiable units, and
              Shifman&apos;s treatment of memes as related groups of variants.
              The rules are versioned and revised when evidence warrants it.
            </p>
            <div>
              <a
                href="https://global.oup.com/academic/product/the-selfish-gene-9780198788607"
                target="_blank"
                rel="noreferrer"
              >
                Dawkins, 1976
              </a>
              <a
                href="https://royalsocietypublishing.org/doi/10.1098/rstb.2010.0012"
                target="_blank"
                rel="noreferrer"
              >
                O&apos;Brien et al., 2010
              </a>
              <a
                href="https://mitpress.mit.edu/9780262525435/memes-in-digital-culture/"
                target="_blank"
                rel="noreferrer"
              >
                Shifman, 2014
              </a>
            </div>
          </div>
          <div className="meme-gates">
            <article>
              <b>01</b>
              <strong>Transmitted</strong>
              <span>
                Learned from another person, group, artifact, or system.
              </span>
            </article>
            <article>
              <b>02</b>
              <strong>Recognizable</strong>
              <span>
                The copied content can be stated in one neutral sentence.
              </span>
            </article>
            <article>
              <b>03</b>
              <strong>Recurrent</strong>
              <span>
                It appears in at least two independent carriers or occurrences.
              </span>
            </article>
            <article>
              <b>04</b>
              <strong>Variable</strong>
              <span>It can change while remaining recognizably related.</span>
            </article>
            <article>
              <b>05</b>
              <strong>Traceable</strong>
              <span>Dated evidence locates its movement or persistence.</span>
            </article>
          </div>
          <p className="exclusion-note">
            <strong>Usually exclude:</strong> a person, product, organization,
            event, place, or broad subject. Include it only when the record
            names the specific idea, rule, practice, story, or symbol that
            people copy.
          </p>
          <div className="evidence-rule">
            <b>Occurrence</b>
            <span>A dated text, image, object, recording or event</span>
            <b>Relationship</b>
            <span>Origin, variant, influence, reaction or opposition</span>
            <b>Review</b>
            <span>Supported, weak, contradicted or unresolved</span>
          </div>
          <h2 className="section-title">Changes in how ideas travel</h2>
          <div className="event-grid">
            {events.map((event) => (
              <article key={event.title}>
                {event.image ? (
                  <img src={event.image} alt="" />
                ) : (
                  <div className="event-mark">{event.year}</div>
                )}
                <div>
                  <span>
                    {event.year} · {event.place}
                  </span>
                  <h3>{event.title}</h3>
                  <p>{event.text}</p>
                  <a href={event.source} target="_blank" rel="noreferrer">
                    Open source <Icon name="arrow" />
                  </a>
                </div>
              </article>
            ))}
          </div>
          <h2 className="section-title">Research foundations</h2>
          <div className="source-grid">
            {sources.map((s) => (
              <a href={s.url} target="_blank" rel="noreferrer" key={s.id}>
                <span>
                  {s.type} · {s.year}
                </span>
                <h3>{s.title}</h3>
                <p>{s.creator}</p>
                <small>{s.use}</small>
                <Icon name="arrow" />
              </a>
            ))}
          </div>
        </section>
      )}

      {view === "project" && (
        <section className="content-view project-view">
          <header>
            <div>
              <p className="eyebrow">
                Open data · open method · public decisions
              </p>
              <h1>Improve one claim</h1>
              <p>
                Every contribution enters a public queue with a named
                contributor, sources, discussion, review state, and version
                history.
              </p>
            </div>
          </header>
          <div className="project-grid">
            <section>
              <span>01</span>
              <h2>Propose a meme</h2>
              <p>
                Define one copyable unit and attach two independent dated
                occurrences. The form checks the five gates before submission.
              </p>
              <div>
                <a href={candidateIssue} target="_blank" rel="noreferrer">
                  Open candidate form <Icon name="arrow" />
                </a>
              </div>
            </section>
            <section>
              <span>02</span>
              <h2>Improve evidence</h2>
              <p>
                Add a source, correct a claim, identify a duplicate, or explain
                why a record should be contested or rejected.
              </p>
              <div>
                <a href={evidenceIssue} target="_blank" rel="noreferrer">
                  Add evidence <Icon name="arrow" />
                </a>
                <a href={`${GITHUB}/issues`} target="_blank" rel="noreferrer">
                  Review queue <Icon name="arrow" />
                </a>
              </div>
            </section>
            <section>
              <span>03</span>
              <h2>Work on the project</h2>
              <p>
                Fix the interface, assessment pipeline, semantic layout,
                documentation, tests, or governance through a focused pull
                request.
              </p>
              <div>
                <a href={GITHUB} target="_blank" rel="noreferrer">
                  Repository <Icon name="arrow" />
                </a>
                <a
                  href={`${GITHUB}/blob/main/CONTRIBUTING.md`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Contribution guide <Icon name="arrow" />
                </a>
              </div>
            </section>
          </div>
          <section className="status-ladder">
            <div>
              <State value="Discovery lead" />
              <p>
                Catalogue match only. High-signal leads may appear as hollow
                circles for review; the rest stay in the backlog.
              </p>
            </div>
            <div>
              <State value="Candidate" />
              <p>
                The unit is scoped. Evidence or independent review remains
                incomplete.
              </p>
            </div>
            <div>
              <State value="Documented" />
              <p>
                At least two dated sources are attached. Review may still change
                the scope.
              </p>
            </div>
            <div>
              <State value="Contested" />
              <p>Substantive disagreement and its evidence remain visible.</p>
            </div>
          </section>
          <section className="coverage-ledger">
            <div>
              <p className="eyebrow">Scoped coverage</p>
              <h2>Where review is still thin</h2>
              <p>
                Counts show candidates and documented records, not cultural
                importance. Discovery leads are excluded.
              </p>
            </div>
            <div>
              {scopedCoverage.map((item) => (
                <div className="coverage-row" key={item.name}>
                  <span>{item.name}</span>
                  <i>
                    <b
                      style={{
                        width: `${Math.max(3, (item.count / scopedCoverageMax) * 100)}%`,
                      }}
                    />
                  </i>
                  <strong>{item.count.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </section>
          <div className="origin-note">
            <strong>Where the project began</strong>
            <p>
              Alexander Wissner-Gross proposed mapping the full landscape of
              human memes and their propagation.{" "}
              <a
                href="https://youtu.be/TaJH0D2FKN8?t=3342"
                target="_blank"
                rel="noreferrer"
              >
                Watch the Moonshots excerpt
              </a>
              . Open Memome develops that challenge as an independent, public
              method and dataset.
            </p>
          </div>
          <div className="timeline-note">
            <strong>Historical view</strong>
            <p>
              A time slider will follow comparable dated reach observations. The
              project will not infer historical influence from a founding date.
            </p>
          </div>
        </section>
      )}

      <footer>
        <span>OPEN MEMOME · PUBLIC ALPHA</span>
        <p>
          {records.length.toLocaleString()} indexed ·{" "}
          {scopedRecords.length.toLocaleString()} scoped · 12 domains
        </p>
        <a href={candidateIssue} target="_blank" rel="noreferrer">
          Propose a meme
        </a>
      </footer>
    </main>
  );
}

function FilterBar({
  query,
  setQuery,
  domain,
  setDomain,
  kind,
  setKind,
  evidence,
  setEvidence,
  count,
}: {
  query: string;
  setQuery: (v: string) => void;
  domain: string;
  setDomain: (v: string) => void;
  kind: string;
  setKind: (v: string) => void;
  evidence: EvidenceFilter;
  setEvidence: (v: EvidenceFilter) => void;
  count: number;
}) {
  const documented = records.filter(
    (record) => record.state === "Documented",
  ).length;
  const candidates = records.filter(
      (record) => record.state !== "Discovery lead",
    ).length,
    leads = records.length - candidates;
  const withSource = records.filter((record) =>
    Boolean(record.sourceUrl),
  ).length;
  return (
    <section className="filterbar">
      <label className="searchbox">
        <Icon name="search" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the memome"
          aria-label="Search candidate memes"
        />
      </label>
      <label>
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          aria-label="Filter by domain"
        >
          <option>All domains</option>
          {domains.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </label>
      <label>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          aria-label="Filter by type"
        >
          <option>All types</option>
          {["Belief", "Narrative", "Norm", "Practice", "Frame", "Symbol"].map(
            (k) => (
              <option key={k}>{k}</option>
            ),
          )}
        </select>
      </label>
      <label>
        <select
          value={evidence}
          onChange={(e) => setEvidence(e.target.value as EvidenceFilter)}
          aria-label="Filter by evidence"
        >
          <option value="Expanded map">
            Expanded map ({expandedRecords.length.toLocaleString()})
          </option>
          <option value="Candidate layer">
            Scoped records ({candidates.toLocaleString()})
          </option>
          <option value="Documented only">
            Documented only ({documented})
          </option>
          <option value="Discovery leads">
            Unassessed backlog ({leads.toLocaleString()})
          </option>
          <option value="All layers">
            All records ({records.length.toLocaleString()})
          </option>
          <option value="Starting source">
            Any starting source ({withSource.toLocaleString()})
          </option>
          <option value="Missing source">
            Missing source ({(records.length - withSource).toLocaleString()})
          </option>
        </select>
      </label>
      <span>{count.toLocaleString()} matches</span>
    </section>
  );
}
