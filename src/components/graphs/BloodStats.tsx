import * as d3 from 'd3'
import { useContext, useEffect, useMemo, useRef } from 'react'
import { AppContext } from 'src/state'
import { SampleStats, SampleStatsColumn } from 'src/type'
import { prepareStatsData } from 'src/utils/prepareGraphData'
import { formatSmallValues } from 'src/utils/utils'
import { GRID_COLOR, TICK_COLOR } from './utils/consts'
import { drawLabelSeparators } from './utils/labelSeperators'
import { useHoverTooltip } from './utils/tooltip'
import { drawVerticalGrid } from './utils/verticalGrid'



const GRAPH_SETTINGS = {
  SIZE:   { width: 700, height: 350 },
  MARGIN: { top: 30, right: 30, bottom: 80, left: 60 }
}
const CATEGORIES = ['min', 'max', 'avg', 'median'] as const
const STAT_GRADIENTS = {
  min:    ['#29d3ff', '#0a84ff'],
  max:    ['#ff7a45', '#ff1e1e'],
  avg:    ['#ff6fa5', '#ff2a6d'],
  median: ['#b07cff', '#7a39ff'],
} as const

export function BloodStatsGraph() {
  const { state } = useContext(AppContext)
  const { clients, selectedClient, selectedGraph } = state
  
  const current = clients[selectedClient]
  const samples = current?.samples || []
  const data = prepareStatsData(samples, selectedGraph)
  
  const svgRef = useRef<SVGSVGElement | null>(null)

  const { width, height, x0, x1, y, barsData } = useLayout({ data })

  useEffect(() => {
    if (!data?.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg.append('g').attr('transform', `translate(${GRAPH_SETTINGS.MARGIN.left},${GRAPH_SETTINGS.MARGIN.top})`)
    const defs = svg.append('defs')

    for (const key of CATEGORIES) {
      const [c1, c2] = STAT_GRADIENTS[key]
      const grad = defs
        .append('linearGradient')
        .attr('id', `grad-${key}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%')
      grad.append('stop').attr('offset', '0%').attr('stop-color', c1).attr('stop-opacity', 0.9)
      grad.append('stop').attr('offset', '100%').attr('stop-color', c2).attr('stop-opacity', 0.12)
    }

    drawVerticalGrid({g, height: height, xScale: x0 })

    // horizontal grid
    g.append('g')
      .attr('class', 'grid-y')
      .call(d3.axisLeft(y).ticks(6).tickSize(-width))
      .selectAll('line')
      .attr('stroke', GRID_COLOR)
      .attr('shape-rendering', 'crispEdges')
    g.select('.grid-y').select('path').attr('stroke', 'none')

    g.append('g').attr('class', 'y-axis')
    g.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${height})`)

    drawLabelSeparators({ g , width: width, height: height })

    // grouped bars
    const groups = g
      .selectAll('.marker')
      .data(barsData)
      .join((enter) =>
        enter
          .append('g')
          .attr('class', 'marker')
          .attr('transform', d => `translate(${x0(d.name)},0)`)
      )

    groups
      .selectAll('rect.bar')
      .data(d => d.values)
      .join((enter) =>
        enter
          .append('rect')
          .attr('class', 'bar')
          .attr('x', d => x1(d.key)!)
          .attr('y', () => y(0))
          .attr('width', x1.bandwidth())
          .attr('height', () => height - y(0))
          .attr('rx', 6)
          .attr('fill', d => `url(#grad-${d.key})`)
      )
      
    drawLegend({g, width, height })
    
  }, [data, width, height, x0, x1, y, barsData])

  
  // Animations!
  useEffect(() => {
    if (!data?.length) return
    const svg = d3.select(svgRef.current)
    const g = svg.select<SVGGElement>('g')

    g.selectAll<SVGRectElement, SampleStatsColumn>('rect.bar')
      .transition()
      .duration(900)
      .ease(d3.easeCubicInOut)
      .attr('y', d => y(d.value))
      .attr('height', d => height - y(d.value))

    const yAxis = d3.axisLeft(y).ticks(6).tickSize(-width).tickFormat(v => formatSmallValues(+v))
    g.select<SVGGElement>('g.y-axis').transition().duration(900).call(yAxis)

    g.select('g.y-axis').selectAll('text').attr('fill', TICK_COLOR).attr('font-size', 12)
    g.select('g.y-axis').selectAll('line').attr('stroke', GRID_COLOR)
    g.select('g.y-axis').select('.domain').attr('stroke', 'none')

    drawLabelSeparators({ g , width, height })
    g.select('g.label-separators').raise()
  }, [data, width, height, x0, y])

   
  useHoverTooltip<SampleStatsColumn>({ 
    svgRef, 
    selector: 'rect.bar',
    getValue: d => d.value,
    getLabel: d =>({ min: 'Min', max: 'Max', avg: 'Average', median: 'Median'})[d.key] ?? d.key
  })

  return (
    <div style={{ padding: 12 }}>
      <svg ref={svgRef} width={GRAPH_SETTINGS.SIZE.width} height={GRAPH_SETTINGS.SIZE.height} />
    </div>
  )
}

interface LayoutProps {
  data: SampleStats[]
}

function useLayout({ data }: LayoutProps) {
  return useMemo(() => {
    const width = GRAPH_SETTINGS.SIZE.width - GRAPH_SETTINGS.MARGIN.left - GRAPH_SETTINGS.MARGIN.right
    const height = GRAPH_SETTINGS.SIZE.height - GRAPH_SETTINGS.MARGIN.top - GRAPH_SETTINGS.MARGIN.bottom

    const x0 = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width])
      .padding(0.24)

    const x1 = d3.scaleBand<string>()
      .domain(CATEGORIES)
      .range([0, x0.bandwidth()])
      .padding(0.12)

    const allVals = data.flatMap(d => [d.min, d.max, d.avg, d.median])
    const yMax = (d3.max(allVals) ?? 1) * 1.1
    const y = d3.scaleLinear().domain([0, yMax]).nice().range([height, 0])

    const barsData = data.map((d) => ({
      name: d.name,
      values: CATEGORIES.map((k) => ({ key: k, value: d[k], marker: d.name })),
    }))

    return { width, height, x0, x1, y, barsData }
  }, [data])
}


