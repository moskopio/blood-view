import * as d3 from 'd3'
import { RefObject, useContext, useEffect, useMemo, useRef } from 'react'
import { AppContext } from 'src/state'
import { SamplePoint } from 'src/types'
import { prepareSampleData } from 'src/utils/prepareGraphData'
import { formatSmallValues } from 'src/utils/utils'
import { GRID_COLOR, TICK_COLOR } from './utils/consts'
import { drawGradient } from './utils/gradient'
import { drawLabelSeparators } from './utils/labelSeperators'
import { useHoverTooltip } from './utils/HoverTooltip'
import { drawVerticalGrid } from './utils/verticalGrid'

const GRAPH_SETTINGS = {
  SIZE:        { width: 700, height: 350 },
  MARGIN:      { top: 30, right: 30, bottom: 50, left: 60 },
  LINE:        { stroke: '#fff3f9', width: 3 },
  DOT:         { r: 6, fill: '#ff8ab3' },
  GRADIENT:    { id: 'blood-gradient', colors: ['#ff6fa5', '#ff2a6d', '#ff004c'] },
  TRANSITIONS: { main: 1000 }
}

export function BloodSampleGraph() {
  const { state } = useContext(AppContext)
  const { clients, selectedClient, selectedGraph } = state
  
  const current = clients[selectedClient]
  const samples = current?.samples || []
  const data = prepareSampleData(samples, selectedGraph)
  
  const svgRef = useRef<SVGSVGElement | null>(null)
  const prevDataRef = useRef<SamplePoint[]>(data)
  const prevYDomainRef = useRef<number[]>([0,0])


  const layout = useLayout({data, prevDataRef, prevYDomainRef})
  const { width, height, xScale, yPrev, yNew, prevMap, newYDomain } = layout

  const linePrev = useMemo(() => d3
    .line<SamplePoint>()
    .x(d => xScale(d.date)!)
    .y(d => yPrev(prevMap.get(d.date)!))
    .curve(d3.curveCatmullRom.alpha(0.6)),
  [xScale, yPrev, prevMap])
  
  const lineNew = useMemo(() => d3
    .line<SamplePoint>()
    .x(d => xScale(d.date)!)
    .y(d => yNew(d.value))
    .curve(d3.curveCatmullRom.alpha(0.6)),
  [xScale, yNew])
  
  const areaPrev = useMemo(() => d3
    .area<SamplePoint>()
    .x(d => xScale(d.date)!)
    .y0(height)
    .y1(d => yPrev(prevMap.get(d.date)!))
    .curve(d3.curveCatmullRom.alpha(0.6)),
  [xScale, height, yPrev, prevMap])
  
  const areaNew = useMemo(() =>d3
    .area<SamplePoint>()
    .x(d => xScale(d.date)!)
    .y0(height)
    .y1(d => yNew(d.value))
    .curve(d3.curveCatmullRom.alpha(0.6)),
  [xScale, height, yNew])

  useEffect(() => {
    if (!data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Note: interesting effect if removed!

    // We transform it to make room for labels on the left side
    const g = svg.append('g').attr('transform', `translate(${GRAPH_SETTINGS.MARGIN.left},${GRAPH_SETTINGS.MARGIN.top})`)
    const defs = svg.append('defs')
    
    
    // Area gradient
    drawGradient(defs, GRAPH_SETTINGS.GRADIENT.id, GRAPH_SETTINGS.GRADIENT.colors)
    drawVerticalGrid({g, height, xScale})
    drawLabelSeparators({ g, width, height })

    g.append('g').attr('class', 'y-axis')
    g.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${height})`)

    g.append('path')
      .attr('class', 'area')
      .datum(data)
      .attr('fill', `url(#${GRAPH_SETTINGS.GRADIENT.id})`)
      .attr('opacity', 0.9)
      .attr('d', areaPrev)

    g.append('path')
      .attr('class', 'line')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', GRAPH_SETTINGS.LINE.stroke)
      .attr('stroke-width', GRAPH_SETTINGS.LINE.width)
      .attr('d', linePrev)

    g.selectAll('circle.dot')
      .data(data)
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.date)!)
      .attr('cy', d => yPrev(prevMap.get(d.date)!))
      .attr('r', GRAPH_SETTINGS.DOT.r)
      .attr('fill', GRAPH_SETTINGS.DOT.fill)
  }, [data, width, height, xScale, yPrev, prevMap, areaPrev, linePrev])

  // Animations!
  useEffect(() => {
    if (!data.length) return

    const svg = d3.select(svgRef.current)
    const g = svg.select<SVGGElement>('g')

    g.select<SVGPathElement>('path.area')
      .transition()
      .duration(GRAPH_SETTINGS.TRANSITIONS.main)
      .ease(d3.easeCubicInOut)
      .attrTween('d', () => d3.interpolateString(areaPrev(data)!, areaNew(data)!))

    g.select<SVGPathElement>('path.line')
      .transition()
      .duration(GRAPH_SETTINGS.TRANSITIONS.main)
      .ease(d3.easeCubicInOut)
      .attrTween('d', () => d3.interpolateString(linePrev(data)!, lineNew(data)!))

    g.selectAll<SVGCircleElement, SamplePoint>('circle.dot')
      .data(data)
      .transition()
      .duration(GRAPH_SETTINGS.TRANSITIONS.main)
      .ease(d3.easeCubicInOut)
      .attr('cy', d => yNew(d.value))

    const yAxis = d3.axisLeft(yNew)
      .ticks(6)
      .tickSize(-width)
      .tickFormat(v => formatSmallValues(+v))

      
    // @ts-expect-error incorrect type casting TODO: fix it!
    g.select('g.y-axis').transition().duration(GRAPH_SETTINGS.TRANSITIONS.main).call(yAxis)
    g.select('g.y-axis').selectAll('text').attr('fill', TICK_COLOR).attr('font-size', 12)
    g.select('g.y-axis').selectAll('line').attr('stroke', GRID_COLOR)
    g.select('g.y-axis').select('.domain').attr('stroke', 'none')

  
    // @ts-expect-error Incorrect type casting TODO: fix it!
    g.select('g.x-axis').call(d3.axisBottom(xScale)
      .tickFormat(d => d3.timeFormat('%b %d')(new Date(d as string))))
      .selectAll('text')
      .attr('fill', TICK_COLOR)
      .attr('font-size', 12)

    // re-raise separators on top
    drawLabelSeparators({g, width, height})
    g.select('g.label-separators').raise()

    prevDataRef.current = data.map((d) => ({ ...d }))
    prevYDomainRef.current = newYDomain
  }, [data, width, height, xScale, yNew, areaPrev, areaNew, linePrev, lineNew, newYDomain])

  useHoverTooltip<SamplePoint>({ svgRef, selector: 'circle.dot', getValue: d => d.value })
  
  return (
    <div style={{ padding: 12 }}>
      <svg ref={svgRef} width={GRAPH_SETTINGS.SIZE.width} height={GRAPH_SETTINGS.SIZE.height} />
    </div>
  )
}

