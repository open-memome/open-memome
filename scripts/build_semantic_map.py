#!/usr/bin/env python3
"""Create the semantic layout used by the Open Memome canvas."""

from collections import Counter
import hashlib
import json
from pathlib import Path
import re

import numpy as np
from sklearn.cluster import MiniBatchKMeans
from sklearn.decomposition import PCA, TruncatedSVD
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer
from sklearn.metrics.pairwise import cosine_distances
from sklearn.manifold import MDS
from sklearn.preprocessing import normalize

ROOT = Path(__file__).resolve().parents[1]
DOMAIN_ORDER = [
    "Belief & cosmology", "Governance & power", "Economy & exchange", "Identity & belonging",
    "Ethics & social order", "Knowledge & truth", "Technology & progress", "Health & body",
    "Family & kinship", "Nature & ecology", "Culture & aesthetics", "Digital culture",
]

# The layout is computed. The public labels are editorial. These names were
# reviewed against the records inside each stable cluster so the map speaks in
# clear human categories instead of exposing raw model keywords.
CLUSTER_LABEL_OVERRIDES = {
    "cluster-0-0": "Modern and syncretic faiths",
    "cluster-0-1": "Myths",
    "cluster-0-2": "Rituals and ceremonies",
    "cluster-0-3": "Religions",
    "cluster-0-4": "Core cosmologies",
    "cluster-0-5": "Legends",
    "cluster-1-0": "Social and green ideologies",
    "cluster-1-1": "Political slogans",
    "cluster-1-2": "Social movements",
    "cluster-1-3": "Religious and racial ideologies",
    "cluster-1-4": "Ideologies and counter-ideologies",
    "cluster-1-5": "Core political ideas",
    "cluster-1-6": "Political doctrines",
    "cluster-2-0": "Business models and exchange",
    "cluster-2-1": "Economic concepts",
    "cluster-2-2": "Economic theories",
    "cluster-2-3": "Property and reciprocity",
    "cluster-2-4": "Economic ideologies",
    "cluster-2-5": "Finance and services",
    "cluster-2-6": "Economic systems",
    "cluster-2-7": "Markets, prices and labor",
    "cluster-3-0": "Subcultures and scenes",
    "cluster-3-1": "Social, national and sexual identities",
    "cluster-3-2": "Core identity structures",
    "cluster-3-3": "Gender systems and identities",
    "cluster-3-4": "Gender and collective identities",
    "cluster-4-0": "Virtues, norms and doctrines",
    "cluster-4-1": "Rights and freedoms",
    "cluster-4-2": "Ethical theories",
    "cluster-4-3": "Core moral orders",
    "cluster-4-4": "Ethical concepts",
    "cluster-5-0": "Schools of thought",
    "cluster-5-1": "Conspiracy narratives",
    "cluster-5-2": "Core knowledge practices",
    "cluster-5-3": "Proverbs and maxims",
    "cluster-5-4": "Intellectual movements",
    "cluster-6-0": "Digital and computational technology",
    "cluster-6-1": "Data and technical processes",
    "cluster-6-2": "Manufacturing and design",
    "cluster-6-3": "Semiconductor families",
    "cluster-6-4": "Core progress narratives",
    "cluster-6-5": "Space and security systems",
    "cluster-6-6": "Imaging technologies",
    "cluster-6-7": "Networks, automation and display",
    "cluster-6-8": "Applied systems and methods",
    "cluster-6-9": "Lithography and fabrication",
    "cluster-7-0": "Therapies and interventions",
    "cluster-7-1": "Exercise and movement",
    "cluster-7-2": "Body modification",
    "cluster-7-3": "Tests and diagnostics",
    "cluster-7-4": "Traditional and alternative medicine",
    "cluster-7-5": "Core health frames",
    "cluster-7-6": "East Asian therapies",
    "cluster-8-0": "Rites and marriage",
    "cluster-8-1": "Customs and ceremonies",
    "cluster-8-2": "Kinship roles and terms",
    "cluster-8-3": "Core family forms",
    "cluster-8-4": "Regional customs",
    "cluster-9-0": "Conservation and restoration",
    "cluster-9-1": "Environmental harms",
    "cluster-9-2": "Ecological concepts",
    "cluster-9-3": "Core ecological frames",
    "cluster-9-4": "Environmental policy",
    "cluster-10-0": "Folklore",
    "cluster-10-1": "Literary and media genres",
    "cluster-10-2": "Symbols and signs",
    "cluster-10-3": "Traditions and customs",
    "cluster-10-4": "Core cultural forms",
    "cluster-10-5": "Oral and narrative genres",
    "cluster-10-6": "Dance forms",
    "cluster-10-7": "Urban and popular genres",
    "cluster-11-0": "Online slang and video culture",
    "cluster-11-1": "Core digital practices",
    "cluster-11-2": "Image macros and reaction memes",
    "cluster-11-3": "Meme formats and variants",
    "cluster-11-4": "Early and iconic internet memes",
}


