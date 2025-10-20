import * as d3 from 'd3'

interface Props {
  g:      d3.Selection<SVGGElement, unknown, null, undefined>
  height: number
  width:  number
}

export function drawLabelSeparators(props: Props) {
  const { g, width, height } = props
  
  const sep = g
    .selectAll<SVGGElement, unknown>('g.label-separators')
    .data([null])
    .join('g')
    .attr('class', 'label-separators')
    .attr('pointer-events', 'none')
    .style('shape-rendering', 'crispEdges')

  // left vertical separator
  sep
    .selectAll('line.sep-left')
    .data([null])
    .join('line')
    .attr('class', 'sep-left')
    .attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', height)
    .attr('stroke', 'white').attr('stroke-opacity', 0.75).attr('stroke-width', 1)

  // bottom horizontal separator
  sep
    .selectAll('line.sep-bottom')
    .data([null])
    .join('line')
    .attr('class', 'sep-bottom')
    .attr('x1', 0).attr('y1', height).attr('x2', width).attr('y2', height)
    .attr('stroke', 'white').attr('stroke-opacity', 0.75).attr('stroke-width', 1)
}
