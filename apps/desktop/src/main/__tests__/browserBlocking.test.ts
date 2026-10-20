/** @jest-environment node */
/// <reference types="jest" />
import { mkdtempSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { once } from 'node:events'
import { WebSocket } from 'ws'
import { BrowserBlockingBridge } from '../browserBlocking'
import { normalizeDomains, browserPolicy } from '../../shared/browserBlocking'

describe('Chrome focus protection', () => {
  it('normalizes selected hosts and rejects local, credential and invalid destinations', () => {
    expect(
      normalizeDomains(['https://YouTube.com/watch?v=1', 'youtube.com', '*.example.com'])
    ).toEqual(['youtube.com', 'example.com'])
    for (const domain of [
      'file:///etc/hosts',
      'localhost',
      '127.0.0.1',
      'https://user:password@example.com',
      'x.com\nother.com'
    ])
      expect(() => normalizeDomains([domain])).toThrow()
  })
  it('fails open on pause, finish, expiry, renderer loss, and disabled protection', () => {
    const settings = { enabled: true, domains: ['example.com'] },
      focus = { status: 'running', endsAt: 50_000 }
    expect(browserPolicy(settings, focus, 1000, 1001).active).toBe(true)
    for (const status of ['paused', 'finished', 'idle'])
      expect(browserPolicy(settings, { ...focus, status }, 1000, 1001).active).toBe(false)
    expect(browserPolicy(settings, focus, 1000, 11_000).active).toBe(false)
    expect(browserPolicy(settings, { ...focus, endsAt: 2000 }, 1000, 2000).active).toBe(false)
    expect(browserPolicy({ ...settings, enabled: false }, focus, 1000, 1001).active).toBe(false)
  })
  it('authenticates the local connection and publishes start/pause/finish without a task name', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'neowfocus-browser-'))
    const bridge = new BrowserBlockingBridge(directory, 0)
    const port = await bridge.start(),
      origin = 'chrome-extension://' + 'a'.repeat(32)
    let client: WebSocket | undefined
    try {
      expect(port).toBeGreaterThan(0)
      expect(statSync(join(directory, 'chrome-focus-connection.json')).mode & 0o777).toBe(0o600)
      expect((await fetch(`http://127.0.0.1:${port}/policy`)).status).toBe(401)
      expect(
        (
          await fetch(`http://127.0.0.1:${port}/policy`, {
            headers: {
              Origin: 'https://example.com',
              Authorization: `Bearer ${bridge.connectionCode()}`
            }
          })
        ).status
      ).toBe(403)
      expect(
        (
          await fetch(`http://127.0.0.1:${port}/policy`, {
            headers: { Origin: origin, Authorization: `Bearer ${bridge.connectionCode()}` }
          })
        ).status
      ).toBe(200)
      bridge.configure({ enabled: true, domains: ['example.com'] })
      client = new WebSocket(`ws://127.0.0.1:${port}/focus?key=${bridge.connectionCode()}`, {
        origin
      })
      await once(client, 'open')
      const next = () => once(client!, 'message').then(([data]) => JSON.parse(String(data)))
      let message = next()
      bridge.publish({ status: 'running', endsAt: Date.now() + 60_000 })
      expect(await message).toMatchObject({ active: true, domains: ['example.com'] })
      message = next()
      bridge.publish({ status: 'paused', endsAt: null })
      expect(await message).toMatchObject({ active: false })
      message = next()
      bridge.publish({ status: 'finished', endsAt: null })
      const value = await message
      expect(value.active).toBe(false)
      expect(value.task).toBeUndefined()
      client.close()
      await once(client, 'close')
    } finally {
      client?.terminate()
      await bridge.stop()
      rmSync(directory, { recursive: true, force: true })
    }
  })
})
