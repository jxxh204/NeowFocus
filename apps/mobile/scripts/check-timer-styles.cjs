const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
function load(relative) {
  const filename = path.resolve(__dirname, relative)
  const exports = {}
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true }
  }).outputText, { exports, require: request => require(path.resolve(path.dirname(filename), request)), Math, Number })
  return exports
}
const { normalizeTimerAppearance } = load('../src/focus/timerStyle.ts')
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
