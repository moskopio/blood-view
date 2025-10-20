import * as d3 from 'd3'

export function drawGradient(
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
  id: string,
  colors: string[]
) {
  const [top, mid, bottom] = colors

  const grad = defs
    .selectAll<SVGLinearGradientElement, unknown>(`linearGradient#${id}`)
    .data([null])
    .join('linearGradient')
    .attr('id', id)
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%')

  grad
    .selectAll<SVGStopElement, unknown>('stop')
    .data([
      { offset: '0%', color: top, opacity: 0.85 },
      { offset: '40%', color: mid, opacity: 0.35 },
      { offset: '100%', color: bottom, opacity: 0.05 },
    ])
    .join('stop')
    .attr('offset', (d) => d.offset)
    .attr('stop-color', (d) => d.color)
    .attr('stop-opacity', (d) => d.opacity)
}
