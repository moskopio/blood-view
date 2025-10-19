import * as d3 from "d3"
import { useEffect, useRef, useState } from "react"

interface SamplePoint {
  date: string;
  value: number;
}

interface BloodSampleGraphProps {
  data: SamplePoint[];
  width?: number;
  height?: number;
}

const gradients = [
  ["#ff6fa5", "#ff2a6d", "#ff004c"],
  ["#ff9b6f", "#ff4e2a", "#ff1000"],
  ["#ff6fff", "#d42aff", "#7500ff"],
  ["#6fd9ff", "#2ac8ff", "#007aff"],
  ["#9bff6f", "#4eff2a", "#00ff10"],
  ["#ffe66f", "#ffc72a", "#ff9e00"],
  ["#ff6fa5", "#ff2a6d", "#ff004c"],
];

export function BloodSampleGraph({
  data,
  width = 700,
  height = 350,
}: BloodSampleGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const prevDataRef = useRef<SamplePoint[] | null>(null);
  const prevYDomainRef = useRef<[number, number] | null>(null);
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    if (!data.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const isFirst = !prevDataRef.current;

    const parsed = data.map((d) => ({ ...d, dateObj: new Date(d.date) }));
    const dates = parsed.map((d) => d.date);

    const xScale = d3
      .scalePoint<string>()
      .domain(dates)
      .range([0, innerWidth])
      .padding(0.5);

    // Domains
    const yMaxNew = d3.max(parsed, (d) => d.value) ?? 1;
    const newYDomain: [number, number] = [0, yMaxNew * 1.15];

    const prevData = prevDataRef.current ?? data;
    const yMaxPrev = d3.max(prevData, (d) => d.value) ?? 1;
    const prevYDomain = prevYDomainRef.current ?? ([0, yMaxPrev * 1.15] as [number, number]);

    const yPrev = d3.scaleLinear().domain(prevYDomain).range([innerHeight, 0]);
    const yNew = d3.scaleLinear().domain(newYDomain).range([innerHeight, 0]);

    const prevMap = new Map(prevData.map((d) => [d.date, d.value]));

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Border
    svg
      .append("rect")
      .attr("x", 5)
      .attr("y", 5)
      .attr("width", width - 10)
      .attr("height", height - 10)
      .attr("rx", 10)
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 1.2)
      .attr("opacity", 0.7);

    // Defs (gradient + glow)
    const defs = svg.append("defs");
    const gradId = "blood-gradient";
    const grad = defs
      .append("linearGradient")
      .attr("id", gradId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    const [topColor, midColor, bottomColor] = gradients[colorIndex];
    grad
      .selectAll("stop")
      .data([
        { offset: "0%", color: topColor, opacity: 0.85 },
        { offset: "40%", color: midColor, opacity: 0.35 },
        { offset: "100%", color: bottomColor, opacity: 0.05 },
      ])
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color)
      .attr("stop-opacity", (d) => d.opacity);

    const glow = defs.append("filter").attr("id", "glow");
    glow.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "blur");
    const feMerge = glow.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "blur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Axes groups
    const yAxisGroup = g.append("g").attr("class", "y-axis");
    const xAxisGroup = g.append("g").attr("class", "x-axis").attr("transform", `translate(0,${innerHeight})`);

    // Generators (prev & new)
    const linePrev = d3
      .line<SamplePoint>()
      .x((d) => xScale(d.date)!)
      .y((d) => yPrev(prevMap.get(d.date) ?? d.value))
      .curve(d3.curveCatmullRom.alpha(0.6));

    const lineNew = d3
      .line<SamplePoint>()
      .x((d) => xScale(d.date)!)
      .y((d) => yNew(d.value))
      .curve(d3.curveCatmullRom.alpha(0.6));

    const areaPrev = d3
      .area<SamplePoint>()
      .x((d) => xScale(d.date)!)
      .y0(innerHeight)
      .y1((d) => yPrev(prevMap.get(d.date) ?? d.value))
      .curve(d3.curveCatmullRom.alpha(0.6));

    const areaNew = d3
      .area<SamplePoint>()
      .x((d) => xScale(d.date)!)
      .y0(innerHeight)
      .y1((d) => yNew(d.value))
      .curve(d3.curveCatmullRom.alpha(0.6));

    // Paths
    const areaPath = g
      .append("path")
      .datum(data)
      .attr("fill", `url(#${gradId})`)
      .attr("opacity", 0.9)
      .attr("d", areaPrev as any);

    const linePath = g
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#fff3f9")
      .attr("stroke-width", 3)
      .attr("filter", "url(#glow)")
      .attr("d", linePrev as any);

    // --- Dots: robust join -> single merged selection
    const dotsAll = g
      .selectAll<SVGCircleElement, SamplePoint>(".dot")
      .data(data, (d: any) => d.date)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("class", "dot")
            .attr("cx", (d) => xScale(d.date)!)
            .attr("cy", (d) => yPrev(prevMap.get(d.date) ?? d.value))
            .attr("r", isFirst ? 0 : 6)
            .attr("fill", "#ff8ab3")
            .attr("filter", "url(#glow)"),
        (update) =>
          update
            .attr("cx", (d) => xScale(d.date)!)
            .attr("cy", (d) => yPrev(prevMap.get(d.date) ?? d.value)),
        (exit) => exit.transition().duration(300).attr("r", 0).remove()
      )
      .raise(); // keep dots above area/line

    // If first render, grow dots in
    if (isFirst) {
      dotsAll.transition().duration(600).attr("r", 6);
    }

    // Tooltip (above dot)
    const tooltip = g.append("g").style("pointer-events", "none");
    const tooltipText = tooltip
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-1em")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .style("opacity", 0);

    function showTipAtCircle(circle: SVGCircleElement, value: number) {
      const cx = +d3.select(circle).attr("cx");
      const cy = +d3.select(circle).attr("cy");
      tooltipText
        .attr("x", cx)
        .attr("y", cy - 10)
        .text(value.toFixed(1))
        .transition()
        .duration(120)
        .style("opacity", 1);
    }
    function hideTip() {
      tooltipText.transition().duration(120).style("opacity", 0);
    }

    dotsAll
      .on("mouseenter", function (event, d) {
        showTipAtCircle(this, d.value);
        d3.select(this).transition().duration(150).attr("r", 8).attr("fill", "#fff3f9");
      })
      .on("mousemove", function (event, d) {
        showTipAtCircle(this, d.value); // keep it locked above the dot
      })
      .on("mouseleave", function () {
        hideTip();
        d3.select(this).transition().duration(150).attr("r", 6).attr("fill", "#ff8ab3");
      });

    // Animate paths & dots to new state (no y-domain tween)
    const duration = 1100;

    areaPath
      .transition()
      .duration(duration)
      .ease(d3.easeCubicInOut)
      .attrTween("d", () => d3.interpolateString(areaPrev(data) as any, areaNew(data) as any));

    linePath
      .transition()
      .duration(duration)
      .ease(d3.easeCubicInOut)
      .attrTween("d", () => d3.interpolateString(linePrev(data) as any, lineNew(data) as any));

    dotsAll
      .transition()
      .duration(duration)
      .ease(d3.easeCubicInOut)
      .attr("cy", (d) => yNew(d.value));

    // Axes (transition to new scale)
    yAxisGroup
      .transition()
      .duration(duration)
      .call(d3.axisLeft(yNew).ticks(6).tickSize(-innerWidth).tickFormat(d3.format(".0f")) as any);
    yAxisGroup.selectAll("text").attr("fill", "#b0d8ff").attr("font-size", "12px");
    yAxisGroup.selectAll("line").attr("stroke", "#47a2ff22");

    xAxisGroup
      .call(d3.axisBottom(xScale).tickFormat((d) => d3.timeFormat("%b %d")(new Date(d))) as any)
      .selectAll("text")
      .attr("fill", "#b0d8ff")
      .attr("font-size", "12px");

    // Gradient cycling
    const nextIndex = (colorIndex + 1) % gradients.length;
    const nextColors = gradients[nextIndex];
    grad
      .selectAll("stop")
      .data([
        { offset: "0%", color: nextColors[0], opacity: 0.85 },
        { offset: "40%", color: nextColors[1], opacity: 0.35 },
        { offset: "100%", color: nextColors[2], opacity: 0.05 },
      ])
      .transition()
      .duration(1500)
      .ease(d3.easeCubicInOut)
      .attrTween("stop-color", function (d, i, nodes) {
        const current = d3.color(d3.select(nodes[i]).attr("stop-color"))!;
        const interp = d3.interpolateRgb(current, d.color);
        return (t) => interp(t);
      });

    setTimeout(() => setColorIndex(nextIndex), 2500);

    // Save state
    prevDataRef.current = data.map((d) => ({ ...d }));
    prevYDomainRef.current = newYDomain;
  }, [data, width, height, colorIndex]);

  return (
    <div
      style={{
        background: "radial-gradient(circle at 30% 30%, #0c0d2d, #050016 80%)",
        padding: 12,
        borderRadius: 14,
        boxShadow: "0 0 25px #ff226622, inset 0 0 30px #0c1f4a",
      }}
    >
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};
