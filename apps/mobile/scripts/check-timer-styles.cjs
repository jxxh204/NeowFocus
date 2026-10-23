const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
function load(relative, mocks = {}) {
  const filename = path.resolve(__dirname, relative)
  const exports = {}
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX }
  }).outputText, { exports, require: request => mocks[request] ?? require(path.resolve(path.dirname(filename), request)), Math, Number })
  return exports
}
const { normalizeTimerAppearance, sessionAppearance } = load('../src/focus/timerStyle.ts')
let appearance = sessionAppearance(null, 'first', true, 'water')
assert.equal(sessionAppearance(appearance, 'first', false, 'blocks').timerStyle, 'water', 'completion cannot pick up a different preference')
appearance = sessionAppearance(appearance, 'first', true, 'blocks')
assert.equal(appearance.timerStyle, 'blocks', 'explicit active-session style changes still apply')
assert.equal(sessionAppearance(appearance, 'first', false, 'water').timerStyle, 'blocks')
assert.equal(sessionAppearance(appearance, 'next', true, 'water').timerStyle, 'water', 'new session uses selected style')
assert.equal(sessionAppearance(null, 'restored', false, 'water').timerStyle, 'water', 'cold restored completion uses saved preference')
assert.equal(sessionAppearance({ sessionId: null, timerStyle: 'classic' }, null, false, 'water').timerStyle, 'water', 'idle widget preview follows preference changes')
for (const saved of [null, {}, { timerStyle: 'future', showRemainingTime: 'true' }]) {
  const result = normalizeTimerAppearance(saved)
  assert.equal(result.timerStyle, 'classic')
  assert.equal(result.showRemainingTime, false)
}
for (const timerStyle of ['classic', 'blocks', 'water']) {
  assert.equal(normalizeTimerAppearance({ timerStyle, showRemainingTime: true }).timerStyle, timerStyle)
  assert.equal(normalizeTimerAppearance({ timerStyle, showRemainingTime: true }).showRemainingTime, true)
}
const { BLOCK_PLAN, COLS, ROWS, blockCount, waterPaths, WAVE_SPEED } = load('../src/components/timer/geometry.ts')
const occupied = new Set()
assert.equal(BLOCK_PLAN.length, 72)
for (const piece of BLOCK_PLAN) {
  assert.equal(piece.cells.length, 4)
  for (let row = -4; row <= piece.y; row++) {
    for (const [dx, dy] of piece.cells) assert.ok(!occupied.has(`${piece.x + dx},${row + dy}`), 'piece can drop without intersecting previous pieces')
  }
  for (const [dx, dy] of piece.cells) {
    const x = piece.x + dx, y = piece.y + dy
    assert.ok(x >= 0 && x < COLS && y >= 0 && y < ROWS)
    assert.ok(!occupied.has(`${x},${y}`), 'no overlapping cells')
    occupied.add(`${x},${y}`)
  }
}
assert.equal(occupied.size, COLS * ROWS, 'completion covers the entire board')
for (let count = 0; count <= 72; count++) assert.equal(blockCount(count / 72), count)
assert.equal(blockCount(-1), 0)
assert.equal(blockCount(2), 72)
assert.equal(blockCount(NaN), 0)
assert.equal(WAVE_SPEED, 4.32, 'approved constant wave speed')
for (const [width, height] of [[320,568], [390,844], [440,956]]) {
  for (const progress of [0,.01,.25,.5,.75,1]) {
    const paths = waterPaths(width, height, progress, 1, false)
    assert.equal(paths.level, height * (1 - progress))
    assert.ok(!/NaN|Infinity/.test(paths.front.fill + paths.rear.fill))
    if (progress === 1) assert.equal(paths.front.edge, paths.rear.edge, 'flat completed water covers the screen')
    const still1 = waterPaths(width, height, progress, 0, true)
    const still2 = waterPaths(width, height, progress, 20, true)
    assert.equal(still1.front.fill, still2.front.fill, 'Reduce Motion removes wave movement')
  }
}
console.log('Passed: settings migration, 72 physically droppable pieces / 288-cell full cover, restoration counts, water levels/speed and Reduce Motion.')

// Render the real scene boundary at completion; a missing style must never fall through to blocks.
const jsx = (type, props) => ({ type, props })
const { TimerScene } = load('../src/components/timer/TimerScene.tsx', {
  react: { memo: value => value, useEffect() {}, useRef: current => ({ current }), useState: () => [{ width: 390, height: 844 }, () => {}] },
  'react/jsx-runtime': { jsx, jsxs: jsx },
  'react-native': { View: 'View', StyleSheet: { create: value => value } },
  'react-native-svg': {},
  '../motionPreference': { useMotionPreference: () => ({ active: true, reduced: false }) },
  './geometry': { BLOCK_PLAN, COLS, ROWS, blockCount, waterPaths, WAVE_SPEED }
})
for (const style of ['water', 'blocks']) {
  for (const [progress, running] of [[.99, true], [1, false], [.4, false]]) {
    const scene = TimerScene({ style, progress, running })
    assert.equal(scene.props.children.type.name, style === 'water' ? 'Water' : 'Blocks', `${style} stays selected through completion and pause`)
  }
}
for (const style of ['classic', undefined, null, 'future']) assert.equal(TimerScene({ style, progress: 1, running: false }), null)
console.log('Passed: real TimerScene preserves water/blocks through completion, pause and unknown-style recovery.')
