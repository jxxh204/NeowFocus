export const originsFor = (domain) => [`http://*.${domain}/*`, `https://*.${domain}/*`]
export const validDomain = (domain) =>
  typeof domain === 'string' &&
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)
export function effectiveDomains(policy, permitted, now = Date.now()) {
  if (
    !policy ||
    policy.active !== true ||
    !Number.isFinite(policy.expiresAt) ||
    policy.expiresAt <= now ||
    policy.expiresAt > now + 10_000 ||
    !Array.isArray(policy.domains) ||
    policy.domains.length > 30
  )
    return []
  return [
    ...new Set(policy.domains.filter((domain) => validDomain(domain) && permitted.includes(domain)))
  ]
}
export function blockingRules(domains) {
  return domains.map((domain, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
    condition: { requestDomains: [domain], resourceTypes: ['main_frame'] }
  }))
}