interface LayoutProps {
  data:           SamplePoint[],
  prevDataRef:    RefObject<SamplePoint[]>,
  prevYDomainRef: RefObject<number[]>,
}

function useLayout({ data, prevDataRef, prevYDomainRef}: LayoutProps) {
  return useMemo(() => {
    const width = GRAPH_SETTINGS.SIZE.width - GRAPH_SETTINGS.MARGIN.left - GRAPH_SETTINGS.MARGIN.right
    const height = GRAPH_SETTINGS.SIZE.height - GRAPH_SETTINGS.MARGIN.top - GRAPH_SETTINGS.MARGIN.bottom
    
    const prevData = prevDataRef.current

    const xDomain = data.map(d => d.date)
    const xScale = d3.scalePoint().domain(xDomain).range([0, width]).padding(0.5)
    const yMaxNew = d3.max(data, d => d.value) ?? 1
    
    const prevYDomain = prevYDomainRef.current
    const newYDomain = [0, yMaxNew * 1.15]

    const yPrev = d3.scaleLinear().domain(prevYDomain).range([height, 0])
    const yNew = d3.scaleLinear().domain(newYDomain).range([height, 0])

    const prevMap = new Map(prevData.map(d => [d.date, d.value]))
    return { width, height, xScale, yPrev, yNew, prevMap, newYDomain }
  }, [data])
}
