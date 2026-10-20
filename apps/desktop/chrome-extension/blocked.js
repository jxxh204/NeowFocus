async function render() {
  const { connectionStatus: value } = await chrome.storage.local.get('connectionStatus')
  const active = value?.active === true
  document.querySelector('#title').textContent = active
    ? '지금은 하나에 집중해요.'
    : '다시 열 수 있어요.'
  document.querySelector('#detail').textContent = active
    ? '선택한 사이트를 잠시 쉬고 있어요. NeowFocus에서 마치거나 잠시 멈추면 다시 열 수 있어요.'
    : '집중 중 사이트 차단이 해제됐어요.'
  document.querySelector('#back').hidden = active
}
document.querySelector('#back').onclick = () => history.back()
chrome.storage.onChanged.addListener(() => {
  void render()
})
void render()
