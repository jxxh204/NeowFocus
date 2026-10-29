import { useEffect, useRef, useState } from 'react'
import Svg, { ClipPath, Defs, Ellipse, G, Image as SvgImage, Polygon, Rect } from 'react-native-svg'
import type { SuperFocusCat, SuperFocusRoom } from '@/focus/SettingsProvider'

// 슈퍼포커스 작업실 장면 (1672×941). 데스크톱 scene.ts와 같은 배치와 움직임을 SVG로 그린다.
// 그림에서 색을 읽을 수 없어 고양이 눈 깜빡임은 빠지고, 호흡 · 커피 김 · 창밖 효과는 같다.
export type SceneRoom = Exclude<SuperFocusRoom, 'default'>

const ROOMS: Record<SceneRoom, number> = {
  nature: require('../../assets/superfocus/worlds/room-nature.png'),
  scrapyard: require('../../assets/superfocus/worlds/room-scrapyard.png')
}
// 원본 크기 대비 표시 폭. 회색 고양이는 처음 작업실 그림에서 오려낸 원래 크기 그대로
const CATS: Record<SuperFocusCat, { source: number; width: number; ratio: number }> = {
  gray: { source: require('../../assets/superfocus/worlds/cat-gray.png'), width: 198, ratio: 98 / 198 },
  british: { source: require('../../assets/superfocus/worlds/cat-british.png'), width: 204, ratio: 886 / 1776 },
  siamese: { source: require('../../assets/superfocus/worlds/cat-siamese.png'), width: 204, ratio: 860 / 1747 },
  maine: { source: require('../../assets/superfocus/worlds/cat-maine.png'), width: 225, ratio: 905 / 1722 }
}
const CAT_X = 880
const CAT_CONTACT_Y = 534
const WINDOW = '824,56 1344,56 1371,83 1371,332 1340,368 825,368 800,344 800,83'

/** 초당 12번 흐르는 장면 시간. 움직임을 끄면 멈춘다 */
function useSceneTime(moving: boolean) {
  const [time, setTime] = useState(0)
  const last = useRef<number | null>(null)
  useEffect(() => {
    if (!moving) { last.current = null; return }
    const timer = setInterval(() => {
      const now = Date.now()
      const step = last.current === null ? 0 : Math.min((now - last.current) / 1000, 0.1)
      last.current = now
      setTime(value => value + step)
    }, 1000 / 12)
    return () => clearInterval(timer)
  }, [moving])
  return time
}

function Leaf({ x, y, angle, color, size = 9, opacity }: { x: number; y: number; angle: number; color: string; size?: number; opacity: number }) {
  const lean = Math.round(Math.sin(angle) * 3)
  return <G transform={`translate(${Math.round(x)} ${Math.round(y)})`} opacity={opacity}>
    <Rect x={-size / 2} y={-2} width={size} height={4} fill={color} />
    <Rect x={-size / 2 + 2 + lean} y={-4} width={size - 4} height={8} fill={color} />
    <Rect x={-1} y={3} width={2} height={4} fill={color} />
  </G>
}

// 창밖: 초록 폐허는 날리는 잎, 폐차장은 바람 먼지와 마른 잎
function Exterior({ room, t }: { room: SceneRoom; t: number }) {
  if (room === 'nature') return <>{Array.from({ length: 6 }, (_, i) => {
    const q = ((t + i * 2.3) % 14) / 14
    return <Leaf key={i} x={835 + q * 510 + Math.sin(q * 8 + i) * 18} y={80 + i * 34 + q * 100} angle={Math.sin(q * 12 + i) * 0.6}
      color={i % 2 ? '#a9b54f' : '#6c813c'} size={10 + (i % 3) * 2} opacity={Math.sin(q * Math.PI) * 0.8} />
  })}</>
  return <>
    {Array.from({ length: 22 }, (_, i) => {
      const q = ((t + i * 0.71) % 11) / 11
      return <Rect key={`d${i}`} x={Math.round(802 + q * 590)} y={Math.round(335 - (i % 6) * 25 + Math.sin(q * 7 + i) * 13)}
        width={7 + (i % 3) * 3} height={2 + (i % 2)} fill={i % 2 ? '#b3a58b' : '#d9c9aa'} opacity={Math.sin(q * Math.PI) * (0.15 + (i % 3) * 0.08)} />
    })}
    {Array.from({ length: 3 }, (_, i) => {
      const q = ((t + i * 3.5) % 10) / 10
      return <Leaf key={`l${i}`} x={840 + q * 520} y={300 + Math.sin(q * 9 + i) * 25} angle={q * 4} color="#756747" size={8} opacity={Math.sin(q * Math.PI) * 0.4} />
    })}
  </>
}

export function NeowScene({ room, cat, moving, left, top, width, height }: {
  room: SceneRoom; cat: SuperFocusCat; moving: boolean; left: number; top: number; width: number; height: number
}) {
  const t = useSceneTime(moving)
  const spec = CATS[cat]
  const catHeight = Math.round(spec.width * spec.ratio)
  // 바닥에 닿은 자리는 그대로 두고 높이만 0~2px 오르내리는 조용한 호흡
  const rise = moving ? 1 - Math.cos((t * Math.PI) / 2) : 0
  return <Svg style={{ position: 'absolute', left, top }} width={width} height={height} viewBox="0 0 1672 941" preserveAspectRatio="none">
    <Defs><ClipPath id="neowWindow"><Polygon points={WINDOW} /></ClipPath></Defs>
    <SvgImage href={ROOMS[room]} x={0} y={0} width={1672} height={941} preserveAspectRatio="none" />
    {moving && <G clipPath="url(#neowWindow)"><Exterior room={room} t={t} /></G>}
    <Ellipse cx={CAT_X} cy={CAT_CONTACT_Y} rx={spec.width * 0.42} ry={5} fill="rgb(32,29,12)" opacity={0.22} />
    <SvgImage href={spec.source} x={CAT_X - spec.width / 2} y={CAT_CONTACT_Y - catHeight - rise} width={spec.width} height={catHeight + rise} preserveAspectRatio="none" />
    {moving && Array.from({ length: 3 }, (_, i) => {
      const phase = ((t + i * (4 / 3)) % 4) / 4
      const x = Math.round(1045 + Math.sin(phase * 5 + i) * 5)
      const y = Math.round(464 - phase * 42)
      const opacity = Math.sin(phase * Math.PI) * 0.34
      return <G key={i} opacity={opacity}>
        <Rect x={x} y={y} width={3} height={7} fill="rgb(228,222,188)" />
        <Rect x={x + 3} y={y - 4} width={3} height={5} fill="rgb(228,222,188)" />
      </G>
    })}
  </Svg>
}
