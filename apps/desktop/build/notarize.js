const { notarize } = require('@electron/notarize')
const { build } = require('../package.json')

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context
  
  // macOS만 공증 진행
  if (electronPlatformName !== 'darwin') {
    return
  }

  // 환경변수 확인
  if (!process.env.APPLE_ID || !process.env.APPLE_APP_SPECIFIC_PASSWORD) {
    console.warn('Skipping notarization: Missing Apple ID credentials')
    return
  }

  const appName = context.packager.appInfo.productFilename
  
  console.log('Notarizing application...')
  
  try {
    await notarize({
      appBundleId: build.appId,
      appPath: `${appOutDir}/${appName}.app`,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID
    })
    
    console.log('Notarization completed successfully!')
  } catch (error) {
    console.error('Notarization failed:', error)
    throw error
  }
}