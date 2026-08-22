#!/usr/bin/env python3
"""Check the published corpus and semantic map before a release."""

from collections import Counter
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOMAINS = {
    "Belief & cosmology", "Governance & power", "Economy & exchange",
    "Identity & belonging", "Ethics & social order", "Knowledge & truth",
    "Technology & progress", "Health & body", "Family & kinship",
    "Nature & ecology", "Culture & aesthetics", "Digital culture",
}
MUST_COVER = {
    "ketogenic diet", "carnivore diet", "veganism", "vegetarianism",
    "intermittent fasting", "low-carbohydrate diet", "paleolithic diet",
    "stoicism", "astrology", "technological singularity",
    "bitcoin as digital gold", "ai inevitability",
    "money as shared trust", "democracy", "capitalism", "nationalism",
    "religion", "christianity", "islam", "buddhism", "hinduism", "judaism",
}


def require(condition, message):
    if not condition:
        raise SystemExit(message)


def main():
    corpus = json.loads((ROOT / "public" / "memome-candidates.json").read_text())
    semantic_map = json.loads((ROOT / "public" / "memome-map.json").read_text())
    imported = corpus["records"]
    imported_ids = [record["id"] for record in imported]

    require(len(imported) >= 5_000, "The discovery corpus is unexpectedly thin.")
    require(len(imported_ids) == len(set(imported_ids)), "Duplicate discovery IDs found.")
    require({record["domain"] for record in imported} == DOMAINS, "Domain coverage is incomplete.")
    require(all(record["status"] in {"Discovery lead", "Candidate", "Documented"} for record in imported), "Invalid review state in discovery corpus.")
    require(all(record["sourceUrl"].startswith("https://www.wikidata.org/wiki/Q") for record in imported), "Invalid catalogue source URL.")
    require(all(isinstance(record.get("reach"), int) and record["reach"] >= 0 for record in imported), "Invalid reach proxy.")
    require(all(isinstance(record.get("priority"), bool) for record in imported), "A record is missing its priority flag.")
    require(all((record["priority"] and record["status"] in {"Candidate", "Documented"}) or (not record["priority"] and record["status"] == "Discovery lead") for record in imported), "Priority and review state disagree.")
    require(MUST_COVER <= {record["title"].casefold() for record in imported}, "A priority anchor is missing.")
    require(sum(record["status"] == "Documented" for record in imported) >= 18, "Major meme documentation is missing.")

    counts = Counter(record["domain"] for record in imported)
    require(min(counts.values()) >= 150, f"Sparse domain found: {counts}")

    seed_count = sum(line.count("~") == 4 for line in (ROOT / "app" / "data.ts").read_text().splitlines())
    expected_ids = set(imported_ids) | {f"m{index}" for index in range(1, seed_count + 1)}
    points = semantic_map["points"]
    point_ids = [point["id"] for point in points]

    require(semantic_map["records"] == len(expected_ids), "Map record total is stale.")
    require(len(point_ids) == len(set(point_ids)), "Duplicate points found.")
    require(set(point_ids) == expected_ids, "The map and candidate index have drifted apart.")
    require(len(semantic_map["domains"]) == 12, "The map is missing a domain label.")
    require(all(cluster["label"].strip() for cluster in semantic_map["clusters"]), "Blank cluster label found.")
    require(all(0 <= point["x"] <= semantic_map["width"] and 0 <= point["y"] <= semantic_map["height"] for point in points), "A point falls outside the canvas.")
    require(all(point.get("reach") is None or isinstance(point["reach"], int) for point in points), "A map point has an invalid reach proxy.")

    print(f"Validated {len(expected_ids):,} records across 12 domains and {len(semantic_map['clusters'])} sub-clusters.")


if __name__ == "__main__":
    main()
