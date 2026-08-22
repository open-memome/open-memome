#!/usr/bin/env python3
"""Build the Open Memome discovery index from Wikidata.

Broad Wikidata imports remain discovery leads. Explicitly scoped priority
anchors become candidates. Neither state establishes a meme lineage.
"""

from concurrent.futures import ThreadPoolExecutor, as_completed
from collections import Counter
import csv
import io
import json
from pathlib import Path
import re
import time
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
ENDPOINT = "https://query.wikidata.org/sparql"
DEFAULT_LIMIT = 400

# Each collection is a reproducible discovery lens, not a claim that every
# result is already a well-scoped meme. "instance" imports direct instances.
# "concept" imports notable instances and subclasses with an English article.
# List order is the deterministic priority when an item appears more than once.
CATEGORIES = [
    ("Q9174", "Religions", "Belief & cosmology", "Belief", "instance", 400),
    ("Q189819", "Rituals", "Belief & cosmology", "Practice", "instance", 400),
    ("Q12827256", "Myths", "Belief & cosmology", "Narrative", "instance", 400),
    ("Q44342", "Legends", "Belief & cosmology", "Narrative", "instance", 400),

    ("Q7257", "Ideologies", "Governance & power", "Frame", "instance", 400),
    ("Q12909644", "Political ideologies", "Governance & power", "Frame", "instance", 400),
    ("Q49773", "Social movements", "Governance & power", "Narrative", "instance", 400),
    ("Q30515", "Slogans", "Governance & power", "Symbol", "instance", 400),

    ("Q273005", "Economic systems", "Economy & exchange", "Frame", "instance", 400),
    ("Q29028649", "Economic concepts", "Economy & exchange", "Frame", "concept", 400),
    ("Q1401304", "Economic theories", "Economy & exchange", "Frame", "concept", 180),
    ("Q5333510", "Economic ideologies", "Economy & exchange", "Frame", "concept", 120),
    ("Q815823", "Business models", "Economy & exchange", "Practice", "concept", 420),

    ("Q844569", "Identity concepts", "Identity & belonging", "Frame", "concept", 520),
    ("Q48264", "Gender identities", "Identity & belonging", "Frame", "concept", 220),
    ("Q264965", "Subcultures", "Identity & belonging", "Frame", "concept", 260),

    ("Q205665", "Social norms", "Ethics & social order", "Norm", "concept", 180),
    ("Q58927801", "Ethical theories", "Ethics & social order", "Frame", "concept", 120),
    ("Q55979391", "Ethical concepts", "Ethics & social order", "Frame", "concept", 120),
    ("Q8458", "Human rights", "Ethics & social order", "Norm", "concept", 180),
    ("Q107085948", "Ethical principles", "Ethics & social order", "Norm", "concept", 80),
    ("Q6086646", "Moral principles", "Ethics & social order", "Norm", "concept", 100),
    ("Q157811", "Virtues", "Ethics & social order", "Norm", "concept", 140),
    ("Q171180", "Taboos", "Ethics & social order", "Norm", "concept", 80),
    ("Q1192543", "Legal doctrines", "Ethics & social order", "Norm", "concept", 140),

    ("Q1387659", "Schools of thought", "Knowledge & truth", "Frame", "instance", 400),
    ("Q159535", "Conspiracy theories", "Knowledge & truth", "Narrative", "instance", 400),
    ("Q35102", "Proverbs", "Knowledge & truth", "Narrative", "instance", 400),

    ("Q11016", "Technologies", "Technology & progress", "Practice", "concept", 800),
    ("Q500669", "Technical processes", "Technology & progress", "Practice", "concept", 420),
    ("Q1408288", "Manufacturing methods", "Technology & progress", "Practice", "concept", 320),
    ("Q2292993", "Design methods", "Technology & progress", "Practice", "concept", 100),
    ("Q1780543", "Communication technologies", "Technology & progress", "Practice", "concept", 100),

    ("Q179661", "Therapies", "Health & body", "Practice", "concept", 320),
    ("Q796194", "Medical procedures", "Health & body", "Practice", "concept", 320),
    ("Q188504", "Alternative medicine", "Health & body", "Practice", "concept", 140),
    ("Q890057", "Body modification", "Health & body", "Practice", "concept", 150),
    ("Q219067", "Exercise practices", "Health & body", "Practice", "concept", 260),
    ("Q474191", "Dietary systems", "Health & body", "Practice", "concept", 360),

    ("Q251777", "Customs", "Family & kinship", "Practice", "instance", 400),
    ("Q171318", "Kinship concepts", "Family & kinship", "Frame", "concept", 220),
    ("Q7860953", "Marriage forms", "Family & kinship", "Practice", "concept", 100),
    ("Q1131696", "Rites of passage", "Family & kinship", "Practice", "concept", 100),
    ("Q2305447", "Kinship terminology", "Family & kinship", "Frame", "concept", 80),

    ("Q2144359", "Environmental issues", "Nature & ecology", "Frame", "concept", 280),
    ("Q56575300", "Ecological concepts", "Nature & ecology", "Frame", "concept", 100),
    ("Q919526", "Environmental policies", "Nature & ecology", "Norm", "concept", 120),
    ("Q63859034", "Ecological restoration", "Nature & ecology", "Practice", "concept", 80),
    ("Q20113959", "Nature conservation", "Nature & ecology", "Practice", "concept", 100),
    ("Q1088777", "Conservation movements", "Nature & ecology", "Narrative", "concept", 60),

    ("Q36192", "Folklore", "Culture & aesthetics", "Narrative", "instance", 400),
    ("Q82821", "Traditions", "Culture & aesthetics", "Practice", "instance", 400),
    ("Q80071", "Symbols", "Culture & aesthetics", "Symbol", "instance", 400),
    ("Q11639", "Dances", "Culture & aesthetics", "Practice", "instance", 400),
    ("Q483394", "Genres", "Culture & aesthetics", "Frame", "instance", 400),

    ("Q2927074", "Internet memes", "Digital culture", "Narrative", "instance", 500),
]

