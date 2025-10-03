const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

exports.default = async function(context) {
  const { electronPlatformName, appOutDir } = context;
  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  console.log('afterSign hook executing...');
  
  const appPath = path.join(appOutDir, `${context.packager.appInfo.productName}.app`);
  const frameworksPath = path.join(appPath, 'Contents', 'Frameworks');
  
  // Get signing identity from environment or use default
  const identity = process.env.CSC_NAME || 'Apple Distribution: JaeHwan Kim (L67FAG9382)';
  
  // Paths to entitlements
  const entitlementsInherit = path.join(context.projectDir, 'build', 'entitlements.mas.inherit.plist');
  const entitlementsMain = path.join(context.projectDir, 'build', 'entitlements.mas.plist');
  
  // Helper apps that need to be signed with sandbox
  const helperApps = [
    'NeowFocus Helper.app',
    'NeowFocus Helper (GPU).app',
    'NeowFocus Helper (Plugin).app',
    'NeowFocus Helper (Renderer).app'
  ];
  
  // Sign each helper app with sandbox entitlements
  for (const helperApp of helperApps) {
    const helperPath = path.join(frameworksPath, helperApp);
    if (fs.existsSync(helperPath)) {
      console.log(`Signing ${helperApp} with sandbox entitlements...`);
      try {
        execSync(
          `codesign --force --sign "${identity}" --preserve-metadata=identifier,entitlements,requirements,flags,runtime --entitlements "${entitlementsInherit}" --timestamp "${helperPath}"`,
          { stdio: 'inherit' }
        );
        console.log(`✓ Signed ${helperApp}`);
      } catch (error) {
        console.error(`Failed to sign ${helperApp}:`, error.message);
      }
    }
  }
  
  // Sign chrome_crashpad_handler if it exists
  const crashpadPath = path.join(frameworksPath, 'Electron Framework.framework', 'Versions', 'Current', 'Helpers', 'chrome_crashpad_handler');
  if (fs.existsSync(crashpadPath)) {
    console.log('Signing chrome_crashpad_handler with sandbox entitlements...');
    try {
      execSync(
        `codesign --force --sign "${identity}" --preserve-metadata=identifier,entitlements,requirements,flags,runtime --entitlements "${entitlementsInherit}" --timestamp "${crashpadPath}"`,
        { stdio: 'inherit' }
      );
      console.log('✓ Signed chrome_crashpad_handler');
    } catch (error) {
      console.error('Failed to sign chrome_crashpad_handler:', error.message);
    }
  }
  
  // Remove Squirrel.framework if present (not needed for MAS)
  const squirrelPath = path.join(frameworksPath, 'Squirrel.framework');
  if (fs.existsSync(squirrelPath)) {
    console.log('Removing Squirrel.framework (not needed for MAS)...');
    try {
      execSync(`rm -rf "${squirrelPath}"`, { stdio: 'inherit' });
      console.log('✓ Removed Squirrel.framework');
    } catch (error) {
      console.error('Failed to remove Squirrel.framework:', error.message);
    }
  }
  
  // Re-sign the main app with proper entitlements
  console.log('Re-signing main app with sandbox entitlements...');
  try {
    execSync(
      `codesign --force --sign "${identity}" --preserve-metadata=identifier,entitlements,requirements,flags,runtime --entitlements "${entitlementsMain}" --timestamp "${appPath}"`,
      { stdio: 'inherit' }
    );
    console.log('✓ Re-signed main app');
  } catch (error) {
    console.error('Failed to re-sign main app:', error.message);
  }
  
  console.log('afterSign hook completed');
};