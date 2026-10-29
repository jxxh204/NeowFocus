// 슈퍼포커스 작업실 장면 (1672×941 캔버스).
// 배경과 고양이는 따로 고르고, 움직임(고양이 호흡·눈 깜빡임, 커피 김, 창밖 효과)은 코드로 얹는다.
// neow-three-worlds의 scene.js를 앱 빌드에 맞게 옮긴 것. 그림 경로는 번들러가 정하도록 밖에서 받는다.
import roomNature from './assets/worlds/room-nature.png'
import roomScrapyard from './assets/worlds/room-scrapyard.png'
import catGray from './assets/worlds/cat-gray.png'
import catBritish from './assets/worlds/cat-british.png'
import catSiamese from './assets/worlds/cat-siamese.png'
import catMaine from './assets/worlds/cat-maine.png'

export type SceneRoom = 'nature' | 'scrapyard'
export type SceneCat = 'gray' | 'british' | 'siamese' | 'maine'

export const SCENE_WIDTH = 1672
export const SCENE_HEIGHT = 941
const CAT_X = 880
const CAT_CONTACT_Y = 534

const ROOM_IMAGES: Record<SceneRoom, string> = {
  nature: roomNature,
  scrapyard: roomScrapyard
}

type Eye = [number, number, number, number]
const CATS: Record<SceneCat, { src: string; width: number; eyes: Eye[] }> = {
  // 처음 작업실 그림에서 오려낸 회색 고양이. 원래 크기 그대로 쓴다
  gray: {
    src: catGray,
    width: 198,
    eyes: [
      [131, 42, 139, 51],
      [166, 42, 174, 51]
    ]
  },
  british: {
    src: catBritish,
    width: 204,
    eyes: [
      [139, 40, 147, 48],
      [175, 40, 183, 48]
    ]
  },
  maine: {
    src: catMaine,
    width: 225,
    eyes: [
      [177, 48, 183, 54],
      [202, 48, 207, 54]
    ]
  },
  siamese: {
    src: catSiamese,
    width: 204,
    eyes: [
      [154, 51, 160, 57],
      [179, 51, 186, 57]
    ]
  }
}

const load = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })

// 눈을 뜬 프레임, 반쯤 감은 프레임, 감은 프레임
function catFrames(image: HTMLImageElement, cat: SceneCat): HTMLCanvasElement[] {
  const spec = CATS[cat]
  return [0, 1, 2].map((closure) => {
    const frame = document.createElement('canvas')
    frame.width = spec.width
    frame.height = Math.round((spec.width * image.height) / image.width)
    const g = frame.getContext('2d')!
    g.imageSmoothingEnabled = false
    g.drawImage(image, 0, 0, frame.width, frame.height)
    if (closure)
      for (const [x1, y1, x2, y2] of spec.eyes) {
        const mid = Math.floor((y1 + y2) / 2)
        const coat = g.getImageData(x1 - 2, mid, 1, 1).data
        const eye = g.getImageData(x1, mid, 1, 1).data
        g.fillStyle = `rgb(${coat[0]},${coat[1]},${coat[2]})`
        g.fillRect(x1, y1, x2 - x1, y2 - y1)
        const h = closure === 2 ? 2 : Math.max(2, Math.round((y2 - y1) / 2))
        g.fillStyle = `rgb(${eye[0]},${eye[1]},${eye[2]})`
        g.fillRect(x1, Math.round(mid - h / 2), x2 - x1, h)
      }
    return frame
  })
}

const blink = (t: number) => {
  for (const start of [2.5, 7.8]) {
    const p = (t % 12) - start
    if (p >= 0 && p < 0.1) return 1
    if (p >= 0.1 && p < 0.24) return 2
    if (p >= 0.24 && p < 0.34) return 1
  }
  return 0
}

export type SceneHandle = {
  setMotion: (motion: boolean) => void
  destroy: () => void
}

