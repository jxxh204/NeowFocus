export const BROWSER_PORT = 42731
export type BrowserSettings = { enabled: boolean; domains: string[] }
export type BrowserFocus = { status: string; endsAt: number | null }
export type BrowserPolicy = { domains: string[]; active: boolean; expiresAt: number }
export type BrowserBlockStatus = BrowserSettings & {
  connected: boolean
  active: boolean
  error?: string
}
export function normalizeDomains(values: unknown): string[] {
  if (!Array.isArray(values) || values.length > 30)
    throw new Error('사이트는 최대 30개까지 선택할 수 있어요.')
  return [
    ...new Set(
      values
        .filter((value) => typeof value === 'string' && value.trim())
        .map((value) => {
          const raw = value.trim().replace(/^\*\./, '')
          if (/\s/.test(raw)) throw new Error('사이트 주소를 확인해주세요.')
          const url = new URL(raw.includes('://') ? raw : `https://${raw}`)
          const host = url.hostname.toLowerCase().replace(/\.$/, '')
          if (
            !['http:', 'https:'].includes(url.protocol) ||
            url.username ||
            url.password ||
            !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(host)
          )
            throw new Error('차단할 사이트 주소를 확인해주세요.')
          return host
        })
    )
  ]
}
export function browserPolicy(
  settings: BrowserSettings,
  focus: BrowserFocus,
  seenAt: number,
  now: number
): BrowserPolicy {
  const expiresAt = Math.min(Number(focus.endsAt) || 0, seenAt + 10_000)
  return {
    domains: settings.domains,
    active:
      settings.enabled &&
      settings.domains.length > 0 &&
      focus.status === 'running' &&
      now < expiresAt,
    expiresAt
  }
}
