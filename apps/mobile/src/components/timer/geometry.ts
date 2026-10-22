import patterns from './block-patterns.json'

export const COLS = 12
export const ROWS = 24
export const WAVE_SPEED = 4.32 // radians/second, constant throughout the focus session
const palette = ['#484e53', '#565953', '#4e5559', '#5c5854', '#4d5352', '#55535c', '#41494d']
export type BlockPiece = { cells: number[][]; x: number; y: number; tone: string }

/** Exact covers ordered from bottom to top; restoration never depends on animation history. */
export const BLOCK_PLAN: BlockPiece[] = []
for (let band = 5; band >= 0; band--) {
  for (let turn = 0; turn < 4; turn++) {
    for (let k = 0; k < 3; k++) {
      const col = (k + band) % 3
      const piece = patterns[(band * 5 + col * 7) % patterns.length][turn]
      BLOCK_PLAN.push({ ...piece, x: piece.x + col * 4, y: piece.y + band * 4,
        tone: palette[(BLOCK_PLAN.length * 3 + piece.kind) % palette.length] })
    }
  }
}

export function clampProgress(progress: number) { return Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0 }
export function blockCount(progress: number) { return Math.min(BLOCK_PLAN.length, Math.floor(clampProgress(progress) * BLOCK_PLAN.length + 1e-8)) }

export function waterPaths(width: number, height: number, progress: number, phase: number, reduced: boolean) {
  const p = clampProgress(progress)
  const level = height * (1 - p)
  const still = reduced || p === 1
  const amplitude = still ? 0 : Math.min(6, p * 70)
  const separation = still ? 0 : 3
  const front = (x: number) => level + separation + Math.sin(x / 62 + phase) * amplitude + Math.sin(x / 113 - phase * .65) * amplitude * .35
  const rear = (x: number) => level - separation + Math.sin(x / 84 - phase * 1.1 + 1.2) * amplitude * .9 + Math.sin(x / 137 + phase * .8) * amplitude * .25
  const path = (surface: (x: number) => number) => {
    let edge = `M0 ${surface(0).toFixed(2)}`
    for (let x = 5; x < width; x += 5) edge += `L${x} ${surface(x).toFixed(2)}`
    edge += `L${width} ${surface(width).toFixed(2)}`
    return { edge, fill: `${edge}L${width} ${height}L0 ${height}Z` }
  }
  return { level, front: path(front), rear: path(rear) }
}
