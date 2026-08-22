"use client";

import {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { mapClusters, mapDomains, mapPoints } from "./map.generated";

type CanvasRecord = {
  id: string;
  title: string;
  domain: string;
  kind: string;
  state: string;
  sourceUrl: string;
  reach: number | null;
};
type Props = {
  records: CanvasRecord[];
  activeId: string;
  highlightIds: Set<string>;
  visibleIds: Set<string>;
  searchActive: boolean;
  onSelect: (id: string) => void;
};
type Viewport = { x: number; y: number; scale: number; fit: number };

const WIDTH = 13200;
const HEIGHT = 8200;
const colors: Record<string, string> = {
  "Belief & cosmology": "#8777c8",
  "Governance & power": "#d15f52",
  "Economy & exchange": "#c5a831",
  "Identity & belonging": "#c76e97",
  "Ethics & social order": "#5c9e69",
  "Knowledge & truth": "#568ac8",
  "Technology & progress": "#3faeb2",
  "Health & body": "#d78036",
  "Family & kinship": "#d06d66",
  "Nature & ecology": "#729c43",
  "Culture & aesthetics": "#9b6eaa",
  "Digital culture": "#91b600",
};

function boundsFor(items: { x: number; y: number }[]) {
  const xs = items.map((p) => p.x),
    ys = items.map((p) => p.y);
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
    rx: (Math.max(...xs) - Math.min(...xs)) / 2 + 150,
    ry: (Math.max(...ys) - Math.min(...ys)) / 2 + 150,
  };
}

const MAX_REACH = Math.max(...mapPoints.map((point) => point.reach ?? 0), 1);

function pointRadius(reach: number | null) {
  if (reach === null) return 1.4;
  const normalized = Math.log1p(reach) / Math.log1p(MAX_REACH);
  return 1.4 + Math.pow(normalized, 2.2) * 48.6;
}