# Explicit anchors close consequential gaps and keep high-salience cultural
# units from depending on the ordering of broad catalogue queries. The label
# and definition describe the copyable unit. The linked Wikidata item supplies
# only a starting record and a reproducible reach proxy.
PRIORITY_RECORDS = [
    ("Q1070684", "Ketogenic diet", "Very-low-carbohydrate eating is used to induce ketosis as a therapeutic or lifestyle practice.", "Health & body", "Practice"),
    ("Q87409576", "Carnivore diet", "Eating only or almost only animal foods is promoted as a complete way of eating.", "Health & body", "Practice"),
    ("Q181138", "Veganism", "Avoiding animal products is practiced as an ethical and practical commitment.", "Ethics & social order", "Norm"),
    ("Q83364", "Vegetarianism", "Abstaining from meat is practiced for ethical, religious, environmental, or health reasons.", "Health & body", "Practice"),
    ("Q1666254", "Intermittent fasting", "Eating is organized into recurring fasting and feeding windows.", "Health & body", "Practice"),
    ("Q1570280", "Low-carbohydrate diet", "Carbohydrate restriction is promoted as a route to health, weight control, or metabolic change.", "Health & body", "Practice"),
    ("Q533945", "Paleolithic diet", "Modern eating should imitate a reconstructed pre-agricultural diet.", "Health & body", "Practice"),
    ("Q48235", "Stoicism", "Virtue and reason, rather than external circumstances, should govern how one lives.", "Ethics & social order", "Frame"),
    ("Q34362", "Astrology", "Celestial positions are interpreted as meaningful for human character and events.", "Belief & cosmology", "Belief"),
    ("Q237525", "Technological singularity", "Self-improving intelligence will produce a discontinuity beyond ordinary prediction.", "Technology & progress", "Narrative"),
    ("Q131723", "Bitcoin as digital gold", "Bitcoin is framed as scarce sovereign money and a durable store of value.", "Economy & exchange", "Frame"),
    ("Q11660", "AI inevitability", "Powerful artificial intelligence is treated as inevitable, making adaptation the rational response.", "Technology & progress", "Frame"),
    ("Q1368", "Money as shared trust", "A collectively accepted token or record can carry value and settle obligations.", "Economy & exchange", "Frame"),
    ("Q7174", "Democracy", "Political authority should derive from the people and remain answerable to them.", "Governance & power", "Norm"),
    ("Q6206", "Capitalism", "Private ownership, wage labor, markets, and profit organize production and exchange.", "Economy & exchange", "Frame"),
    ("Q6235", "Nationalism", "The nation is treated as a primary political community entitled to collective self-rule.", "Governance & power", "Frame"),
    ("Q9174", "Religion", "Shared sacred beliefs, practices, institutions, and narratives organize meaning and community.", "Belief & cosmology", "Belief"),
    ("Q5043", "Christianity", "Life and salvation are interpreted through traditions centered on Jesus Christ.", "Belief & cosmology", "Belief"),
    ("Q432", "Islam", "Life and community are ordered through traditions centered on the Quran and the teachings of Muhammad.", "Belief & cosmology", "Belief"),
    ("Q748", "Buddhism", "Suffering and liberation are interpreted through traditions derived from the Buddha's teachings.", "Belief & cosmology", "Belief"),
    ("Q9089", "Hinduism", "Diverse South Asian traditions transmit linked practices and ideas about dharma, karma, and liberation.", "Belief & cosmology", "Belief"),
    ("Q9268", "Judaism", "Jewish religious traditions transmit covenantal law, practice, narrative, and communal identity.", "Belief & cosmology", "Belief"),
]

