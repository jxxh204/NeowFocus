import sheet from '../../assets/completion-pixel/cat-stamp-pixel-v1.json'

export const catSheet = sheet
export const CAT_WIDTH = sheet.frameWidth
export const CAT_HEIGHT = 460
export const CAT_REGISTER_X = CAT_WIDTH / 2
const contact = sheet.frames[sheet.contact.frame]
export const CAT_PAW_X = CAT_REGISTER_X + sheet.contact.x - contact.anchor.x
export const CAT_PAW_Y = sheet.contact.y - contact.anchor.y
// Orient the toe pads along the head-to-front-paw reach, including the original print's tilt.
export const STAMP_ROTATION = Math.atan2(CAT_PAW_X - CAT_REGISTER_X, 230 - CAT_PAW_Y) * 180 / Math.PI + 8

export const CAT_ENTRIES = [
  { id: 'top', label: '위', angle: 0 },
  { id: 'top-right', label: '오른쪽 위', angle: 45 },
  { id: 'right', label: '오른쪽', angle: 90 },
  { id: 'bottom-right', label: '오른쪽 아래', angle: 135 },
  { id: 'bottom', label: '아래', angle: 180 },
  { id: 'bottom-left', label: '왼쪽 아래', angle: 225 },
  { id: 'left', label: '왼쪽', angle: 270 },
  { id: 'top-left', label: '왼쪽 위', angle: 315 }
] as const
export type CatEntry = typeof CAT_ENTRIES[number]['id']

export function nextCatEntry(previous?: string, random = Math.random): CatEntry {
  const choices = CAT_ENTRIES.filter(entry => entry.id !== previous)
  return choices[Math.min(choices.length - 1, Math.floor(Math.max(0, random()) * choices.length))].id
}

export function catEntryGeometry(entry: CatEntry, target: { x: number; y: number }, viewport: { width: number; height: number }) {
  const angle = CAT_ENTRIES.find(item => item.id === entry)!.angle
  const radians = angle * Math.PI / 180
  const dx = Math.sin(radians), dy = -Math.cos(radians)
  const lateralX = Math.cos(radians), lateralY = Math.sin(radians)
  const left = -CAT_PAW_X, right = CAT_WIDTH - CAT_PAW_X
  // Put the entire cropped-back edge beyond one screen boundary, including diagonals.
  const edges = [
    { outward: dx, lateral: lateralX, distance: viewport.width - target.x },
    { outward: -dx, lateral: -lateralX, distance: target.x },
    { outward: dy, lateral: lateralY, distance: viewport.height - target.y },
    { outward: -dy, lateral: -lateralY, distance: target.y }
  ].filter(edge => edge.outward > 0.0001)
  const scales = edges.map(edge => {
    const back = CAT_PAW_Y * edge.outward + Math.min(left * edge.lateral, right * edge.lateral)
    return back > 0 ? (edge.distance + 24) / back : Infinity
  })
  const scale = Math.max(0.76, Math.min(...scales))
  const boundary = Math.min(...edges.map(edge => edge.distance / edge.outward))
  return { angle, dx, dy, scale, travel: boundary + CAT_HEIGHT * scale, stampRotation: STAMP_ROTATION + angle }
}
