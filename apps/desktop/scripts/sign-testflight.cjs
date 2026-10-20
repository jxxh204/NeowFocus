const path = require('node:path')
;(async () => {
  const { sign } = await import('@electron/osx-sign')
  const app = path.resolve(process.argv[2] || 'build-output/packages/NeowFocus-mas-universal/NeowFocus.app')
  await sign({
    app, platform: 'mas', type: 'distribution', version: '28.3.3',
    identity: 'Apple Distribution: JaeHwan Kim (L67FAG9382)',
    provisioningProfile: path.resolve('build/NeowFocus_Mac_App_Store.provisionprofile'),
    optionsForFile: file => ({
      entitlements: path.resolve(file === app ? 'build/entitlements.mas.plist' : 'build/entitlements.mas.inherit.plist'),
      hardenedRuntime: false
    })
  })
  console.log('Distribution signing completed')
})().catch(error => { console.error(error); process.exitCode = 1 })
