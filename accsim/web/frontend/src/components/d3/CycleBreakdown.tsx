'use client'
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { CycleBreakdown } from '@/lib/types'

interface Props {
  data?: CycleBreakdown
  title?: string
  labels?: Record<string, string>
}

const COLORS: Record<string, string> = {
  compute: '#3B82F6',
  memory: '#F59E0B',
  activation: '#10B981',
  stall: '#EF4444',
}

const DEFAULT_LABELS: Record<string, string> = {
  compute: 'Compute',
  memory: 'Memory',
  activation: 'Activation',
  stall: 'Stall/Elem',
}

export function CycleBreakdown({ data, title = 'Cycle Breakdown', labels = DEFAULT_LABELS }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const W = svgRef.current.clientWidth || 400
    const H = 240
    const margin = { top: 32, right: 24, bottom: 48, left: 70 }
    const w = W - margin.left - margin.right
    const h = H - margin.top - margin.bottom

    const keys = ['compute', 'memory', 'activation', 'stall'] as const
    const total = keys.reduce((s, k) => s + (data[k] ?? 0), 0)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // Title
    svg.append('text').attr('x', margin.left + w / 2).attr('y', 20)
      .attr('fill', '#FAFAFA').attr('font-size', '14px').attr('font-weight', '600')
      .attr('text-anchor', 'middle').text(title)

    const yScale = d3.scaleLinear().domain([0, total]).range([h, 0])
    const barW = Math.min(w * 0.4, 80)
    const barX = w / 2 - barW / 2

    let cumulative = 0
    keys.forEach((key) => {
      const val = data[key] ?? 0
      const barH = h - yScale(val)
      const y = yScale(cumulative + val)

      g.append('rect')
        .attr('x', barX).attr('y', h)
        .attr('width', barW).attr('height', 0)
        .attr('rx', 2).attr('fill', COLORS[key])
        .transition().duration(600).delay(keys.indexOf(key) * 100)
        .attr('y', y).attr('height', barH)

      // Label — only show if bar is tall enough
      if (val > 0 && barH > 20) {
        const pct = ((val / total) * 100).toFixed(1)
        g.append('text')
          .attr('x', barX + barW + 8).attr('y', y + barH / 2 + 4)
          .attr('fill', COLORS[key]).attr('font-size', '11px')
          .text(`${labels[key]}: ${pct}%`)
      }

      cumulative += val
    })

    // Y axis — reduced ticks, with "Cycles" title
    const yAxis = d3.axisLeft(yScale).ticks(3).tickFormat(d => `${(+d / 1000).toFixed(0)}k`)
    g.append('g').call(yAxis).selectAll('text,line,path').attr('stroke', '#71717A').attr('fill', '#71717A')

    // Y axis title
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(margin.top + h / 2)).attr('y', 16)
      .attr('fill', '#71717A').attr('font-size', '11px').attr('text-anchor', 'middle')
      .text('Cycles')

    // Legend at bottom
    const legendG = svg.append('g').attr('transform', `translate(${margin.left},${H - 20})`)
    keys.forEach((key, i) => {
      legendG.append('rect').attr('x', i * 90).attr('width', 10).attr('height', 10).attr('fill', COLORS[key]).attr('rx', 2)
      legendG.append('text').attr('x', i * 90 + 14).attr('y', 9).attr('fill', '#A1A1AA').attr('font-size', '10px')
        .text(labels[key])
    })

  }, [data, title, labels])

  return (
    <div className="bg-surface1 rounded-xl border border-border p-4">
      <svg ref={svgRef} className="w-full" style={{ height: 240 }} />
    </div>
  )
}
