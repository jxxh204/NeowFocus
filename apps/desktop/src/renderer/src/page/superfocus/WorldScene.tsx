import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { mountScene, type SceneCat, type SceneHandle, type SceneRoom } from './scene'

/** 설정에서 고른 작업실과 고양이를 캔버스로 그리고, 화면을 꽉 채운다. */
export default function WorldScene({
  room,
  cat,
  motion,
  paused,
  label
}: {
  room: SceneRoom
  cat: SceneCat
  motion: boolean
  paused: boolean
  label: string
}): JSX.Element {
  const canvas = useRef<HTMLCanvasElement>(null)
  const scene = useRef<SceneHandle | null>(null)
  const motionRef = useRef(motion)
  motionRef.current = motion

  useEffect(() => {
    let cancelled = false
    if (!canvas.current) return
    void mountScene(canvas.current, { room, cat, motion: motionRef.current }).then((handle) => {
      if (cancelled) handle.destroy()
      else scene.current = handle
    })
    return () => {
      cancelled = true
      scene.current?.destroy()
      scene.current = null
    }
  }, [room, cat])

  useEffect(() => {
    scene.current?.setMotion(motion)
  }, [motion])

  return <Canvas ref={canvas} role="img" aria-label={label} $paused={paused} />
}

const Canvas = styled.canvas<{ $paused: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: ${({ $paused }) => ($paused ? 'saturate(0.55) brightness(0.8)' : 'none')};
  transition: filter 0.4s ease;
`
