'use client'
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface Props {
  data: number[][]
  title?: string
  unitLabel?: string
}

export function PEHeatmap({ data, title = 'PE Utilization', unitLabel = 'utilization' }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const n = data.length
    const size = Math.min(svgRef.current.clientWidth || 400, 400)
    const margin = { top: 32, right: 16, bottom: 16, left: 16 }
    const cellSize = (size - margin.left - margin.right) / n

    const colorScale = d3.scaleSequential(d3.interpolateRgbBasis(['#27272A', '#1D4ED8', '#3B82F6', '#10B981']))
      .domain([0, 1])

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // Title
    svg.append('text').attr('x', size / 2).attr('y', 20)
      .attr('fill', '#FAFAFA').attr('font-size', '14px').attr('font-weight', '600')
      .attr('text-anchor', 'middle').text(title)

    // Cells
    data.forEach((row, rowIdx) => {
      row.forEach((val, colIdx) => {
        g.append('rect')
          .attr('x', colIdx * cellSize + 1).attr('y', rowIdx * cellSize + 1)
          .attr('width', cellSize - 2).attr('height', cellSize - 2)
          .attr('rx', 3)
          .attr('fill', colorScale(val))
          .append('title')
          .text(`PE[${rowIdx},${colIdx}]: ${(val * 100).toFixed(1)}% ${unitLabel}`)
      })
    })

    // Color bar
    const barW = (size - margin.left - margin.right)
    const barH = 8
    const barY = n * cellSize + 12
    const defs = svg.append('defs')
    const linearGrad = defs.append('linearGradient').attr('id', 'heatmap-grad')
    linearGrad.append('stop').attr('offset', '0%').attr('stop-color', '#27272A')
    linearGrad.append('stop').attr('offset', '50%').attr('stop-color', '#3B82F6')
    linearGrad.append('stop').attr('offset', '100%').attr('stop-color', '#10B981')

    g.append('rect')
      .attr('x', 0).attr('y', barY)
      .attr('width', barW).attr('height', barH).attr('rx', 4)
      .attr('fill', 'url(#heatmap-grad)')

    g.append('text').attr('x', 0).attr('y', barY + barH + 14)
      .attr('fill', '#71717A').attr('font-size', '10px').text('0%')
    g.append('text').attr('x', barW).attr('y', barY + barH + 14)
      .attr('fill', '#71717A').attr('font-size', '10px').attr('text-anchor', 'end').text('100%')

  }, [data, title, unitLabel])

  return (
    <div className="bg-surface1 rounded-xl border border-border p-4">
      <svg ref={svgRef} className="w-full" style={{ height: 420 }} />
    </div>
  )
}
