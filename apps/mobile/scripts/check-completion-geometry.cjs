const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const source = path.resolve(__dirname, '../src/components/completionGeometry.ts')
const exportsObject = {}
vm.runInNewContext(ts.transpileModule(fs.readFileSync(source, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS }
}).outputText, { exports: exportsObject, require: request => require(path.resolve(path.dirname(source), request)), Math })
const { CAT_ENTRIES, CAT_WIDTH, CAT_HEIGHT, CAT_PAW_X, CAT_PAW_Y, STAMP_ROTATION, nextCatEntry, catEntryGeometry } = exportsObject
const root = path.resolve(__dirname, '../../..')
const pawModule = fs.readFileSync(path.join(root, 'apps/mobile/assets/original-paw.ts'), 'utf8')
assert.equal(JSON.parse(pawModule.split('export const ORIGINAL_PAW_SVG = ')[1].trim()),
  fs.readFileSync(path.join(root, 'apps/desktop/src/renderer/public/assets/icon_paw_white.svg'), 'utf8'), 'use the exact incumbent paw, including every path')

for (const previous of [undefined, ...CAT_ENTRIES.map(entry => entry.id)]) {
  const choices = new Set()
  for (let i = 0; i < 100; i++) {
    const next = nextCatEntry(previous, () => i / 100)
    assert.notEqual(next, previous, 'never repeat the last entry, including persisted settings')
    choices.add(next)
  }
  assert.equal(choices.size, previous ? 7 : 8, 'every eligible entry remains reachable')
}
let cases = 0
for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 430, height: 932 }]) {
  for (const target of [{ x: viewport.width / 2, y: viewport.height / 2 }, { x: viewport.width * .35, y: viewport.height * .6 }]) {
    for (const entry of CAT_ENTRIES) {
      const geometry = catEntryGeometry(entry.id, target, viewport)
      const { angle, dx, dy, scale, travel, stampRotation } = geometry
      assert.ok(Number.isFinite(scale) && scale >= .76)
      assert.ok(Math.abs(stampRotation - STAMP_ROTATION - angle) < 1e-9)
      const a = angle * Math.PI / 180
      const point = (x, y, distance = 0) => ({
        x: target.x + ((x - CAT_PAW_X) * Math.cos(a) - (y - CAT_PAW_Y) * Math.sin(a)) * scale + dx * distance,
        y: target.y + ((x - CAT_PAW_X) * Math.sin(a) + (y - CAT_PAW_Y) * Math.cos(a)) * scale + dy * distance
      })
      assert.deepEqual(point(CAT_PAW_X, CAT_PAW_Y), target, 'contact stays at the measured stamp center')
      const outside = points => points.every(p => p.x < 0) || points.every(p => p.x > viewport.width)
        || points.every(p => p.y < 0) || points.every(p => p.y > viewport.height)
      assert.ok(outside([point(0, 0), point(CAT_WIDTH, 0)]), 'cropped back edge stays outside the screen')
      assert.ok(outside([point(0, 0, travel), point(CAT_WIDTH, 0, travel), point(0, CAT_HEIGHT, travel), point(CAT_WIDTH, CAT_HEIGHT, travel)]), 'entry and exit leave no sprite visible')
      cases++
    }
  }
}
console.log(`Passed: ${cases} viewport/target/direction combinations; selection excludes the previous entry.`)
