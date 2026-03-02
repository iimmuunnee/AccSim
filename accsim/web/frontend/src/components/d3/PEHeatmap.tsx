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
    const containerW = svgRef.current.clientWidth || 400
    const maxCellSize = 48
    const margin = { top: 32, right: 16, bottom: 16, left: 32 }
    const availW = containerW - margin.left - margin.right
    const cellSize = Math.min(availW / n, maxCellSize)
    const gridW = cellSize * n
    const offsetX = margin.left + (availW - gridW) / 2

    const colorScale = d3.scaleSequential(d3.interpolateRgbBasis(['#27272A', '#1D4ED8', '#3B82F6', '#10B981']))
      .domain([0, 1])

    const g = svg.append('g').attr('transform', `translate(${offsetX},${margin.top})`)

    // Title
    svg.append('text').attr('x', containerW / 2).attr('y', 20)
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

    // Row/col index labels for n>=16 (every 4th)
    if (n >= 16) {
      for (let i = 0; i < n; i += 4) {
        g.append('text')
          .attr('x', -4).attr('y', i * cellSize + cellSize / 2 + 3)
          .attr('fill', '#71717A').attr('font-size', '10px').attr('text-anchor', 'end')
          .text(i.toString())
        g.append('text')
          .attr('x', i * cellSize + cellSize / 2).attr('y', n * cellSize + 12)
          .attr('fill', '#71717A').attr('font-size', '10px').attr('text-anchor', 'middle')
          .text(i.toString())
      }
    }

    // Color bar
    const barW = gridW
    const barH = 8
    const barY = n * cellSize + (n >= 16 ? 20 : 12)
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
