import * as d3 from 'd3'
import { RefObject, useEffect } from 'react'


interface Props<T> {
  svgRef:    RefObject<SVGSVGElement | null>
  selector:  string
  getValue:  (d: T) => number
  getLabel?: (d: T) => string
}
export function useHoverTooltip<T>(props: Props<T>) {
  const { svgRef, selector, getValue, getLabel } = props

  useEffect(() => {
    if (!svgRef.current) return

    const g = d3.select(svgRef.current).select<SVGGElement>('g')

    const tipLayer = g.selectAll('g.tooltip-layer').data([null]).join('g').attr('class', 'tooltip-layer')
    const tipText = tipLayer
      .selectAll('text')
      .data([null])
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-1em')
      .attr('fill', 'white')
      .attr('font-size', 12)
      .style('opacity', 0)

    function showTipAt(node: SVGElement, value: number, label?: string) {
      const cx = +d3.select(node).attr('cx')
      const cy = +d3.select(node).attr('cy')
      const text = `${label ? label + ': ' : ''}${value.toFixed(1)} mg/dL`
      tipText
        .attr('x', cx)
        .attr('y', cy)
        .text(text)
        .transition()
        .duration(250)
        .style('opacity', 1)
    }
    
    function hideTip() {
      tipText.transition().duration(250).style("opacity", 0)
    }

    const items = g.selectAll<SVGElement, T>(selector)

    items
      .on('mouseenter', function (_, d) {
        showTipAt(this, getValue(d), getLabel?.(d))
      })
      .on('mousemove', function (evt) {
        const [mx, my] = d3.pointer(evt, g.node() as SVGGElement)
        tipText.attr('x', mx).attr('y', my - 12)
      })
      .on("mouseleave", function () {
        hideTip()
      })

    return () => {
      items.on('mouseenter mousemove mouseleave', null)
    }
  }, [svgRef, selector, getValue, getLabel])
}