export default function MemomeCanvas({
  records,
  activeId,
  highlightIds,
  visibleIds,
  searchActive,
  onSelect,
}: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef<Viewport>({ x: 0, y: 0, scale: 0.05, fit: 0.05 });
  const dragRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    moved: boolean;
  } | null>(null);
  const [hover, setHover] = useState<{
    id: string;
    sx: number;
    sy: number;
  } | null>(null);
  const [revision, setRevision] = useState(0);
  const recordById = useMemo(
    () => new Map(records.map((r) => [r.id, r])),
    [records],
  );
  const pointById = useMemo(() => new Map(mapPoints.map((p) => [p.id, p])), []);
  const orderedPoints = useMemo(
    () =>
      [...mapPoints].sort(
        (a, b) =>
          (recordById.get(a.id)?.reach ?? a.reach ?? -1) -
          (recordById.get(b.id)?.reach ?? b.reach ?? -1),
      ),
    [recordById],
  );
  const paintOrder = useMemo(() => [...orderedPoints].reverse(), [orderedPoints]);
  const domainBounds = useMemo(
    () =>
      mapDomains.map((label) => ({
        label,
        ...boundsFor(mapPoints.filter((p) => p.domain === label.domain)),
      })),
    [],
  );
  const clusterBounds = useMemo(
    () =>
      mapClusters.map((label) => ({
        label,
        ...boundsFor(mapPoints.filter((p) => p.cluster === label.id)),
      })),
    [],
  );
  const visibleDomainCounts = useMemo(
    () =>
      new Map(
        mapDomains.map((label) => [
          label.domain,
          mapPoints.filter(
            (point) =>
              point.domain === label.domain && visibleIds.has(point.id),
          ).length,
        ]),
      ),
    [visibleIds],
  );

  function reset(width?: number, height?: number) {
    const box = boxRef.current;
    const w = width || box?.clientWidth || 900,
      h = height || box?.clientHeight || 700;
    const fit = Math.min(w / WIDTH, h / HEIGHT) * 0.9;
    viewRef.current = {
      scale: fit,
      fit,
      x: (w - WIDTH * fit) / 2,
      y: (h - HEIGHT * fit) / 2,
    };
    setRevision((v) => v + 1);
  }

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      reset(rect.width, rect.height);
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (event: globalThis.WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const rect = canvas.getBoundingClientRect();
      zoom(
        event.deltaY < 0 ? 1.16 : 0.86,
        event.clientX - rect.left,
        event.clientY - rect.top,
      );
    };
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    if (!searchActive || highlightIds.size === 0 || highlightIds.size > 20)
      return;
    const box = boxRef.current;
    if (!box) return;
    const points = mapPoints.filter((point) => highlightIds.has(point.id));
    const minX = Math.min(...points.map((point) => point.x)),
      maxX = Math.max(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y)),
      maxY = Math.max(...points.map((point) => point.y));
    const view = viewRef.current,
      padding = 150;
    const spanX = Math.max(500, maxX - minX),
      spanY = Math.max(350, maxY - minY);
    const next = Math.min(
      view.fit * 9,
      Math.max(
        view.fit * 2.7,
        Math.min(
          (box.clientWidth - padding) / spanX,
          (box.clientHeight - padding) / spanY,
        ),
      ),
    );
    const centerX = (minX + maxX) / 2,
      centerY = (minY + maxY) / 2;
    view.x = box.clientWidth / 2 - centerX * next;
    view.y = box.clientHeight / 2 - centerY * next;
    view.scale = next;
    setRevision((value) => value + 1);
  }, [searchActive, highlightIds]);

  useEffect(() => {
    const canvas = canvasRef.current,
      box = boxRef.current;
    if (!canvas || !box) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2),
      width = box.clientWidth,
      height = box.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f8f6ef";
    ctx.fillRect(0, 0, width, height);
    const view = viewRef.current;
    ctx.save();
    ctx.translate(view.x, view.y);
    ctx.scale(view.scale, view.scale);

    for (const area of domainBounds) {
      ctx.beginPath();
      ctx.ellipse(area.x, area.y, area.rx, area.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = `${colors[area.label.domain]}12`;
      ctx.fill();
      ctx.strokeStyle = `${colors[area.label.domain]}55`;
      ctx.lineWidth = 0.7 / view.scale;
      ctx.stroke();
    }
    for (const area of clusterBounds) {
      ctx.beginPath();
      ctx.ellipse(area.x, area.y, area.rx, area.ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `${colors[area.label.domain]}42`;
      ctx.lineWidth = 0.5 / view.scale;
      ctx.setLineDash([3 / view.scale, 5 / view.scale]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    const filtered = searchActive || highlightIds.size < visibleIds.size;
    const paintPoints = filtered
      ? [
          ...paintOrder.filter(
            (point) => !highlightIds.has(point.id) && point.id !== activeId,
          ),
          ...paintOrder.filter(
            (point) => highlightIds.has(point.id) && point.id !== activeId,
          ),
          ...paintOrder.filter((point) => point.id === activeId),
        ]
      : [
          ...paintOrder.filter((point) => point.id !== activeId),
          ...paintOrder.filter((point) => point.id === activeId),
        ];
    for (const p of paintPoints) {
      if (!visibleIds.has(p.id)) continue;
      const record = recordById.get(p.id),
        selected = p.id === activeId,
        highlighted = highlightIds.has(p.id),
        reach = record?.reach ?? p.reach;
      const matched = filtered && highlighted,
        radius = selected
          ? Math.max(7, pointRadius(reach) + 2)
          : matched
            ? Math.max(searchActive ? 7 : 4.5, pointRadius(reach))
            : pointRadius(reach);
      const color = colors[p.domain] || "#78818c",
        hasSource = Boolean(record?.sourceUrl),
        documented = record?.state === "Documented",
        lead = record?.state === "Discovery lead";
      ctx.save();
      ctx.globalAlpha =
        filtered && !highlighted
          ? 0.025
          : documented && !selected && !matched
            ? 0.88
            : 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius / view.scale, 0, Math.PI * 2);
      ctx.fillStyle = selected
        ? "#071425"
        : matched
          ? color
          : documented
            ? color
            : lead
              ? "#f8f6ef"
              : hasSource
                ? `${color}35`
                : "#f8f6ef";
      ctx.fill();
      ctx.strokeStyle = selected
        ? "#d8ff3f"
        : matched
          ? "#071425"
          : lead
            ? `${color}a8`
            : hasSource
              ? color
              : "#8c9299";
      ctx.lineWidth =
        (selected ? 2.4 : matched ? 1.6 : hasSource ? 1 : 0.85) / view.scale;
      ctx.stroke();
      if (matched && !selected) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, (radius + 3) / view.scale, 0, Math.PI * 2);
        ctx.strokeStyle = "#d8ff3f";
        ctx.lineWidth = 2.2 / view.scale;
        ctx.stroke();
      }
      ctx.restore();
    }
    for (const label of mapDomains) {
      ctx.font = `700 ${17 / view.scale}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "rgba(248,246,239,.96)";
      ctx.lineWidth = 5 / view.scale;
      ctx.strokeText(label.label.toUpperCase(), label.x, label.y);
      ctx.fillStyle = "#111c2d";
      ctx.fillText(label.label.toUpperCase(), label.x, label.y);
      ctx.font = `${8 / view.scale}px Arial`;
      ctx.fillStyle = "#536071";
      ctx.fillText(
        `${(visibleDomainCounts.get(label.domain) || 0).toLocaleString()} VISIBLE`,
        label.x,
        label.y + 17 / view.scale,
      );
    }
    if (view.scale > view.fit * 0.72) {
      for (const label of mapClusters) {
        ctx.font = `700 ${10 / view.scale}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "rgba(248,246,239,.94)";
        ctx.lineWidth = 4 / view.scale;
        ctx.strokeText(label.label, label.x, label.y);
        ctx.fillStyle = "#394657";
        ctx.fillText(label.label, label.x, label.y);
      }
    }
    const scopedPoints = orderedPoints.filter(
      (point) =>
        visibleIds.has(point.id) &&
        recordById.get(point.id)?.state !== "Discovery lead",
    );
    const labelPoints =
      searchActive && highlightIds.size <= 12
        ? orderedPoints
            .filter(
              (point) => visibleIds.has(point.id) && highlightIds.has(point.id),
            )
            .reverse()
        : (scopedPoints.length
            ? scopedPoints
            : orderedPoints.filter((point) => visibleIds.has(point.id))
          )
            .slice(-22)
            .reverse();
    const occupied: { x: number; y: number; w: number; h: number }[] = [];
    for (const point of labelPoints) {
      if (point.id === activeId) continue;
      const record = recordById.get(point.id);
      if (!record) continue;
      ctx.font = `700 ${8 / view.scale}px Arial`;
      const width = ctx.measureText(record.title).width,
        height = 11 / view.scale;
      const x =
          point.x + (pointRadius(record.reach ?? point.reach) + 4) / view.scale,
        y = point.y - height / 2;
      if (
        occupied.some(
          (box) =>
            x < box.x + box.w &&
            x + width > box.x &&
            y < box.y + box.h &&
            y + height > box.y,
        )
      )
        continue;
      occupied.push({ x, y, w: width, h: height });
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "rgba(248,246,239,.98)";
      ctx.lineWidth = 4 / view.scale;
      ctx.strokeText(record.title, x, y + height / 2);
      ctx.fillStyle = "#071425";
      ctx.fillText(record.title, x, y + height / 2);
    }
    const named = hover?.id || (visibleIds.has(activeId) ? activeId : ""),
      namedPoint = pointById.get(named),
      namedRecord = recordById.get(named);
    if (namedPoint && namedRecord) {
      ctx.font = `700 ${11 / view.scale}px Arial`;
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      const tx = namedPoint.x + 9 / view.scale,
        ty = namedPoint.y - 7 / view.scale;
      ctx.strokeStyle = "rgba(248,246,239,.98)";
      ctx.lineWidth = 5 / view.scale;
      ctx.strokeText(namedRecord.title, tx, ty);
      ctx.fillStyle = "#071425";
      ctx.fillText(namedRecord.title, tx, ty);
    }
    ctx.restore();
  }, [
    revision,
    activeId,
    hover,
    highlightIds,
    visibleIds,
    searchActive,
    records,
    recordById,
    pointById,
    orderedPoints,
    paintOrder,
    domainBounds,
    clusterBounds,
    visibleDomainCounts,
  ]);

  function nearest(clientX: number, clientY: number) {
    const rect = canvasRef.current!.getBoundingClientRect(),
      view = viewRef.current;
    const sx = clientX - rect.left,
      sy = clientY - rect.top,
      wx = (sx - view.x) / view.scale,
      wy = (sy - view.y) / view.scale;
    for (const p of orderedPoints) {
      if (!visibleIds.has(p.id)) continue;
      const record = recordById.get(p.id),
        hitRadius =
          Math.max(6, pointRadius(record?.reach ?? p.reach) + 2) / view.scale,
        distance = (p.x - wx) ** 2 + (p.y - wy) ** 2;
      if (distance <= hitRadius ** 2) return { id: p.id, sx, sy };
    }
    let best: string | null = null,
      bestDistance = (14 / view.scale) ** 2;
    for (const p of orderedPoints) {
      if (!visibleIds.has(p.id)) continue;
      const d = (p.x - wx) ** 2 + (p.y - wy) ** 2;
      if (d < bestDistance) {
        bestDistance = d;
        best = p.id;
      }
    }
    return best ? { id: best, sx, sy } : null;
  }

  function pointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      vx: viewRef.current.x,
      vy: viewRef.current.y,
      moved: false,
    };
  }
  function pointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (drag) {
      const dx = e.clientX - drag.x,
        dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      viewRef.current.x = drag.vx + dx;
      viewRef.current.y = drag.vy + dy;
      setRevision((v) => v + 1);
      return;
    }
    const hit = nearest(e.clientX, e.clientY);
    setHover(
      hit
        ? {
            ...hit,
            sx: Math.max(
              8,
              Math.min(hit.sx + 14, e.currentTarget.clientWidth - 230),
            ),
            sy: Math.max(
              8,
              Math.min(hit.sy + 14, e.currentTarget.clientHeight - 70),
            ),
          }
        : null,
    );
  }
  function pointerUp(e: ReactPointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (drag && !drag.moved) {
      const hit = nearest(e.clientX, e.clientY);
      if (hit) onSelect(hit.id);
    }
    dragRef.current = null;
  }
  function zoom(factor: number, sx?: number, sy?: number) {
    const box = boxRef.current;
    if (!box) return;
    const view = viewRef.current,
      x = sx ?? box.clientWidth / 2,
      y = sy ?? box.clientHeight / 2;
    const wx = (x - view.x) / view.scale,
      wy = (y - view.y) / view.scale;
    const next = Math.max(
      view.fit * 0.65,
      Math.min(view.fit * 22, view.scale * factor),
    );
    view.x = x - wx * next;
    view.y = y - wy * next;
    view.scale = next;
    setRevision((v) => v + 1);
  }
  function keyDown(e: ReactKeyboardEvent<HTMLCanvasElement>) {
    const step = 44;
    if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      zoom(1.35);
    } else if (e.key === "-") {
      e.preventDefault();
      zoom(0.74);
    } else if (e.key === "0") {
      e.preventDefault();
      reset();
    } else if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
    ) {
      e.preventDefault();
      if (e.key === "ArrowLeft") viewRef.current.x += step;
      if (e.key === "ArrowRight") viewRef.current.x -= step;
      if (e.key === "ArrowUp") viewRef.current.y += step;
      if (e.key === "ArrowDown") viewRef.current.y -= step;
      setRevision((v) => v + 1);
    }
  }
  const hoverRecord = hover ? recordById.get(hover.id) : null;

  return (
    <div className="semantic-map" ref={boxRef}>
      <canvas
        ref={canvasRef}
        tabIndex={0}
        onKeyDown={keyDown}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerLeave={() => {
          dragRef.current = null;
          setHover(null);
        }}
        aria-label="Semantic map of indexed meme candidates and discovery leads. Use arrow keys to move, plus and minus to zoom, and zero to fit the map."
      />
      <div className="map-meta">
        {searchActive ? (
          <>
            <b>{highlightIds.size.toLocaleString()}</b> matches highlighted
          </>
        ) : (
          <>
            <b>{visibleIds.size.toLocaleString()}</b> visible <i />{" "}
            <b>{mapClusters.length}</b> sub-clusters
          </>
        )}
      </div>
      <div className="map-controls">
        <button onClick={() => zoom(1.35)} aria-label="Zoom in">
          +
        </button>
        <button onClick={() => zoom(0.74)} aria-label="Zoom out">
          −
        </button>
        <button onClick={() => reset()}>Fit map</button>
      </div>
      <div className="map-help">
        Drag to move · Scroll to zoom · Select a point to inspect it
      </div>
      <div className="map-key">
        <div>
          <strong>Size</strong>
          <i className="key-dot small" />
          <i className="key-dot large" />
          <span>Long-run footprint</span>
        </div>
        <div>
          <strong>Fill</strong>
          <i className="key-dot solid" />
          <span>Documented</span>
          <i className="key-dot sourced" />
          <span>Candidate</span>
          <i className="key-dot lead" />
          <span>Lead</span>
          <i className="key-dot hollow" />
          <span>No source</span>
        </div>
      </div>
      {visibleIds.size === 0 && (
        <div className="map-empty-filter">
          <strong>No documented records yet</strong>
          <span>Switch the evidence filter to see the candidate layer.</span>
        </div>
      )}
      {visibleIds.size > 0 && highlightIds.size === 0 && (
        <div className="map-empty-filter">
          <strong>No matching records</strong>
          <span>Try a broader search or reset a filter.</span>
        </div>
      )}
      {hover && hoverRecord && (
        <div className="map-tooltip" style={{ left: hover.sx, top: hover.sy }}>
          <b>{hoverRecord.title}</b>
          <span>
            {hoverRecord.domain} · {hoverRecord.kind} · {hoverRecord.state}
          </span>
          <span>
            {hoverRecord.reach === null
              ? "Reach unscored"
              : `${hoverRecord.reach.toLocaleString()} Wikimedia sitelinks`}{" "}
            · {hoverRecord.sourceUrl ? "Starting source" : "No source"}
          </span>
        </div>
      )}
    </div>
  );
}
