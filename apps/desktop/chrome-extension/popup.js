import { originsFor, validDomain } from './rules.js'
const status = document.querySelector('#status'),
  sites = document.querySelector('#sites'),
  allow = document.querySelector('#allow')
let domains = []
async function render() {
  const { connectionStatus: value } = await chrome.storage.local.get('connectionStatus')
  domains = (value?.domains ?? []).filter(validDomain)
  sites.replaceChildren(
    ...domains.map((domain) => {
      const li = document.createElement('li')
      li.textContent = domain
      return li
    })
  )
  status.textContent =
    value?.error ??
    (value?.active
      ? '선택한 사이트를 차단하고 있어요.'
      : value?.connected
        ? 'Mac 앱과 연결됐어요.'
        : 'Mac 앱을 열고 연결 코드를 확인해주세요.')
  allow.hidden = !value?.connected || !domains.length
}
document.querySelector('#connect').onclick = async () => {
  const key = document.querySelector('#code').value.trim()
  if (!/^[a-f0-9]{64}$/.test(key)) {
    status.textContent = 'Mac 앱에서 복사한 연결 코드를 붙여넣어주세요.'
    return
  }
  await chrome.storage.local.set({ pairingKey: key })
  document.querySelector('#code').value = ''
  await chrome.runtime.sendMessage({ type: 'connect' })
  await render()
}
allow.onclick = async () => {
  const granted = await chrome.permissions.request({ origins: domains.flatMap(originsFor) })
  if (!granted) {
    status.textContent = '허용한 사이트만 차단할 수 있어요.'
    return
  }
  await chrome.runtime.sendMessage({ type: 'permissions-changed' })
  await render()
}
document.querySelector('#disconnect').onclick = async () => {
  await chrome.runtime.sendMessage({ type: 'disconnect' })
  await render()
}
chrome.storage.onChanged.addListener(() => {
  void render()
})
void render()
