import * as d3 from "d3"
import { useEffect, useRef } from "react"

// TODO: REFACTOR!
interface MarkerData {
  name: string;        // Calcium, Chloride, Creatinine, Glucose, Potassium, Protein, Sodium
  min: number;
  max: number;
  avg: number;
  median: number;
}

interface Props {
  data: MarkerData[];
  width?: number;   // default 700
  height?: number;  // default 350
}

/** Per-stat neon gradients (top -> bottom) */
const STAT_GRADIENTS: Record<"min" | "max" | "avg" | "median", [string, string]> = {
  min:    ["#29d3ff", "#0a84ff"],   // cyan → blue
  max:    ["#ff7a45", "#ff1e1e"],   // orange → red
  avg:    ["#ff6fa5", "#ff2a6d"],   // rose → magenta
  median: ["#b07cff", "#7a39ff"],   // lavender → deep purple
};

const LABELS: Record<keyof MarkerData | "avg" | "median", string> = {
  name: "Marker",
  min: "Min",
  max: "Max",
  avg: "Average",
  median: "Median",
};

const CATEGORIES = ["min", "max", "avg", "median"] as const;

export function BloodStatsGraph({
  data,
  width = 700,
  height = 350,
} : Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data?.length) return;

    const svg = d3.select(svgRef.current!);
    svg.selectAll("*").remove();

    // Layout
    const margin = { top: 20, right: 24, bottom: 60, left: 50 }; // extra bottom room for horizontal legend
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // --- Defs: gradients per stat + glow + frame glow ---
    const defs = svg.append("defs");

    // glow filter
    const glow = defs.append("filter").attr("id", "glow");
    glow.append("feGaussianBlur").attr("stdDeviation", 3).attr("result", "b");
    const m = glow.append("feMerge");
    m.append("feMergeNode").attr("in", "b");
    m.append("feMergeNode").attr("in", "SourceGraphic");

    // frame glow
    const frameGlow = defs.append("filter").attr("id", "frameGlow");
    frameGlow.append("feGaussianBlur").attr("stdDeviation", 1.6).attr("result", "fb");
    const fm = frameGlow.append("feMerge");
    fm.append("feMergeNode").attr("in", "fb");
    fm.append("feMergeNode").attr("in", "SourceGraphic");

    // gradients for each stat
    for (const key of CATEGORIES) {
      const [c1, c2] = STAT_GRADIENTS[key];
      const grad = defs.append("linearGradient")
        .attr("id", `grad-${key}`)
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", c1).attr("stop-opacity", 0.9);
      grad.append("stop").attr("offset", "100%").attr("stop-color", c2).attr("stop-opacity", 0.12);
    }

    // --- Scales ---
    const x0 = d3.scaleBand<string>()
      .domain(data.map(d => d.name))
      .range([0, innerW])
      .padding(0.24);

    const x1 = d3.scaleBand<string>()
      .domain(CATEGORIES as unknown as string[])
      .range([0, x0.bandwidth()])
      .padding(0.12);

    const allVals = data.flatMap(d => [d.min, d.max, d.avg, d.median]);
    const yMax = (d3.max(allVals) ?? 1) * 1.1;
    const y = d3.scaleLinear().domain([0, yMax]).nice().range([innerH, 0]);

    // --- White inner frame hugging plot area ---
    g.append("rect")
      .attr("x", 0).attr("y", 0)
      .attr("width", innerW).attr("height", innerH)
      .attr("rx", 10)
      .attr("fill", "none")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1)
      .attr("filter", "url(#frameGlow)")
      .attr("opacity", 0.75);

    // --- Grid (horizontal; bluish & subtle) ---
    g.append("g")
      .attr("class", "grid-y")
      .call(d3.axisLeft(y).ticks(6).tickSize(-innerW).tickFormat(() => "" as any))
      .selectAll("line")
      .attr("stroke", "#4da4ff2d")
      .attr("shape-rendering", "crispEdges");
    g.select(".grid-y").select("path").attr("stroke", "none");

    // --- Axes ---
    const yAxis = g.append("g").call(d3.axisLeft(y).ticks(6));
    yAxis.selectAll("text").attr("fill", "#b8d7ff").attr("font-size", 12);
    yAxis.selectAll("path, line").attr("stroke", "#4da4ff2d");

    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x0));
    xAxis.selectAll("text").attr("fill", "#b8d7ff").attr("font-size", 12);
    xAxis.selectAll("path, line").attr("stroke", "#4da4ff2d");

    // --- Bars (animated) ---
    const groups = g.selectAll(".marker")
      .data(data, (d: any) => d.name)
      .join(enter => enter.append("g")
        .attr("class", "marker")
        .attr("transform", d => `translate(${x0(d.name)},0)`));

    const bars = groups.selectAll("rect")
      .data(d => CATEGORIES.map(k => ({ key: k, value: d[k] as number, marker: d.name })), (d: any) => d.key);

    bars.join(
      enter => enter.append("rect")
        .attr("x", (d: any) => x1(d.key)!)
        .attr("y", () => y(0))
        .attr("width", x1.bandwidth())
        .attr("height", () => innerH - y(0))
        .attr("rx", 6)
        .attr("fill", (d: any) => `url(#grad-${d.key})`)
        .attr("filter", "url(#glow)")
        .call(e => e.transition().duration(900).ease(d3.easeCubicInOut)
          .attr("y", (d: any) => y(d.value))
          .attr("height", (d: any) => innerH - y(d.value))),
      update => update.call(u => u.transition().duration(900).ease(d3.easeCubicInOut)
          .attr("x", (d: any) => x1(d.key)!)
          .attr("y", (d: any) => y(d.value))
          .attr("width", x1.bandwidth())
          .attr("height", (d: any) => innerH - y(d.value))),
      exit => exit.call(x => x.transition().duration(300).attr("height", 0).attr("y", y(0)).remove())
    );

    // --- Tooltip (follows cursor; label + value) ---
    const tip = g.append("g").attr("class", "tooltip").style("pointer-events","none");
    const tipBg = tip.append("rect")
      .attr("rx", 6).attr("ry", 6)
      .attr("fill", "rgba(15,15,35,0.95)")
      .attr("stroke", "#ffffff")
      .attr("stroke-opacity", 0.6)
      .attr("opacity", 0);
    const tipText = tip.append("text")
      .attr("fill","#fff")
      .attr("font-size",12)
      .attr("text-anchor","middle")
      .style("opacity",0);

    const format = d3.format(".1f");

    function moveTipToCursor(event: any, label: string, value: number) {
      // position relative to the plotting group (g)
      const [mx, my] = d3.pointer(event, g.node() as SVGGElement);
      const text = `${label}: ${format(value)}`;

      tipText.text(text).attr("x", mx).attr("y", my - 14).style("opacity", 1);

      const tbox = (tipText.node() as SVGTextElement).getBBox();
      const padX = 8, padY = 6;

      let x = tbox.x - padX;
      let y = tbox.y - padY;
      const w = tbox.width + padX * 2;
      const h = tbox.height + padY * 2;

      // keep tooltip within the plot frame
      x = Math.max(0, Math.min(x, innerW - w));
      y = Math.max(0, Math.min(y, innerH - h));

      tipBg.attr("x", x).attr("y", y).attr("width", w).attr("height", h).attr("opacity", 1);

      // move text if we clamped bg
      const cx = x + w / 2;
      const cy = y + h / 2 + tbox.height / 3 - 2; // optically centered
      tipText.attr("x", cx).attr("y", cy);
    }

    groups.selectAll<SVGRectElement, any>("rect")
      .on("mouseenter", function (event, d) {
        moveTipToCursor(event, LABELS[d.key as keyof typeof LABELS], d.value);
        d3.select(this).transition().duration(120).attr("opacity", 0.95);
      })
      .on("mousemove", function (event, d) {
        moveTipToCursor(event, LABELS[d.key as keyof typeof LABELS], d.value);
      })
      .on("mouseleave", function () {
        tipText.transition().duration(120).style("opacity", 0);
        tipBg.transition().duration(120).attr("opacity", 0);
        d3.select(this).transition().duration(120).attr("opacity", 1);
      });

    // --- Horizontal legend UNDER x labels ---
    // We'll place it at y = innerH + 26 (below tick labels), centered across innerW.
    const legendY = innerH + 26;
    const legend = g.append("g").attr("class", "legend").attr("transform", `translate(0, ${legendY})`);

    const legendData = [
      { key: "min", label: "Min" },
      { key: "max", label: "Max" },
      { key: "avg", label: "Average" },
      { key: "median", label: "Median" },
    ] as const;

    // compute widths to center legend
    const itemGap = 22;
    const sample = legend.append("text").attr("font-size", 12).text("Average");
    const sampleW = (sample.node() as SVGTextElement).getComputedTextLength();
    sample.remove();
    const rectW = 18;
    const itemW = rectW + 8 + sampleW; // rough max width per item
    const totalW = legendData.length * itemW + (legendData.length - 1) * itemGap;
    const startX = Math.max(0, (innerW - totalW) / 2);

    const items = legend.selectAll(".leg-item").data(legendData).enter()
      .append("g").attr("class", "leg-item")
      .attr("transform", (_d, i) => `translate(${startX + i * (itemW + itemGap)}, 0)`);

    items.append("rect")
      .attr("width", rectW).attr("height", 10).attr("rx", 3)
      .attr("fill", d => `url(#grad-${d.key})`)
      .attr("filter","url(#glow)");

    items.append("text")
      .text(d => d.label)
      .attr("x", rectW + 8)
      .attr("y", 9)
      .attr("fill", "#cfe4ff")
      .attr("font-size", 12)
      .attr("dominant-baseline", "ideographic");
  }, [data, width, height]);

  return (
    <div
      style={{
        background: "radial-gradient(1200px 600px at 20% 0%, #0d1035 0%, #070820 60%, #050111 100%)",
        padding: 12,
        borderRadius: 14,
        boxShadow: "0 0 20px rgba(255,255,255,0.06) inset, 0 0 30px rgba(140,0,255,0.10)",
      }}
    >
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};
