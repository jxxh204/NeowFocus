import { originsFor, validDomain, effectiveDomains, blockingRules } from './rules.js'
let socket,
  reconnect,
  expiry,
  policy,
  currentDomains = [],
  permitted = [],
  allowedKey = '',
  generation = 0
let queue = Promise.resolve()
const status = async (extra) =>
  chrome.storage.local.set({
    connectionStatus: {
      connected: socket?.readyState === WebSocket.OPEN,
      domains: policy?.domains ?? [],
      active: currentDomains.length > 0,
      ...extra
    }
  })
async function updateRules(domains) {
  const existing = await chrome.declarativeNetRequest.getSessionRules()
  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: existing.map((rule) => rule.id),
    addRules: blockingRules(domains)
  })
}
async function apply() {
  const key = JSON.stringify(policy?.domains)
  if (key !== allowedKey) {
    permitted = []
    for (const domain of policy?.domains ?? [])
      if (
        validDomain(domain) &&
        (await chrome.permissions.contains({ origins: originsFor(domain) }))
      )
        permitted.push(domain)
    allowedKey = key
  }
  const domains = effectiveDomains(policy, permitted)
  if (JSON.stringify(domains) !== JSON.stringify(currentDomains)) {
    await updateRules(domains)
    const added = domains.filter((domain) => !currentDomains.includes(domain))
    currentDomains = domains
    // Only already-open tabs on explicitly granted sites are redirected. No URL is stored or sent.
    if (added.length) {
      const tabs = await chrome.tabs.query({ url: added.flatMap(originsFor) })
      await Promise.all(
        tabs
          .filter((tab) => tab.id)
          .map((tab) =>
            chrome.tabs
              .update(tab.id, { url: chrome.runtime.getURL('blocked.html') })
              .catch(() => {})
          )
      )
    }
  }
  if (socket?.readyState === WebSocket.OPEN)
    socket.send(JSON.stringify({ type: 'applied', domains: currentDomains }))
  clearTimeout(expiry)
  if (domains.length)
    expiry = setTimeout(
      () => {
        policy = { ...policy, active: false }
        schedule()
      },
      Math.max(0, policy.expiresAt - Date.now()) + 20
    )
  await status()
}
function schedule() {
  queue = queue.then(apply).catch(async () => {
    currentDomains = []
    await updateRules([]).catch(() => {})
    await status({ error: '차단을 적용하지 못했어요. 연결을 다시 확인해주세요.' })
  })
}
async function disconnect() {
  generation++
  clearTimeout(reconnect)
  clearTimeout(expiry)
  if (socket) {
    const old = socket
    socket = undefined
    old.close()
  }
  policy = undefined
  queue = queue.then(async () => {
    currentDomains = []
    await updateRules([])
    await status()
  })
  await queue
}
async function connect() {
  if (socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) return
  const { pairingKey } = await chrome.storage.local.get('pairingKey')
  if (!/^[a-f0-9]{64}$/.test(pairingKey ?? '')) {
    await status()
    return
  }
  const version = ++generation
  const client = new WebSocket(`ws://127.0.0.1:42731/focus?key=${pairingKey}`)
  socket = client
  client.onmessage = (event) => {
    if (version !== generation) return
    try {
      const value = JSON.parse(event.data)
      if (!Array.isArray(value.domains) || value.domains.length > 30) return
      policy = value
      schedule()
    } catch {}
  }
  client.onclose = () => {
    if (version !== generation) return
    socket = undefined
    policy = undefined
    currentDomains = []
    queue = queue
      .then(() => updateRules([]))
      .then(() => status())
      .catch(() => {})
    reconnect = setTimeout(() => {
      void connect()
    }, 3000)
  }
  client.onerror = () => client.close()
}
chrome.runtime.onMessage.addListener((message, _sender, reply) => {
  if (message.type === 'connect') {
    void disconnect()
      .then(connect)
      .then(() => reply({ ok: true }))
      .catch(() => reply({ ok: false }))
    return true
  }
  if (message.type === 'permissions-changed') {
    allowedKey = ''
    schedule()
    reply({ ok: true })
  }
  if (message.type === 'disconnect') {
    void chrome.storage.local
      .remove('pairingKey')
      .then(disconnect)
      .then(() => reply({ ok: true }))
    return true
  }
})
chrome.permissions.onRemoved.addListener(() => {
  allowedKey = ''
  schedule()
})
chrome.permissions.onAdded.addListener(() => {
  allowedKey = ''
  schedule()
})
chrome.alarms.onAlarm.addListener(() => {
  if (policy?.expiresAt <= Date.now()) {
    policy = { ...policy, active: false }
    schedule()
  }
  void connect()
})
chrome.runtime.onStartup.addListener(() => {
  void updateRules([]).then(connect)
})
chrome.alarms.create('reconnect', { periodInMinutes: 0.5 })
// A browser or worker restart always starts open; only a fresh authenticated policy can block.
void updateRules([]).then(connect)