interface LegendProps {
  g:      d3.Selection<SVGGElement, unknown, null, undefined>
  height: number
  width:  number
}

function drawLegend({g, height, width } : LegendProps) {
  const LEG = { sw: 14, sh: 10, gap: 8, itemGap: 96, topOffset: height + 15}
  const items = [
    { key: 'min', label: 'Min' },
    { key: 'max', label: 'Max' },
    { key: 'avg', label: 'Average' },
    { key: 'median', label: 'Median' },
  ]

  const totalLegendWidth = items.length * LEG.itemGap - LEG.itemGap / 2
  const legendX = width / 2 - totalLegendWidth / 2

  const legend = g.selectAll<SVGGElement, unknown>('g.legend')
    .data([null])
    .join('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${legendX},${LEG.topOffset})`)
    .attr('pointer-events', 'none')

  const legendItem = legend
    .selectAll<SVGGElement, typeof items[number]>('g.legend-item')
    .data(items)
    .join('g')
    .attr('class', 'legend-item')
    .attr('transform', (_d, i) => `translate(${i * LEG.itemGap},0)`)

  legendItem
    .selectAll('rect.swatch')
    .data(d => [d])
    .join('rect')
    .attr('class', 'swatch')
    .attr('x', 0)
    .attr('y', -LEG.sh / 2)
    .attr('width', LEG.sw)
    .attr('height', LEG.sh)
    .attr('rx', 3)
    .attr('fill', d => `url(#grad-${d.key})`)

  legendItem
    .selectAll('text.label')
    .data(d => [d])
    .join('text')
    .attr('class', 'label')
    .attr('x', LEG.sw + LEG.gap)
    .attr('y', LEG.sh / 2)
    .attr('fill', TICK_COLOR)
    .attr('font-size', 12)
    .attr('text-anchor', 'start')
    .text(d => d.label)
}