# These priority records have a scoped unit and at least two independent,
# dated sources in app/documented.ts. The evidence confirms transmission and
# recurrence. It does not validate the truth, merit, or effects of the meme.
DOCUMENTED_QIDS = {
    "Q5043", "Q432", "Q748", "Q9089", "Q9268", "Q7174", "Q6206", "Q6235",
    "Q1368", "Q48235", "Q34362", "Q237525", "Q131723", "Q1070684",
    "Q181138", "Q83364", "Q1666254", "Q87409576",
}

IDENTITY_NOISE = re.compile(
    r"\b(syndrome|disease|disorder|medical condition|chromosom|genetic|infertility|"
    r"livery|emoji|software|user account|protein|gene|cell line|matrix|algebra|"
    r"film|album|song|television series|fictional character)\b",
    re.IGNORECASE,
)
IDENTITY_SIGNAL = re.compile(
    r"\b(identity|gender|sexual|citizen|ethnic|race|racial|community|social|culture|"
    r"subculture|national|diaspora|people|class|caste|queer|women|woman|men|man|"
    r"feminin|masculin|orientation|religious|political|tribe|indigenous|belonging|role)\b",
    re.IGNORECASE,
)


def clean_text(value):
    return value.replace("\u2014", " - ").replace("\u2013", " - ").replace("\u2011", "-").strip()


