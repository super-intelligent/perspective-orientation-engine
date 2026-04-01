'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Claim } from '@/types/orientation'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VizMode = 'sphere' | 'quadrant' | 'cynefin' | 'gravity' | 'tension'

interface TensorDatasphereProps {
  claims: Claim[]
  centralClaimId: string | string[] | undefined
}

interface Projected {
  screenX: number
  screenY: number
  depth: number
  scale: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QUADRANT_COLORS: Record<string, string> = {
  UL: '#a78bfa',
  UR: '#60a5fa',
  LL: '#4ade80',
  LR: '#fb923c',
}

const RELEVANCE_RADIUS: Record<string, number> = {
  High: 11,
  Medium: 8,
  Low: 5,
}

const DOMAIN_DEPTH: Record<string, number> = {
  Clear: 0.8,
  Complicated: 0.3,
  Complex: -0.3,
  Chaotic: -0.8,
  Confused: 0,
}

const CENTRAL_COLOR = '#f59e0b'
const CANVAS_BG = '#0d0d0d'
const LINE_COLOR = 'rgba(245,245,245,0.08)'
const TENSION_COLOR = 'rgba(245,159,11,0.35)'
const AXIS_LABEL_COLOR = 'rgba(245,245,245,0.30)'

const MODES: { key: VizMode; label: string }[] = [
  { key: 'sphere', label: 'Datasphere' },
  { key: 'quadrant', label: 'Quadrant' },
  { key: 'cynefin', label: 'Cynefin' },
  { key: 'gravity', label: 'Gravity' },
  { key: 'tension', label: 'Tension' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function get3DPos(claim: Claim): [number, number, number] {
  const x = claim.quadrant === 'LL' || claim.quadrant === 'LR' ? 0.55 : -0.55
  const y = claim.quadrant === 'UL' || claim.quadrant === 'LL' ? 0.55 : -0.55
  const z = DOMAIN_DEPTH[claim.domain] ?? 0
  const seq = parseInt(claim.id.replace(/\D/g, '') || '1')
  const s = seq * 100 + 37
  const jx = ((s * 17) % 97) / 97 * 0.28 - 0.14
  const jy = ((s * 31) % 89) / 89 * 0.28 - 0.14
  const jz = ((s * 53) % 79) / 79 * 0.22 - 0.11
  return [x + jx, y + jy, z + jz]
}

function project(
  pos: [number, number, number],
  rX: number,
  rY: number,
  cx: number,
  cy: number,
  sphereRadius: number,
): Projected {
  const [x, y, z] = pos
  const x1 = x * Math.cos(rY) - z * Math.sin(rY)
  const z1 = x * Math.sin(rY) + z * Math.cos(rY)
  const y2 = y * Math.cos(rX) - z1 * Math.sin(rX)
  const z2 = y * Math.sin(rX) + z1 * Math.cos(rX)
  const fov = 2.5
  const pScale = fov / (fov + z2)
  return {
    screenX: cx + x1 * sphereRadius * pScale,
    screenY: cy - y2 * sphereRadius * pScale,
    depth: z2,
    scale: pScale,
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function colorWithAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r},${g},${b},${alpha})`
}

// Deterministic jitter for 2D modes
function jitter2D(seq: number, range: number): [number, number] {
  const s = seq * 100 + 37
  const jx = ((s * 17) % 97) / 97 * range - range / 2
  const jy = ((s * 31) % 89) / 89 * range - range / 2
  return [jx, jy]
}

// ---------------------------------------------------------------------------
// 2D position helpers for each mode
// ---------------------------------------------------------------------------

function getQuadrantPos(claim: Claim, W: number, H: number): [number, number] {
  const quadCenters: Record<string, [number, number]> = {
    UL: [W * 0.25, H * 0.25],
    UR: [W * 0.75, H * 0.25],
    LL: [W * 0.25, H * 0.75],
    LR: [W * 0.75, H * 0.75],
  }
  const [cx, cy] = quadCenters[claim.quadrant] ?? [W / 2, H / 2]
  const seq = parseInt(claim.id.replace(/\D/g, '') || '1')
  const [jx, jy] = jitter2D(seq, W * 0.28)
  return [cx + jx, cy + jy]
}

function getCynefinPos(claim: Claim, W: number, H: number): [number, number] {
  const domainZones: Record<string, [number, number]> = {
    Complex: [W * 0.25, H * 0.25],
    Complicated: [W * 0.75, H * 0.25],
    Chaotic: [W * 0.25, H * 0.75],
    Clear: [W * 0.75, H * 0.75],
    Confused: [W * 0.5, H * 0.5],
  }
  const [cx, cy] = domainZones[claim.domain] ?? [W / 2, H / 2]
  const seq = parseInt(claim.id.replace(/\D/g, '') || '1')
  const [jx, jy] = jitter2D(seq, claim.domain === 'Confused' ? W * 0.12 : W * 0.28)
  return [cx + jx, cy + jy]
}

function getGravityPositions(
  claims: Claim[],
  centralIds: string[],
  W: number,
  H: number,
): Map<string, [number, number]> {
  const cx = W / 2
  const cy = H / 2
  const dim = Math.min(W, H)
  const positions = new Map<string, [number, number]>()

  const ringRadii: Record<string, number> = {
    direct_observation: dim * 0.18,
    structural_support: dim * 0.30,
    narrative_pressure: dim * 0.42,
    internal_anchoring: dim * 0.54,
  }
  const outerRadius = dim * 0.62

  // Central claims at center
  centralIds.forEach((id) => positions.set(id, [cx, cy]))

  // Group non-central by gravity_role
  const rings: Record<string, Claim[]> = {}
  claims.forEach((c) => {
    if (centralIds.includes(c.id)) return
    const role = c.gravity_role ?? '_outer'
    if (!rings[role]) rings[role] = []
    rings[role].push(c)
  })

  Object.entries(rings).forEach(([role, roleClaims]) => {
    const r = ringRadii[role] ?? outerRadius
    roleClaims.forEach((c, i) => {
      const angle = (2 * Math.PI / roleClaims.length) * i - Math.PI / 2
      positions.set(c.id, [cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
    })
  })

  return positions
}

function getTensionPositions(claims: Claim[], W: number, H: number): Map<string, [number, number]> {
  const cx = W / 2
  const cy = H / 2
  const layoutRadius = Math.min(W, H) * 0.32
  const positions = new Map<string, [number, number]>()

  claims.forEach((c, i) => {
    const angle = (2 * Math.PI / claims.length) * i - Math.PI / 2
    positions.set(c.id, [cx + layoutRadius * Math.cos(angle), cy + layoutRadius * Math.sin(angle)])
  })

  return positions
}

// ---------------------------------------------------------------------------
// Get target positions for any mode
// ---------------------------------------------------------------------------

function getTargetPositions(
  claims: Claim[],
  centralIds: string[],
  mode: VizMode,
  rX: number,
  rY: number,
  W: number,
  H: number,
): Map<string, [number, number]> {
  const positions = new Map<string, [number, number]>()
  const cx = W / 2
  const cy = H / 2
  const sphereRadius = Math.min(W, H) * 0.36

  if (mode === 'sphere') {
    claims.forEach((c) => {
      const pos3d = get3DPos(c)
      const proj = project(pos3d, rX, rY, cx, cy, sphereRadius)
      positions.set(c.id, [proj.screenX, proj.screenY])
    })
  } else if (mode === 'quadrant') {
    claims.forEach((c) => positions.set(c.id, getQuadrantPos(c, W, H)))
  } else if (mode === 'cynefin') {
    claims.forEach((c) => positions.set(c.id, getCynefinPos(c, W, H)))
  } else if (mode === 'gravity') {
    return getGravityPositions(claims, centralIds, W, H)
  } else if (mode === 'tension') {
    return getTensionPositions(claims, W, H)
  }

  return positions
}

// ---------------------------------------------------------------------------
// Draw functions
// ---------------------------------------------------------------------------

function drawAxisLines(
  ctx: CanvasRenderingContext2D,
  rX: number,
  rY: number,
  cx: number,
  cy: number,
  sphereRadius: number,
) {
  ctx.save()
  ctx.strokeStyle = AXIS_LABEL_COLOR
  ctx.globalAlpha = 0.15
  ctx.lineWidth = 1
  ctx.setLineDash([6, 8])
  const axes: [number, number, number][][] = [
    [[-1, 0, 0], [1, 0, 0]],
    [[0, -1, 0], [0, 1, 0]],
    [[0, 0, -1], [0, 0, 1]],
  ]
  axes.forEach(([from, to]) => {
    const p1 = project(from, rX, rY, cx, cy, sphereRadius)
    const p2 = project(to, rX, rY, cx, cy, sphereRadius)
    ctx.beginPath()
    ctx.moveTo(p1.screenX, p1.screenY)
    ctx.lineTo(p2.screenX, p2.screenY)
    ctx.stroke()
  })
  ctx.restore()
}

function drawTensionLines(
  ctx: CanvasRenderingContext2D,
  claims: Claim[],
  projections: Map<string, Projected>,
) {
  ctx.save()
  ctx.strokeStyle = TENSION_COLOR
  ctx.lineWidth = 1
  ctx.setLineDash([4, 6])

  claims.forEach((src) => {
    const srcProj = projections.get(src.id)
    if (!srcProj) return

    claims.forEach((tgt) => {
      if (src.id >= tgt.id) return // avoid duplicates
      const tgtProj = projections.get(tgt.id)
      if (!tgtProj) return

      const connected =
        (src.quadrant_tension ?? []).includes(tgt.quadrant) ||
        (src.domain_tension ?? []).includes(tgt.domain) ||
        (tgt.quadrant_tension ?? []).includes(src.quadrant) ||
        (tgt.domain_tension ?? []).includes(src.domain)

      if (!connected) return

      const avgDepth = (srcProj.depth + tgtProj.depth) / 2
      const alpha = 0.15 + 0.2 * ((avgDepth + 1) / 2)
      ctx.globalAlpha = Math.max(0.08, Math.min(alpha, 0.4))

      ctx.beginPath()
      ctx.moveTo(srcProj.screenX, srcProj.screenY)
      ctx.lineTo(tgtProj.screenX, tgtProj.screenY)
      ctx.stroke()
    })
  })

  ctx.restore()
}

function drawGlowRings(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  nodeRadius: number,
) {
  const rings = [
    { r: nodeRadius + 8, a: 'rgba(245,159,11,0.15)' },
    { r: nodeRadius + 16, a: 'rgba(245,159,11,0.09)' },
    { r: nodeRadius + 26, a: 'rgba(245,159,11,0.05)' },
  ]
  rings.forEach(({ r, a }) => {
    ctx.beginPath()
    ctx.arc(sx, sy, r, 0, Math.PI * 2)
    ctx.strokeStyle = a
    ctx.lineWidth = 1.5
    ctx.stroke()
  })
}

function drawNode(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  radius: number,
  fillColor: string,
  alpha: number,
  isSelected: boolean,
) {
  ctx.beginPath()
  ctx.arc(sx, sy, radius, 0, Math.PI * 2)
  ctx.fillStyle = colorWithAlpha(fillColor, alpha)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth = 0.5
  ctx.stroke()

  if (isSelected) {
    ctx.beginPath()
    ctx.arc(sx, sy, radius + 2, 0, Math.PI * 2)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  fontSize: number,
) {
  ctx.save()
  ctx.font = `${fontSize}px sans-serif`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.fillText(text, x, y)
  ctx.restore()
}

// ---------------------------------------------------------------------------
// Mode-specific draw routines
// ---------------------------------------------------------------------------

function drawSphereMode(
  ctx: CanvasRenderingContext2D,
  claims: Claim[],
  centralIds: string[],
  rX: number,
  rY: number,
  cx: number,
  cy: number,
  sphereRadius: number,
  selectedClaim: Claim | null,
  animPositions: Map<string, [number, number]> | null,
) {
  drawAxisLines(ctx, rX, rY, cx, cy, sphereRadius)

  // Build projections for tension lines and sorting
  const projMap = new Map<string, Projected>()
  claims.forEach((c) => {
    const pos3d = get3DPos(c)
    const proj = project(pos3d, rX, rY, cx, cy, sphereRadius)
    projMap.set(c.id, proj)
  })

  drawTensionLines(ctx, claims, projMap)

  // Sort back-to-front
  const sorted = [...claims].sort((a, b) => {
    const pa = projMap.get(a.id)!
    const pb = projMap.get(b.id)!
    return pa.depth - pb.depth
  })

  // Draw glow rings for central claim(s) before nodes
  sorted.forEach((c) => {
    if (!centralIds.includes(c.id)) return
    const p = animPositions?.get(c.id)
    const proj = projMap.get(c.id)!
    const sx = p ? p[0] : proj.screenX
    const sy = p ? p[1] : proj.screenY
    const nodeRadius = (RELEVANCE_RADIUS[c.relevance] ?? 8) * proj.scale * 0.85
    drawGlowRings(ctx, sx, sy, nodeRadius)
  })

  // Draw nodes
  sorted.forEach((c) => {
    const proj = projMap.get(c.id)!
    const p = animPositions?.get(c.id)
    const sx = p ? p[0] : proj.screenX
    const sy = p ? p[1] : proj.screenY
    const isCentral = centralIds.includes(c.id)
    const fillColor = isCentral ? CENTRAL_COLOR : (QUADRANT_COLORS[c.quadrant] ?? '#888')
    const nodeRadius = (RELEVANCE_RADIUS[c.relevance] ?? 8) * proj.scale * 0.85
    const alpha = 0.5 + 0.5 * ((proj.depth + 1) / 2)
    drawNode(ctx, sx, sy, nodeRadius, fillColor, Math.min(Math.max(alpha, 0.5), 1), selectedClaim?.id === c.id)

    // Archetype label for central claim
    if (isCentral) {
      drawLabel(ctx, c.archetype, sx, sy + nodeRadius + 14, '#ffffff', 10)
    }
  })
}

function drawQuadrantMode(
  ctx: CanvasRenderingContext2D,
  claims: Claim[],
  centralIds: string[],
  W: number,
  H: number,
  selectedClaim: Claim | null,
  animPositions: Map<string, [number, number]>,
) {
  // Divider cross
  ctx.save()
  ctx.strokeStyle = LINE_COLOR
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(W / 2, 0)
  ctx.lineTo(W / 2, H)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, H / 2)
  ctx.lineTo(W, H / 2)
  ctx.stroke()
  ctx.restore()

  // Labels
  const labels: [string, number, number][] = [
    ['Interior / Individual', 16, 18],
    ['Exterior / Individual', W - 16, 18],
    ['Interior / Collective', 16, H - 8],
    ['Exterior / Collective', W - 16, H - 8],
  ]
  ctx.save()
  ctx.font = '9px sans-serif'
  ctx.fillStyle = AXIS_LABEL_COLOR
  labels.forEach(([text, x, y]) => {
    ctx.textAlign = x < W / 2 ? 'left' : 'right'
    ctx.fillText(text, x, y)
  })
  ctx.restore()

  // Nodes
  claims.forEach((c) => {
    const p = animPositions.get(c.id) ?? getQuadrantPos(c, W, H)
    const isCentral = centralIds.includes(c.id)
    const fillColor = isCentral ? CENTRAL_COLOR : (QUADRANT_COLORS[c.quadrant] ?? '#888')
    const nodeRadius = RELEVANCE_RADIUS[c.relevance] ?? 8
    if (isCentral) drawGlowRings(ctx, p[0], p[1], nodeRadius)
    drawNode(ctx, p[0], p[1], nodeRadius, fillColor, 0.9, selectedClaim?.id === c.id)
  })
}

function drawCynefinMode(
  ctx: CanvasRenderingContext2D,
  claims: Claim[],
  centralIds: string[],
  W: number,
  H: number,
  selectedClaim: Claim | null,
  animPositions: Map<string, [number, number]>,
) {
  // Background washes
  const zones: [string, number, number, number, number][] = [
    ['rgba(167,139,250,0.06)', 0, 0, W / 2, H / 2],
    ['rgba(96,165,250,0.05)', W / 2, 0, W / 2, H / 2],
    ['rgba(251,146,60,0.08)', 0, H / 2, W / 2, H / 2],
    ['rgba(74,222,128,0.05)', W / 2, H / 2, W / 2, H / 2],
  ]
  zones.forEach(([color, x, y, w, h]) => {
    ctx.fillStyle = color
    ctx.fillRect(x, y, w, h)
  })

  // Confused center circle
  const hasConfused = claims.some((c) => c.domain === 'Confused')
  if (hasConfused) {
    ctx.beginPath()
    ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.08, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(200,200,200,0.04)'
    ctx.fill()
  }

  // Divider
  ctx.save()
  ctx.strokeStyle = LINE_COLOR
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(W / 2, 0)
  ctx.lineTo(W / 2, H)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, H / 2)
  ctx.lineTo(W, H / 2)
  ctx.stroke()
  ctx.restore()

  // Zone labels
  const domLabels: [string, number, number][] = [
    ['Complex', W * 0.25, H * 0.08],
    ['Complicated', W * 0.75, H * 0.08],
    ['Chaotic', W * 0.25, H * 0.92],
    ['Clear', W * 0.75, H * 0.92],
  ]
  if (hasConfused) domLabels.push(['Confused', W * 0.5, H * 0.5 + Math.min(W, H) * 0.08 + 14])
  ctx.save()
  ctx.font = '9px sans-serif'
  ctx.fillStyle = AXIS_LABEL_COLOR
  ctx.textAlign = 'center'
  domLabels.forEach(([text, x, y]) => ctx.fillText(text, x, y))
  ctx.restore()

  // Nodes
  claims.forEach((c) => {
    const p = animPositions.get(c.id) ?? getCynefinPos(c, W, H)
    const isCentral = centralIds.includes(c.id)
    const fillColor = isCentral ? CENTRAL_COLOR : (QUADRANT_COLORS[c.quadrant] ?? '#888')
    const nodeRadius = RELEVANCE_RADIUS[c.relevance] ?? 8
    if (isCentral) drawGlowRings(ctx, p[0], p[1], nodeRadius)
    drawNode(ctx, p[0], p[1], nodeRadius, fillColor, 0.9, selectedClaim?.id === c.id)
  })
}

function drawGravityMode(
  ctx: CanvasRenderingContext2D,
  claims: Claim[],
  centralIds: string[],
  W: number,
  H: number,
  selectedClaim: Claim | null,
  animPositions: Map<string, [number, number]>,
) {
  const cx = W / 2
  const cy = H / 2
  const dim = Math.min(W, H)

  const ringRadii: Record<string, number> = {
    direct_observation: dim * 0.18,
    structural_support: dim * 0.30,
    narrative_pressure: dim * 0.42,
    internal_anchoring: dim * 0.54,
  }

  const ringLabels: Record<string, string> = {
    direct_observation: 'Direct observation',
    structural_support: 'Structural support',
    narrative_pressure: 'Narrative pressure',
    internal_anchoring: 'Internal anchoring',
  }

  // Orbital guide circles
  const usedRoles = new Set(claims.map((c) => c.gravity_role).filter(Boolean))
  ctx.save()
  ctx.strokeStyle = LINE_COLOR
  ctx.globalAlpha = 0.12
  ctx.lineWidth = 1
  Object.entries(ringRadii).forEach(([role, r]) => {
    if (!usedRoles.has(role)) return
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
  })
  // Outer ring if there are null gravity_role non-central claims
  const hasOuter = claims.some((c) => !centralIds.includes(c.id) && !c.gravity_role)
  if (hasOuter) {
    ctx.beginPath()
    ctx.arc(cx, cy, dim * 0.62, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()

  // Ring labels
  ctx.save()
  ctx.font = '8px sans-serif'
  ctx.fillStyle = AXIS_LABEL_COLOR
  ctx.textAlign = 'center'
  Object.entries(ringRadii).forEach(([role, r]) => {
    if (!usedRoles.has(role)) return
    ctx.fillText(ringLabels[role] ?? role, cx, cy - r - 6)
  })
  ctx.restore()

  // Radial lines from center to each node
  ctx.save()
  ctx.strokeStyle = LINE_COLOR
  ctx.globalAlpha = 0.08
  ctx.lineWidth = 1
  claims.forEach((c) => {
    if (centralIds.includes(c.id)) return
    const p = animPositions.get(c.id)
    if (!p) return
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(p[0], p[1])
    ctx.stroke()
  })
  ctx.restore()

  // Nodes — central first (drawn last visually but we draw central glow first)
  claims.forEach((c) => {
    const p = animPositions.get(c.id) ?? [cx, cy]
    const isCentral = centralIds.includes(c.id)
    const fillColor = isCentral ? CENTRAL_COLOR : (QUADRANT_COLORS[c.quadrant] ?? '#888')
    const nodeRadius = RELEVANCE_RADIUS[c.relevance] ?? 8
    if (isCentral) drawGlowRings(ctx, p[0], p[1], nodeRadius)
    drawNode(ctx, p[0], p[1], nodeRadius, fillColor, 0.9, selectedClaim?.id === c.id)
  })
}

function drawTensionMode(
  ctx: CanvasRenderingContext2D,
  claims: Claim[],
  centralIds: string[],
  W: number,
  H: number,
  selectedClaim: Claim | null,
  animPositions: Map<string, [number, number]>,
) {
  // Draw tension lines first
  ctx.save()
  ctx.strokeStyle = TENSION_COLOR
  ctx.lineWidth = 1.2
  ctx.setLineDash([4, 6])

  const drawn = new Set<string>()
  claims.forEach((src) => {
    claims.forEach((tgt) => {
      if (src.id >= tgt.id) return
      const pairKey = `${src.id}-${tgt.id}`
      if (drawn.has(pairKey)) return

      const connected =
        (src.quadrant_tension ?? []).includes(tgt.quadrant) ||
        (src.domain_tension ?? []).includes(tgt.domain) ||
        (tgt.quadrant_tension ?? []).includes(src.quadrant) ||
        (tgt.domain_tension ?? []).includes(src.domain)

      if (!connected) return
      drawn.add(pairKey)

      const p1 = animPositions.get(src.id)
      const p2 = animPositions.get(tgt.id)
      if (!p1 || !p2) return

      ctx.globalAlpha = 0.3
      ctx.beginPath()
      ctx.moveTo(p1[0], p1[1])
      ctx.lineTo(p2[0], p2[1])
      ctx.stroke()
    })
  })
  ctx.restore()

  // Nodes
  claims.forEach((c) => {
    const p = animPositions.get(c.id)
    if (!p) return
    const isCentral = centralIds.includes(c.id)
    const fillColor = isCentral ? CENTRAL_COLOR : (QUADRANT_COLORS[c.quadrant] ?? '#888')
    const nodeRadius = (isCentral ? 13 : RELEVANCE_RADIUS[c.relevance] ?? 8)
    if (isCentral) drawGlowRings(ctx, p[0], p[1], nodeRadius)
    drawNode(ctx, p[0], p[1], nodeRadius, fillColor, 0.9, selectedClaim?.id === c.id)

    // Archetype label below node
    const label = c.archetype.length > 16 ? c.archetype.slice(0, 15) + '\u2026' : c.archetype
    drawLabel(ctx, label, p[0], p[1] + nodeRadius + 12, 'rgba(245,245,245,0.5)', 10)
  })
}

// ---------------------------------------------------------------------------
// Main draw function
// ---------------------------------------------------------------------------

function draw(
  canvas: HTMLCanvasElement,
  claims: Claim[],
  centralIds: string[],
  mode: VizMode,
  rX: number,
  rY: number,
  selectedClaim: Claim | null,
  animPositions: Map<string, [number, number]>,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const W = canvas.width
  const H = canvas.height

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = CANVAS_BG
  ctx.fillRect(0, 0, W, H)

  const cx = W / 2
  const cy = H / 2
  const sphereRadius = Math.min(W, H) * 0.36

  switch (mode) {
    case 'sphere':
      drawSphereMode(ctx, claims, centralIds, rX, rY, cx, cy, sphereRadius, selectedClaim, animPositions)
      break
    case 'quadrant':
      drawQuadrantMode(ctx, claims, centralIds, W, H, selectedClaim, animPositions)
      break
    case 'cynefin':
      drawCynefinMode(ctx, claims, centralIds, W, H, selectedClaim, animPositions)
      break
    case 'gravity':
      drawGravityMode(ctx, claims, centralIds, W, H, selectedClaim, animPositions)
      break
    case 'tension':
      drawTensionMode(ctx, claims, centralIds, W, H, selectedClaim, animPositions)
      break
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TensorDatasphere({ claims, centralClaimId }: TensorDatasphereProps) {
  const centralIds = Array.isArray(centralClaimId)
    ? centralClaimId
    : centralClaimId
      ? [centralClaimId]
      : []

  const [mode, setMode] = useState<VizMode>('sphere')
  const [rotX, setRotX] = useState(0.3)
  const [rotY, setRotY] = useState(0.4)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, rotX: 0, rotY: 0 })
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [autoRotate, setAutoRotate] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)

  // Transition animation state
  const [transitionFrom, setTransitionFrom] = useState<Map<string, [number, number]> | null>(null)
  const [transitionTo, setTransitionTo] = useState<Map<string, [number, number]> | null>(null)
  const transitionStartRef = useRef<number>(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const prevModeRef = useRef<VizMode>(mode)

  // Auto-rotate pause on hover
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleModeSwitch = useCallback(
    (newMode: VizMode) => {
      if (newMode === mode) return
      const canvas = canvasRef.current
      if (!canvas) {
        setMode(newMode)
        return
      }

      const W = canvas.width
      const H = canvas.height

      // Capture current positions
      const fromPositions = getTargetPositions(claims, centralIds, mode, rotX, rotY, W, H)
      const toPositions = getTargetPositions(claims, centralIds, newMode, rotX, rotY, W, H)

      setTransitionFrom(fromPositions)
      setTransitionTo(toPositions)
      transitionStartRef.current = Date.now()
      setIsTransitioning(true)
      prevModeRef.current = mode
      setMode(newMode)
    },
    [mode, claims, centralIds, rotX, rotY],
  )

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (mode !== 'sphere') return
      setIsDragging(true)
      setAutoRotate(false)
      setDragStart({ x: e.clientX, y: e.clientY, rotX, rotY })
    },
    [mode, rotX, rotY],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging) return
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      setRotY(dragStart.rotY + deltaX * 0.008)
      const newRotX = dragStart.rotX - deltaY * 0.008
      setRotX(Math.max(-Math.PI * 0.48, Math.min(Math.PI * 0.48, newRotX)))
    },
    [isDragging, dragStart],
  )

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
    // Resume auto-rotate after 2s if it was on before dragging
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
  }, [])

  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const mx = (e.clientX - rect.left) * scaleX
      const my = (e.clientY - rect.top) * scaleY

      const W = canvas.width
      const H = canvas.height
      const positions = getTargetPositions(claims, centralIds, mode, rotX, rotY, W, H)

      let closest: Claim | null = null
      let closestDist = Infinity

      claims.forEach((c) => {
        const p = positions.get(c.id)
        if (!p) return
        const nodeRadius = (RELEVANCE_RADIUS[c.relevance] ?? 8) + 4
        const dx = mx - p[0]
        const dy = my - p[1]
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < nodeRadius && dist < closestDist) {
          closest = c
          closestDist = dist
        }
      })

      if (closest) {
        setSelectedClaim((prev) => (prev?.id === (closest as Claim).id ? null : closest))
      } else {
        setSelectedClaim(null)
      }
    },
    [claims, centralIds, mode, rotX, rotY],
  )

  // Touch support
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length !== 1 || mode !== 'sphere') return
      const touch = e.touches[0]
      setIsDragging(true)
      setAutoRotate(false)
      setDragStart({ x: touch.clientX, y: touch.clientY, rotX, rotY })
    },
    [mode, rotX, rotY],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDragging || e.touches.length !== 1) return
      e.preventDefault()
      const touch = e.touches[0]
      const deltaX = touch.clientX - dragStart.x
      const deltaY = touch.clientY - dragStart.y
      setRotY(dragStart.rotY + deltaX * 0.008)
      const newRotX = dragStart.rotX - deltaY * 0.008
      setRotX(Math.max(-Math.PI * 0.48, Math.min(Math.PI * 0.48, newRotX)))
    },
    [isDragging, dragStart],
  )

  const handleTouchEnd = useCallback(() => setIsDragging(false), [])

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = canvas.offsetWidth
    canvas.height = 420

    let localRotY = rotY

    const tick = () => {
      // Update canvas size on each frame (handles resize)
      const newW = canvas.offsetWidth
      if (newW !== canvas.width) {
        canvas.width = newW
        canvas.height = 420
      }

      if (autoRotate && mode === 'sphere' && !isDragging) {
        localRotY += 0.004
      }

      // Compute animated positions
      let animPositions: Map<string, [number, number]>

      if (isTransitioning && transitionFrom && transitionTo) {
        const elapsed = Date.now() - transitionStartRef.current
        const t = Math.min(elapsed / 400, 1)
        const eased = 1 - Math.pow(1 - t, 3)

        animPositions = new Map()
        claims.forEach((c) => {
          const from = transitionFrom.get(c.id) ?? [canvas.width / 2, canvas.height / 2]
          // Recompute target for sphere mode since rotation changes
          let to: [number, number]
          if (mode === 'sphere') {
            const pos3d = get3DPos(c)
            const proj = project(pos3d, rotX, localRotY, canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.36)
            to = [proj.screenX, proj.screenY]
          } else {
            to = transitionTo.get(c.id) ?? [canvas.width / 2, canvas.height / 2]
          }
          animPositions.set(c.id, [lerp(from[0], to[0], eased), lerp(from[1], to[1], eased)])
        })

        if (t >= 1) {
          setIsTransitioning(false)
          setTransitionFrom(null)
          setTransitionTo(null)
        }
      } else {
        animPositions = getTargetPositions(claims, centralIds, mode, rotX, localRotY, canvas.width, canvas.height)
      }

      draw(canvas, claims, centralIds, mode, rotX, localRotY, selectedClaim, animPositions)
      animFrameRef.current = requestAnimationFrame(tick)
    }

    animFrameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [claims, centralIds, mode, rotX, rotY, isDragging, autoRotate, selectedClaim, isTransitioning, transitionFrom, transitionTo])

  return (
    <div>
      {/* Mode selector */}
      <div className="flex justify-center gap-2 mb-4">
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleModeSwitch(key)}
            className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded border transition-colors ${
              mode === key
                ? 'border-[var(--poe-accent)] text-[var(--poe-accent)]'
                : 'border-[var(--poe-border)] text-[var(--poe-text-muted)] hover:text-[var(--poe-text-secondary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '420px',
          cursor: mode === 'sphere' ? (isDragging ? 'grabbing' : 'grab') : 'default',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Inspect panel */}
      {selectedClaim && (
        <div className="mt-3 p-3 bg-[var(--poe-surface)] border border-[var(--poe-border)] rounded">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-[var(--poe-accent)] uppercase tracking-wider">
              {selectedClaim.archetype}
            </p>
            <button
              onClick={() => setSelectedClaim(null)}
              className="text-[var(--poe-text-muted)] hover:text-[var(--poe-text-primary)] text-xs"
            >
              &#x2715;
            </button>
          </div>
          <p className="text-sm text-[var(--poe-text-primary)] mb-2">
            &ldquo;{selectedClaim.text}&rdquo;
          </p>
          <div className="flex flex-wrap gap-2 text-[10px] text-[var(--poe-text-secondary)]">
            <span>{selectedClaim.quadrant}</span>
            <span>&middot;</span>
            <span>{selectedClaim.domain}</span>
            <span>&middot;</span>
            <span>{selectedClaim.reasoning}</span>
            <span>&middot;</span>
            <span>{selectedClaim.relevance} relevance</span>
            {selectedClaim.gravity_role && (
              <>
                <span>&middot;</span>
                <span>{selectedClaim.gravity_role.replace('_', ' ')}</span>
              </>
            )}
          </div>
          {((selectedClaim.quadrant_tension ?? []).length > 0 ||
            (selectedClaim.domain_tension ?? []).length > 0) && (
            <p className="text-[11px] text-[var(--poe-text-muted)] mt-1">
              Tension:{' '}
              {[...(selectedClaim.quadrant_tension ?? []), ...(selectedClaim.domain_tension ?? [])].join(
                ', ',
              )}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
