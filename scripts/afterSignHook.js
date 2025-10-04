const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

exports.default = async function(context) {
  const { electronPlatformName, appOutDir } = context;

  // Only run for mas platform (not darwin) to avoid double signing
  if (electronPlatformName !== 'mas') {
    console.log(`Skipping afterSign hook for platform: ${electronPlatformName}`);
    return;
  }

  console.log(`afterSign hook executing for platform: ${electronPlatformName}...`);

  const appPath = path.join(appOutDir, `${context.packager.appInfo.productName}.app`);
  const frameworksPath = path.join(appPath, 'Contents', 'Frameworks');

  // Get signing identity from environment or use default
  const identity = process.env.CSC_NAME || 'Apple Distribution: JaeHwan Kim (L67FAG9382)';

  // Get project directory from context
  const projectDir = context.packager?.projectDir || process.cwd();

  // Paths to entitlements and provisioning profile
  const entitlementsInherit = path.join(projectDir, 'build', 'entitlements.mas.inherit.plist');
  const entitlementsMain = path.join(projectDir, 'build', 'entitlements.mas.plist');
  const provisioningProfile = path.join(projectDir, 'build', 'NeowFocus_Mac_App_Store.provisionprofile');

  // Helper function to sign a file
  function signFile(filePath, entitlements, description) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠ Skipping ${description} (not found): ${filePath}`);
      return false;
    }

    console.log(`Signing ${description}...`);
    try {
      // MAS builds don't use --options runtime (only for direct distribution)
      execSync(
        `codesign --force --sign "${identity}" --entitlements "${entitlements}" --timestamp "${filePath}"`,
        { stdio: 'inherit' }
      );
      console.log(`✓ Signed ${description}`);
      return true;
    } catch (error) {
      console.error(`✗ Failed to sign ${description}:`, error.message);
      throw error;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Starting deep signing process...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Step 1: Remove problematic files that cause sandbox issues
  console.log('Step 1: Removing MAS-incompatible components...');

  const electronFramework = path.join(frameworksPath, 'Electron Framework.framework');
  const electronVersionPath = path.join(electronFramework, 'Versions', 'A');

  // Remove Squirrel.framework (not needed for MAS)
  const squirrelPath = path.join(frameworksPath, 'Squirrel.framework');
  if (fs.existsSync(squirrelPath)) {
    try {
      execSync(`rm -rf "${squirrelPath}"`, { stdio: 'inherit' });
      console.log('✓ Removed Squirrel.framework');
    } catch (error) {
      console.error('Failed to remove Squirrel.framework:', error.message);
    }
  }

  // Remove chrome_crashpad_handler (causes sandbox issues in MAS)
  const crashpadHandler = path.join(electronVersionPath, 'Helpers', 'chrome_crashpad_handler');
  if (fs.existsSync(crashpadHandler)) {
    try {
      execSync(`rm -f "${crashpadHandler}"`, { stdio: 'inherit' });
      console.log('✓ Removed chrome_crashpad_handler');
    } catch (error) {
      console.error('Failed to remove chrome_crashpad_handler:', error.message);
    }
  }

  // Step 2: Sign Electron Framework
  console.log('\nStep 2: Signing Electron Framework...');

  // Sign Electron Framework itself
  signFile(
    electronFramework,
    entitlementsInherit,
    'Electron Framework'
  );

  // Step 3: Sign Helper apps
  console.log('\nStep 3: Signing Helper apps...');

  const helperApps = [
    'NeowFocus Helper.app',
    'NeowFocus Helper (GPU).app',
    'NeowFocus Helper (Plugin).app',
    'NeowFocus Helper (Renderer).app'
  ];

  for (const helperApp of helperApps) {
    const helperPath = path.join(frameworksPath, helperApp);
    const helperExecutable = path.join(helperPath, 'Contents', 'MacOS', helperApp.replace('.app', ''));

    if (fs.existsSync(helperPath)) {
      // Copy provisioning profile to helper app
      const helperProvisioningPath = path.join(helperPath, 'Contents', 'embedded.provisionprofile');
      try {
        fs.mkdirSync(path.dirname(helperProvisioningPath), { recursive: true });
        fs.copyFileSync(provisioningProfile, helperProvisioningPath);
        console.log(`✓ Copied provisioning profile to ${helperApp}`);
      } catch (error) {
        console.error(`Failed to copy provisioning profile to ${helperApp}:`, error.message);
        throw error;
      }

      // Sign the executable inside the helper app first
      signFile(helperExecutable, entitlementsInherit, `${helperApp} executable`);

      // Then sign the helper app bundle
      signFile(helperPath, entitlementsInherit, helperApp);
    }
  }

  // Step 4: Sign ReactiveObjC framework (if exists)
  console.log('\nStep 4: Signing additional frameworks...');
  const reactiveObjC = path.join(frameworksPath, 'ReactiveObjC.framework');
  if (fs.existsSync(reactiveObjC)) {
    signFile(reactiveObjC, entitlementsInherit, 'ReactiveObjC.framework');
  }

  const mantle = path.join(frameworksPath, 'Mantle.framework');
  if (fs.existsSync(mantle)) {
    signFile(mantle, entitlementsInherit, 'Mantle.framework');
  }

  // Step 5: Remove Login Helper (not needed for MAS and causes signing issues)
  console.log('\nStep 5: Removing Login Helper...');
  const loginHelperPath = path.join(appPath, 'Contents', 'Library', 'LoginItems', `${context.packager.appInfo.productName} Login Helper.app`);
  if (fs.existsSync(loginHelperPath)) {
    try {
      execSync(`rm -rf "${loginHelperPath}"`, { stdio: 'inherit' });
      console.log('✓ Removed Login Helper');
    } catch (error) {
      console.error('Failed to remove Login Helper:', error.message);
    }
  }

  // Step 6: Sign main executable
  console.log('\nStep 6: Signing main executable...');
  const mainExecutable = path.join(appPath, 'Contents', 'MacOS', context.packager.appInfo.productName);
  signFile(mainExecutable, entitlementsMain, 'Main executable');

  // Step 7: Copy provisioning profile and sign main app bundle
  console.log('\nStep 7: Final app bundle signing...');
  const mainProvisioningPath = path.join(appPath, 'Contents', 'embedded.provisionprofile');
  try {
    fs.copyFileSync(provisioningProfile, mainProvisioningPath);
    console.log('✓ Copied provisioning profile to main app');
  } catch (error) {
    console.error('Failed to copy provisioning profile:', error.message);
    throw error;
  }

  // Sign the main app bundle (WITHOUT --deep)
  signFile(appPath, entitlementsMain, 'Main app bundle');

  // Step 8: Verify signatures
  console.log('\nStep 8: Verifying signatures...');
  try {
    execSync(`codesign --verify --strict --verbose=2 "${appPath}"`, { stdio: 'inherit' });
    console.log('✓ Main app signature verification passed');
  } catch (error) {
    console.error('⚠ Signature verification failed:', error.message);
  }

  // Verify each helper
  for (const helperApp of helperApps) {
    const helperPath = path.join(frameworksPath, helperApp);
    if (fs.existsSync(helperPath)) {
      try {
        execSync(`codesign --verify --strict "${helperPath}"`, { stdio: 'pipe' });
        console.log(`✓ ${helperApp} signature verified`);
      } catch (error) {
        console.error(`⚠ ${helperApp} verification failed:`, error.message);
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✓ afterSign hook completed successfully');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};