def fetch_category(category):
    qid, collection, domain, kind, mode, limit = category
    if mode == "concept":
        selector = f'''{{ ?item wdt:P31 wd:{qid}. }} UNION {{ ?item wdt:P279+ wd:{qid}. }}
      ?article schema:about ?item; schema:isPartOf <https://en.wikipedia.org/>.'''
    else:
        selector = f"?item wdt:P31 wd:{qid}."
    query = f'''SELECT DISTINCT ?item ?itemLabel ?itemDescription ?sitelinks WHERE {{
      {selector}
      OPTIONAL {{ ?item wikibase:sitelinks ?sitelinks. }}
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
    }} ORDER BY STRLEN(STR(?itemLabel)) LCASE(STR(?itemLabel)) LIMIT {limit or DEFAULT_LIMIT}'''
    url = ENDPOINT + "?" + urllib.parse.urlencode({"query": query, "format": "json"})
    request = urllib.request.Request(url, headers={"User-Agent": "OpenMemome/0.4 (open research dataset)"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=75) as response:
                bindings = json.load(response)["results"]["bindings"]
            rows = []
            for item in bindings:
                entity = item["item"]["value"].rsplit("/", 1)[-1]
                title = clean_text(item.get("itemLabel", {}).get("value", entity))
                if not title or title == entity:
                    continue
                summary = clean_text(item.get("itemDescription", {}).get("value", "Candidate record imported from Wikidata."))
                if domain == "Identity & belonging":
                    identity_text = f"{title} {summary}"
                    if IDENTITY_NOISE.search(identity_text) or not IDENTITY_SIGNAL.search(identity_text):
                        continue
                rows.append({
                    "id": f"wd-{entity.lower()}",
                    "title": title,
                    "summary": summary,
                    "domain": domain,
                    "kind": kind,
                    "collection": collection,
                    "source": "Wikidata",
                    "sourceUrl": f"https://www.wikidata.org/wiki/{entity}",
                    "reach": int(item.get("sitelinks", {}).get("value", 0)),
                    "priority": False,
                    "status": "Discovery lead",
                })
            return rows
        except Exception:
            if attempt == 2:
                raise
            time.sleep(2 + attempt * 2)


def fetch_priority_records():
    ids = "|".join(record[0] for record in PRIORITY_RECORDS)
    query = urllib.parse.urlencode({
        "action": "wbgetentities", "format": "json", "props": "sitelinks", "ids": ids,
    })
    request = urllib.request.Request(
        f"https://www.wikidata.org/w/api.php?{query}",
        headers={"User-Agent": "OpenMemome/0.6 (open research dataset)"},
    )
    with urllib.request.urlopen(request, timeout=75) as response:
        entities = json.load(response)["entities"]
    rows = []
    for qid, title, summary, domain, kind in PRIORITY_RECORDS:
        is_broad_subject = qid == "Q9174"
        rows.append({
            "id": f"wd-{qid.lower()}", "title": title, "summary": summary,
            "domain": domain, "kind": kind, "collection": "Priority anchors",
            "source": "Wikidata", "sourceUrl": f"https://www.wikidata.org/wiki/{qid}",
            "reach": len(entities.get(qid, {}).get("sitelinks", {})),
            "priority": not is_broad_subject,
            "status": "Discovery lead" if is_broad_subject else ("Documented" if qid in DOCUMENTED_QIDS else "Candidate"),
        })
    return rows


def main():
    collections = {}
    with ThreadPoolExecutor(max_workers=4) as pool:
        jobs = {pool.submit(fetch_category, category): index for index, category in enumerate(CATEGORIES)}
        for job in as_completed(jobs):
            collections[jobs[job]] = job.result()

    records = {}
    for index in range(len(CATEGORIES)):
        for record in collections.get(index, []):
            records.setdefault(record["id"], record)
    for record in fetch_priority_records():
        records[record["id"]] = record

    rows = sorted(records.values(), key=lambda row: (row["domain"], row["title"].casefold()))
    if len(rows) < 5000:
        raise SystemExit(f"Import returned only {len(rows)} records; refusing to publish a thin index.")
    domain_counts = Counter(row["domain"] for row in rows)
    sparse = {domain: count for domain, count in domain_counts.items() if count < 150}
    if sparse:
        raise SystemExit(f"Sparse domains after import: {sparse}")

    payload = {
        "license": "CC0 1.0",
        "retrieved": "2026-08-22",
        "source": "Wikidata",
        "warning": "Most rows are discovery leads, not confirmed memes. Inclusion does not establish meme fit, lineage, importance, truth, or endorsement. Reach is a Wikimedia sitelink count, not a virality measure.",
        "records": rows,
    }
    json_text = json.dumps(payload, ensure_ascii=True, separators=(",", ":"))
    (ROOT / "public" / "memome-candidates.json").write_text(json_text + "\n", encoding="utf-8")

    csv_buffer = io.StringIO()
    writer = csv.DictWriter(csv_buffer, fieldnames=list(rows[0].keys()), lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    (ROOT / "public" / "memome-candidates.csv").write_text(csv_buffer.getvalue(), encoding="utf-8")

    ts = "// Generated by scripts/import_wikidata.py. Do not edit by hand.\n"
    ts += "export type CandidateRecord = {id:string;title:string;summary:string;domain:string;kind:string;collection:string;source:string;sourceUrl:string;reach:number;priority:boolean;status:'Discovery lead'|'Candidate'|'Documented'};\n"
    ts += f"export const candidateRecords: CandidateRecord[] = {json.dumps(rows, ensure_ascii=True, separators=(',', ':'))};\n"
    (ROOT / "app" / "corpus.generated.ts").write_text(ts, encoding="utf-8")
    coverage = ", ".join(f"{domain}: {domain_counts[domain]}" for domain in sorted(domain_counts))
    print(f"Imported {len(rows)} unique discovery records from Wikidata.")
    print(coverage)


if __name__ == "__main__":
    main()
