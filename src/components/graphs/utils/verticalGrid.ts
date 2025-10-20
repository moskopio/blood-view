import * as d3 from 'd3'
import { GRID_COLOR } from './consts'

interface Props {
  g:      d3.Selection<SVGGElement, unknown, null, undefined>
  height: number
  xScale: d3.ScalePoint<string> | d3.ScaleBand<string>
}

export function drawVerticalGrid(props: Props) {
  const { g, height, xScale } = props
  const axis = d3.axisBottom(xScale).tickSize(-height)

  const grid = g
    .selectAll<SVGGElement, unknown>('g.x-grid')
    .data([null])
    .join('g')
    .attr('class', 'x-grid')
    .attr('transform', `translate(0,${height})`)
    .call(axis)

  grid.selectAll('line').attr('stroke', GRID_COLOR)
  grid.select('.domain').attr('stroke', 'none')
}
