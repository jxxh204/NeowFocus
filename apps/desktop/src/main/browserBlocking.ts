import { createServer } from 'node:http'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { WebSocketServer, WebSocket } from 'ws'
import {
  BROWSER_PORT,
  browserPolicy,
  normalizeDomains,
  type BrowserFocus,
  type BrowserSettings,
  type BrowserBlockStatus
} from '../shared/browserBlocking'

export class BrowserBlockingBridge {
  private settings: BrowserSettings = { enabled: false, domains: [] }
  private focus: BrowserFocus = { status: 'idle', endsAt: null }
  private seenAt = 0
  private key: string
  private file: string
  private error?: string
  private port: number
  private acknowledgements = new Map<WebSocket, string[]>()
  private sockets = new WebSocketServer({ noServer: true, maxPayload: 4096 })
  private server = createServer((request, response) => {
    const origin = request.headers.origin
    if (origin && !/^chrome-extension:\/\/[a-p]{32}$/.test(origin)) {
      response.writeHead(403).end()
      return
    }
    if (request.headers.host !== `127.0.0.1:${this.port}`) {
      response.writeHead(403).end()
      return
    }
    if (origin) response.setHeader('Access-Control-Allow-Origin', origin)
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Access-Control-Allow-Headers', 'Authorization')
    if (request.method === 'OPTIONS') {
      response.writeHead(204).end()
      return
    }
    if (
      request.method !== 'GET' ||
      request.url !== '/policy' ||
      !this.authorized(request.headers.authorization?.replace(/^Bearer /, ''))
    ) {
      response.writeHead(401).end()
      return
    }
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify(this.policy()))
  })
  private heartbeat?: ReturnType<typeof setInterval>
  constructor(directory: string, port = BROWSER_PORT) {
    this.port = port
    mkdirSync(directory, { recursive: true })
    this.file = join(directory, 'chrome-focus-connection.json')
    this.key = randomBytes(32).toString('hex')
    if (existsSync(this.file))
      try {
        const saved = JSON.parse(readFileSync(this.file, 'utf8'))
        if (/^[a-f0-9]{64}$/.test(saved.key)) this.key = saved.key
        this.settings = {
          enabled: saved.enabled === true,
          domains: normalizeDomains(saved.domains ?? [])
        }
      } catch {
        this.error = '저장한 사이트 연결을 다시 확인해주세요.'
      }
    this.persist()
    this.server.on('error', () => {
      this.error = 'Chrome 연결을 열지 못했어요. 실행 중인 다른 NeowFocus 창을 확인해주세요.'
    })
    this.server.on('upgrade', (request, socket, head) => {
      const origin = request.headers.origin ?? ''
      const url = new URL(request.url ?? '/', `http://127.0.0.1:${this.port}`)
      if (
        request.headers.host !== `127.0.0.1:${this.port}` ||
        !/^chrome-extension:\/\/[a-p]{32}$/.test(origin) ||
        url.pathname !== '/focus' ||
        !this.authorized(url.searchParams.get('key') ?? undefined)
      ) {
        socket.end('HTTP/1.1 401 Unauthorized\r\n\r\n')
        return
      }
      this.sockets.handleUpgrade(request, socket, head, (client) => {
        this.acknowledgements.set(client, [])
        client.on('message', (data) => {
          try {
            const status = JSON.parse(String(data))
            if (status.type === 'applied')
              this.acknowledgements.set(
                client,
                normalizeDomains(status.domains).filter((domain) =>
                  this.settings.domains.includes(domain)
                )
              )
          } catch {
            /* Invalid client status never enables blocking. */
          }
        })
        client.on('close', () => this.acknowledgements.delete(client))
        client.on('error', () => client.terminate())
        client.send(JSON.stringify(this.policy()))
      })
    })
  }
  private authorized(value?: string) {
    return Boolean(
      value &&
        /^[a-f0-9]{64}$/.test(value) &&
        timingSafeEqual(Buffer.from(value, 'hex'), Buffer.from(this.key, 'hex'))
    )
  }
  private persist() {
    writeFileSync(this.file, JSON.stringify({ ...this.settings, key: this.key }), { mode: 0o600 })
  }
  policy() {
    return browserPolicy(this.settings, this.focus, this.seenAt, Date.now())
  }
  status(): BrowserBlockStatus {
    const applied = new Set([...this.acknowledgements.values()].flat())
    return {
      ...this.settings,
      connected: this.acknowledgements.size > 0,
      active: this.policy().active && this.settings.domains.every((domain) => applied.has(domain)),
      error: this.error
    }
  }
  connectionCode() {
    return this.key
  }
  configure(value: BrowserSettings) {
    this.settings = { enabled: value.enabled === true, domains: normalizeDomains(value.domains) }
    this.persist()
    this.broadcast()
    return this.status()
  }
  publish(focus: BrowserFocus) {
    this.focus = {
      status: focus?.status,
      endsAt:
        typeof focus?.endsAt === 'number' && Number.isFinite(focus.endsAt) ? focus.endsAt : null
    }
    this.seenAt = Date.now()
    this.broadcast()
  }
  private broadcast() {
    const json = JSON.stringify(this.policy())
    for (const client of this.acknowledgements.keys())
      if (client.readyState === WebSocket.OPEN) client.send(json)
  }
  start(): Promise<number> {
    return new Promise((resolve) => {
      this.server.once('error', () => resolve(0))
      this.server.listen(this.port, '127.0.0.1', () => {
        this.port = (this.server.address() as { port: number }).port
        this.heartbeat = setInterval(() => this.broadcast(), 2000)
        this.heartbeat.unref()
        resolve(this.port)
      })
    })
  }
  async stop() {
    this.focus = { status: 'idle', endsAt: null }
    this.broadcast()
    if (this.heartbeat) clearInterval(this.heartbeat)
    for (const client of this.acknowledgements.keys()) client.close()
    this.sockets.close()
    if (this.server.listening)
      await new Promise<void>((resolve) => this.server.close(() => resolve()))
  }
}
