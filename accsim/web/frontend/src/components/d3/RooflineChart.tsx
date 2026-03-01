'use client'
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { RooflinePoint, HardwareConfig } from '@/lib/types'

interface Props {
  data?: RooflinePoint
  config?: HardwareConfig
  locale?: string
  labels?: {
    xAxis: string
    yAxis: string
    memoryBound: string
    computeBound: string
    workload: string
  }
}

const DEFAULT_LABELS = {
  xAxis: 'Arithmetic Intensity (FLOP/Byte)',
  yAxis: 'Performance (GOPS)',
  memoryBound: 'Memory Bound',
  computeBound: 'Compute Bound',
  workload: 'Workload',
}

export function RooflineChart({ data, config, labels = DEFAULT_LABELS }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const peakGops = config?.peak_gops ?? 0.128
  const bandwidth = config?.dram_bandwidth_gbps ?? 25.6

  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const W = containerRef.current?.clientWidth || 600
    const H = 360
    const margin = { top: 24, right: 24, bottom: 50, left: 64 }
    const w = W - margin.left - margin.right
    const h = H - margin.top - margin.bottom

    svg.attr('width', W).attr('height', H)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const xDomain: [number, number] = [0.1, 100]
    const yDomain: [number, number] = [0.001, peakGops * 2]

    const xScale = d3.scaleLog().domain(xDomain).range([0, w])
    const yScale = d3.scaleLog().domain(yDomain).range([h, 0])

    // Grid lines — reduced tick count
    const xGrid = d3.axisBottom(xScale).ticks(4, '~s').tickSize(-h)
    const yGrid = d3.axisLeft(yScale).ticks(4, '~s').tickSize(-w)

    g.append('g').attr('class', 'grid').attr('transform', `translate(0,${h})`).call(xGrid)
      .selectAll('line,path').attr('stroke', '#3F3F46').attr('stroke-opacity', 0.4)
    g.append('g').attr('class', 'grid').call(yGrid)
      .selectAll('line,path').attr('stroke', '#3F3F46').attr('stroke-opacity', 0.4)
    g.selectAll('.grid text').remove()

    // Axes — reduced tick count, SI prefix format
    const xAxis = d3.axisBottom(xScale).ticks(4, '~s')
    const yAxis = d3.axisLeft(yScale).ticks(4, '~s')
    g.append('g').attr('transform', `translate(0,${h})`).call(xAxis)
      .selectAll('text,line,path').attr('stroke', '#71717A').attr('fill', '#71717A')
    g.append('g').call(yAxis)
      .selectAll('text,line,path').attr('stroke', '#71717A').attr('fill', '#71717A')

    // Memory bound line
    const ridgeAI = peakGops / bandwidth
    const memPoints: [number, number][] = [
      [xDomain[0], bandwidth * xDomain[0]],
      [ridgeAI, peakGops],
    ]
    g.append('path')
      .datum(memPoints)
      .attr('fill', 'none')
      .attr('stroke', '#F59E0B')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,3')
      .attr('d', d3.line<[number, number]>()
        .x(d => xScale(d[0]))
        .y(d => yScale(Math.min(d[1], yDomain[1])))
      )

    // Compute bound line
    g.append('line')
      .attr('x1', xScale(ridgeAI)).attr('y1', yScale(peakGops))
      .attr('x2', w).attr('y2', yScale(peakGops))
      .attr('stroke', '#10B981').attr('stroke-width', 2).attr('stroke-dasharray', '6,3')

    // Labels
    g.append('text').attr('x', xScale(ridgeAI) / 2).attr('y', yScale(peakGops / 2) - 8)
      .attr('fill', '#F59E0B').attr('font-size', '11px').attr('text-anchor', 'middle')
      .text(labels.memoryBound)

    g.append('text').attr('x', w - 8).attr('y', yScale(peakGops) - 8)
      .attr('fill', '#10B981').attr('font-size', '11px').attr('text-anchor', 'end')
      .text(labels.computeBound)

    // Workload point
    if (data) {
      const cx = xScale(Math.max(xDomain[0], Math.min(xDomain[1], data.operational_intensity)))
      const cy = yScale(Math.max(yDomain[0], Math.min(yDomain[1], data.performance)))

      g.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', 0)
        .attr('fill', '#3B82F6')
        .attr('stroke', '#FAFAFA').attr('stroke-width', 2)
        .transition().duration(600).ease(d3.easeCubicOut)
        .attr('r', 8)

      g.append('text')
        .attr('x', cx + 12).attr('y', cy - 6)
        .attr('fill', '#FAFAFA').attr('font-size', '12px').attr('font-weight', '600')
        .text(labels.workload)
    }

    // Axis labels
    svg.append('text')
      .attr('x', margin.left + w / 2).attr('y', H - 6)
      .attr('fill', '#71717A').attr('font-size', '12px').attr('text-anchor', 'middle')
      .text(labels.xAxis)

    svg.append('text')
      .attr('transform', `rotate(-90)`)
      .attr('x', -(margin.top + h / 2)).attr('y', 16)
      .attr('fill', '#71717A').attr('font-size', '12px').attr('text-anchor', 'middle')
      .text(labels.yAxis)

  }, [data, peakGops, bandwidth, labels])

  return (
    <div ref={containerRef} className="w-full bg-surface1 rounded-xl border border-border p-4">
      <svg ref={svgRef} className="w-full" style={{ height: 360 }} />
    </div>
  )
}