def load_records():
    imported = json.loads((ROOT / "public" / "memome-candidates.json").read_text())["records"]
    hand = []
    for line in (ROOT / "app" / "data.ts").read_text().splitlines():
        if line.count("~") != 4:
            continue
        title, kind, era, region, summary = line.strip("`, ").split("~")
        hand.append({
            "id": f"m{len(hand) + 1}", "title": title, "summary": summary,
            "domain": "", "kind": kind, "collection": "Hand-built foundation", "reach": None,
        })

    source = (ROOT / "app" / "data.ts").read_text()
    blocks = re.findall(r'"([^"\n]+)": `\n(.*?)`[,;]', source, flags=re.S)
    domain_by_title = {}
    for domain, block in blocks:
        for line in block.splitlines():
            if line.count("~") == 4:
                domain_by_title[line.split("~", 1)[0]] = domain
    for row in hand:
        row["domain"] = domain_by_title.get(row["title"], "Culture & aesthetics")
    return hand + imported


def stable_jitter(record_id, amount=18.0):
    seed = int(hashlib.sha1(record_id.encode()).hexdigest()[:10], 16)
    angle = (seed % 6283) / 1000
    radius = ((seed // 6283) % 1000) / 1000 * amount
    return np.array([np.cos(angle) * radius, np.sin(angle) * radius])


def normalize_2d(values):
    values = values - np.median(values, axis=0)
    scale = np.percentile(np.abs(values), 92, axis=0)
    scale[scale < 1e-8] = 1
    return np.clip(values / scale, -1.35, 1.35)


def main():
    records = load_records()
    stop = set(ENGLISH_STOP_WORDS) | {
        "candidate", "record", "imported", "wikidata", "movement", "system",
        "theory", "group", "type", "form", "based", "related", "world",
    }
    texts = [f"{r['title']} {r['title']} {r['summary']} {r['collection']} {r['kind']}" for r in records]
    vectorizer = TfidfVectorizer(stop_words=list(stop), ngram_range=(1, 2), min_df=2, max_features=14000, sublinear_tf=True)
    matrix = vectorizer.fit_transform(texts)
    latent = normalize(TruncatedSVD(n_components=32, random_state=19).fit_transform(matrix))
    terms = vectorizer.get_feature_names_out()
    collection_words = {word.lower() for row in records for word in re.findall(r"[A-Za-z]+", row["collection"])}
    label_stop = stop | collection_words | {
        "belief", "narrative", "norm", "practice", "frame", "symbol",
        "foundation", "built", "hand", "concept", "concepts", "type", "types",
    }

    domain_indices = {domain: np.array([i for i, r in enumerate(records) if r["domain"] == domain]) for domain in DOMAIN_ORDER}
    domain_means = np.vstack([latent[idx].mean(axis=0) for idx in domain_indices.values()])
    distances = cosine_distances(domain_means)
    domain_xy = MDS(n_components=2, metric="precomputed", init="random", random_state=11, n_init=8, max_iter=600, normalized_stress="auto").fit_transform(distances)
    domain_xy = normalize_2d(domain_xy)
    domain_xy[:, 0] = 7000 + domain_xy[:, 0] * 4200
    domain_xy[:, 1] = 4300 + domain_xy[:, 1] * 2800
    radii = np.array([620 + 21 * np.sqrt(len(idx)) for idx in domain_indices.values()])

    for _ in range(120):
        moved = False
        for i in range(len(DOMAIN_ORDER)):
            for j in range(i + 1, len(DOMAIN_ORDER)):
                delta = domain_xy[j] - domain_xy[i]
                distance = float(np.linalg.norm(delta)) or 1.0
                minimum = (radii[i] + radii[j]) * 0.74
                if distance < minimum:
                    shift = delta / distance * (minimum - distance) * 0.14
                    domain_xy[i] -= shift
                    domain_xy[j] += shift
                    moved = True
        domain_xy[:, 0] = np.clip(domain_xy[:, 0], 900, 13100)
        domain_xy[:, 1] = np.clip(domain_xy[:, 1], 700, 7900)
        if not moved:
            break

    point_xy = np.zeros((len(records), 2))
    point_cluster = [""] * len(records)
    cluster_labels = []
    domain_labels = []

    for domain_number, (domain, indices) in enumerate(domain_indices.items()):
        center = domain_xy[domain_number]
        radius = radii[domain_number]
        domain_labels.append({"id": f"domain-{domain_number}", "label": domain, "x": round(float(center[0]), 1), "y": round(float(center[1] - radius * .78), 1), "count": int(len(indices)), "domain": domain})
        count = len(indices)
        k = max(1, min(10, round(np.sqrt(count) / 4)))
        if k == 1:
            assignments = np.zeros(count, dtype=int)
            sub_centers = np.zeros((1, latent.shape[1]))
            sub_centers[0] = latent[indices].mean(axis=0)
        else:
            model = MiniBatchKMeans(n_clusters=k, random_state=37 + domain_number, n_init=12, batch_size=512)
            assignments = model.fit_predict(latent[indices])
            sub_centers = model.cluster_centers_
        if k > 1:
            center_2d = normalize_2d(PCA(n_components=2, random_state=7).fit_transform(sub_centers))
        else:
            center_2d = np.zeros((1, 2))
        center_2d *= radius * .47

        for sub in range(k):
            cluster_id = f"cluster-{domain_number}-{sub}"
            local_positions = np.where(assignments == sub)[0]
            global_indices = indices[local_positions]
            sub_center = center + center_2d[sub]
            if len(global_indices) > 2:
                projected = PCA(n_components=2, random_state=13).fit_transform(latent[global_indices])
                projected = normalize_2d(projected)
            else:
                projected = np.zeros((len(global_indices), 2))
            local_radius = min(radius * .26, 85 + 12 * np.sqrt(len(global_indices)))
            projected *= local_radius
            for local_i, record_i in enumerate(global_indices):
                point_xy[record_i] = sub_center + projected[local_i] + stable_jitter(records[record_i]["id"])
                point_cluster[record_i] = cluster_id

            weights = np.asarray(matrix[global_indices].mean(axis=0)).ravel()
            ranked = weights.argsort()[::-1]
            chosen = []
            for term_i in ranked:
                term = terms[term_i]
                clean = " ".join(word for word in term.split() if word not in label_stop)
                if len(clean) < 4 or any(clean in existing or existing in clean for existing in chosen):
                    continue
                chosen.append(clean)
                if len(chosen) == 2:
                    break
            fallback = Counter(records[i]["collection"] for i in global_indices).most_common(1)[0][0]
            label = " · ".join(word.title() for word in chosen) if chosen else fallback
            label = CLUSTER_LABEL_OVERRIDES.get(cluster_id, label)
            cluster_labels.append({
                "id": cluster_id, "label": label,
                "x": round(float(sub_center[0]), 1), "y": round(float(sub_center[1]), 1),
                "count": int(len(global_indices)), "domain": domain,
            })

    all_min = point_xy.min(axis=0) - 420
    all_max = point_xy.max(axis=0) + 420
    scale = np.array([13200, 8200]) / (all_max - all_min)
    point_xy = (point_xy - all_min) * scale
    for labels in (cluster_labels, domain_labels):
        for label in labels:
            label["x"] = round((label["x"] - all_min[0]) * scale[0], 1)
            label["y"] = round((label["y"] - all_min[1]) * scale[1], 1)
            label["x"] = min(13000, max(200, label["x"]))
            label["y"] = min(8000, max(200, label["y"]))

    points = [{
        "id": record["id"], "x": round(float(point_xy[i, 0]), 1), "y": round(float(point_xy[i, 1]), 1),
        "domain": record["domain"], "cluster": point_cluster[i], "reach": record.get("reach"),
    } for i, record in enumerate(records)]

    payload = {
        "method": "TF-IDF titles and descriptions, 32-dimensional semantic projection, hierarchical clustering, and local principal components",
        "records": len(records), "width": 13200, "height": 8200,
        "points": points, "clusters": cluster_labels, "domains": domain_labels,
    }
    (ROOT / "public" / "memome-map.json").write_text(json.dumps(payload, ensure_ascii=True, separators=(",", ":")) + "\n")
    ts = "// Generated by scripts/build_semantic_map.py. Do not edit by hand.\n"
    ts += "export type MapPoint={id:string;x:number;y:number;domain:string;cluster:string;reach:number|null};\n"
    ts += "export type MapLabel={id:string;label:string;x:number;y:number;count:number;domain:string};\n"
    ts += f"export const mapPoints:MapPoint[]={json.dumps(points, ensure_ascii=True, separators=(',', ':'))};\n"
    ts += f"export const mapClusters:MapLabel[]={json.dumps(cluster_labels, ensure_ascii=True, separators=(',', ':'))};\n"
    ts += f"export const mapDomains:MapLabel[]={json.dumps(domain_labels, ensure_ascii=True, separators=(',', ':'))};\n"
    (ROOT / "app" / "map.generated.ts").write_text(ts)
    print(f"Mapped {len(points)} records into {len(cluster_labels)} semantic sub-clusters.")


if __name__ == "__main__":
    main()