export async function mountScene(
  canvas: HTMLCanvasElement,
  options: { room: SceneRoom; cat: SceneCat; motion: boolean }
): Promise<SceneHandle> {
  const { room: theme, cat } = options
  const [room, catImage] = await Promise.all([load(ROOM_IMAGES[theme]), load(CATS[cat].src)])
  const sprites = catFrames(catImage, cat)
  canvas.width = SCENE_WIDTH
  canvas.height = SCENE_HEIGHT
  const g = canvas.getContext('2d')!
  g.imageSmoothingEnabled = false
  let motion = options.motion
  let disposed = false
  let request = 0
  let last = 0
  let elapsed = 0
  let previous = 0

  const windowMask = () => {
    g.beginPath()
    g.moveTo(824, 56)
    g.lineTo(1344, 56)
    g.lineTo(1371, 83)
    g.lineTo(1371, 332)
    g.lineTo(1340, 368)
    g.lineTo(825, 368)
    g.lineTo(800, 344)
    g.lineTo(800, 83)
    g.closePath()
    g.clip()
  }

  const leaf = (x: number, y: number, angle: number, color: string, size = 9) => {
    g.save()
    g.translate(Math.round(x), Math.round(y))
    const lean = Math.round(Math.sin(angle) * 3)
    g.fillStyle = color
    g.fillRect(-size / 2, -2, size, 4)
    g.fillRect(-size / 2 + 2 + lean, -4, size - 4, 8)
    g.fillRect(-1, 3, 2, 4)
    g.restore()
  }

  // 창밖: 초록 폐허는 날리는 잎, 폐차장은 먼지와 마른 잎
  const exterior = (t: number) => {
    g.save()
    windowMask()
    if (theme === 'nature') {
      for (let i = 0; i < 6; i++) {
        const q = ((t + i * 2.3) % 14) / 14
        const x = 835 + q * 510 + Math.sin(q * 8 + i) * 18
        const y = 80 + i * 34 + q * 100
        g.globalAlpha = Math.sin(q * Math.PI) * 0.8
        leaf(x, y, Math.sin(q * 12 + i) * 0.6, i % 2 ? '#a9b54f' : '#6c813c', 10 + (i % 3) * 2)
      }
    } else {
      for (let i = 0; i < 22; i++) {
        const q = ((t + i * 0.71) % 11) / 11
        const x = 802 + q * 590
        const y = 335 - (i % 6) * 25 + Math.sin(q * 7 + i) * 13
        g.globalAlpha = Math.sin(q * Math.PI) * (0.15 + (i % 3) * 0.08)
        g.fillStyle = i % 2 ? '#b3a58b' : '#d9c9aa'
        g.fillRect(Math.round(x), Math.round(y), 7 + (i % 3) * 3, 2 + (i % 2))
      }
      for (let i = 0; i < 3; i++) {
        const q = ((t + i * 3.5) % 10) / 10
        g.globalAlpha = Math.sin(q * Math.PI) * 0.4
        leaf(840 + q * 520, 300 + Math.sin(q * 9 + i) * 25, q * 4, '#756747', 8)
      }
    }
    g.restore()
    g.globalAlpha = 1
  }

  const draw = (t: number) => {
    g.clearRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT)
    g.drawImage(room, 0, 0)
    if (motion) exterior(t)
    const sprite = sprites[motion ? blink(t) : 0]
    const width = sprite.width
    // 바닥에 닿은 자리는 그대로 두고 높이만 0~2px 오르내리는 조용한 호흡
    const rise = motion ? 1 - Math.cos((t * Math.PI) / 2) : 0
    g.fillStyle = 'rgba(32,29,12,.22)'
    g.beginPath()
    g.ellipse(CAT_X, CAT_CONTACT_Y, width * 0.42, 5, 0, 0, Math.PI * 2)
    g.fill()
    g.drawImage(
      sprite,
      CAT_X - width / 2,
      CAT_CONTACT_Y - sprite.height - rise,
      width,
      sprite.height + rise
    )
    if (motion)
      for (let i = 0; i < 3; i++) {
        const phase = ((t + i * (4 / 3)) % 4) / 4
        const x = Math.round(1045 + Math.sin(phase * 5 + i) * 5)
        const y = Math.round(464 - phase * 42)
        g.fillStyle = `rgba(228,222,188,${Math.sin(phase * Math.PI) * 0.34})`
        g.fillRect(x, y, 3, 7)
        g.fillRect(x + 3, y - 4, 3, 5)
      }
  }

  // 초당 12번만 그린다. 탭이 가려지면 시간도 멈춘다
  const loop = (now: number) => {
    if (disposed) return
    if (!document.hidden) {
      if (previous && motion) elapsed += Math.min((now - previous) / 1000, 0.1)
      if (now - last >= 1000 / 12) {
        draw(elapsed)
        last = now
      }
    }
    previous = now
    request = requestAnimationFrame(loop)
  }
  draw(0)
  request = requestAnimationFrame(loop)

  return {
    setMotion(value) {
      motion = value
      draw(elapsed)
    },
    destroy() {
      disposed = true
      cancelAnimationFrame(request)
    }
  }
}
