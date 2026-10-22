const fs = require('node:fs');
const path = require('node:path');
const { withInfoPlist, withEntitlementsPlist, withXcodeProject } = require('expo/config-plugins');
const plist = require(require.resolve('@expo/plist', { paths: [require.resolve('expo/config-plugins')] })).default;

const GROUP = 'group.com.neowfocus.pomodorotimer';
const CONTAINER = 'iCloud.com.neowfocus.pomodorotimer';
const unquote = (value) => String(value || '').replace(/^"|"$/g, '');

function addExtension(project, name, bundleId, sourceFiles, config) {
  let target = Object.entries(project.pbxNativeTargetSection()).find(([key, value]) => !key.endsWith('_comment') && unquote(value.name) === name);
  if (!target) {
    const added = project.addTarget(name, 'app_extension', name, bundleId);
    project.addBuildPhase(sourceFiles.map(file => `${name}/${file}`), 'PBXSourcesBuildPhase', 'Sources', added.uuid);
    project.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', added.uuid);
    project.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', added.uuid);
    target = [added.uuid, added.pbxNativeTarget];
  }
  for (const file of sourceFiles) {
    const sourcePath = `${name}/${file}`;
    if (!project.hasFile(sourcePath)) project.addSourceFile(sourcePath, { target: target[0] }, project.getFirstProject().firstProject.mainGroup);
  }
  if (!target[1].buildPhases.some(ref => project.hash.project.objects.PBXResourcesBuildPhase?.[ref.value])) {
    project.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', target[0]);
  }
  const privacyPath = `${name}/PrivacyInfo.xcprivacy`;
  if (!project.hasFile(privacyPath)) {
    const resource = project.addFile(privacyPath, project.getFirstProject().firstProject.mainGroup);
    resource.uuid = project.generateUuid();
    resource.target = target[0];
    resource.group = 'Resources';
    project.addToPbxBuildFileSection(resource);
    project.addToPbxResourcesBuildPhase(resource);
  }
  const configList = project.pbxXCConfigurationList()[target[1].buildConfigurationList];
  const appConfig = Object.values(project.pbxXCBuildConfigurationSection()).find(item => item.buildSettings?.PRODUCT_BUNDLE_IDENTIFIER && unquote(item.buildSettings.PRODUCT_BUNDLE_IDENTIFIER) === config.ios.bundleIdentifier);
  for (const ref of configList.buildConfigurations) {
    const settings = project.pbxXCBuildConfigurationSection()[ref.value].buildSettings;
    Object.assign(settings, {
      PRODUCT_BUNDLE_IDENTIFIER: `"${bundleId}"`,
      INFOPLIST_FILE: `"${name}/${name}-Info.plist"`,
      CODE_SIGN_ENTITLEMENTS: `"${name}/${name}.entitlements"`,
      IPHONEOS_DEPLOYMENT_TARGET: '16.4',
      SWIFT_VERSION: '5.0',
      TARGETED_DEVICE_FAMILY: '1',
      SDKROOT: 'iphoneos',
      CODE_SIGN_STYLE: 'Automatic',
      DEVELOPMENT_TEAM: config.ios.appleTeamId || '',
      GENERATE_INFOPLIST_FILE: 'NO',
      APPLICATION_EXTENSION_API_ONLY: 'YES',
      CLANG_ENABLE_MODULES: 'YES',
      CURRENT_PROJECT_VERSION: String(config.ios.buildNumber || appConfig?.buildSettings.CURRENT_PROJECT_VERSION || '1'),
      MARKETING_VERSION: config.version || '0.1.0',
      SKIP_INSTALL: 'YES',
      SWIFT_OPTIMIZATION_LEVEL: unquote(project.pbxXCBuildConfigurationSection()[ref.value].name) === 'Debug' ? '"-Onone"' : '"-O"',
    });
  }
  project.addTargetAttribute('DevelopmentTeam', config.ios.appleTeamId || '', target[0]);
}

module.exports = function withNeowFocusNative(config, options = {}) {
  const cloudEnabled = options.cloudKit !== false;
  config = withInfoPlist(config, mod => {
    mod.modResults.NSSupportsLiveActivities = true;
    mod.modResults.NeowFocusCloudEnabled = cloudEnabled;
    mod.modResults.NSCalendarsUsageDescription = '냐우포커스 전용 iCloud 캘린더에 하루 집중 횟수와 총 시간을 저장하고 갱신합니다. 다른 일정은 변경하지 않습니다.';
    mod.modResults.NSCalendarsFullAccessUsageDescription = mod.modResults.NSCalendarsUsageDescription;
    if (cloudEnabled) mod.modResults.UIBackgroundModes = [...new Set([...(mod.modResults.UIBackgroundModes || []), 'remote-notification'])];
    delete mod.modResults.NeowFocusBlockingEnabled;
    return mod;
  });
  config = withEntitlementsPlist(config, mod => {
    const existingGroups = mod.modResults['com.apple.security.application-groups'] || [];
    mod.modResults['com.apple.security.application-groups'] = [...new Set([...existingGroups, GROUP])];
    if (cloudEnabled) {
      mod.modResults['aps-environment'] = 'development';
      mod.modResults['com.apple.developer.icloud-container-identifiers'] = [CONTAINER];
      mod.modResults['com.apple.developer.icloud-services'] = ['CloudKit'];
    } else {
      delete mod.modResults['com.apple.developer.icloud-container-identifiers'];
      delete mod.modResults['com.apple.developer.icloud-services'];
    }
    delete mod.modResults['com.apple.developer.family-controls'];
    return mod;
  });
  return withXcodeProject(config, mod => {
    const root = mod.modRequest.projectRoot;
    const nativeRoot = mod.modRequest.platformProjectRoot;
    const project = mod.modResults;
    if (Object.values(project.pbxNativeTargetSection()).some(t => unquote(t.name) === 'NeowFocusMonitor')) {
      throw new Error('Remove the legacy monitor target with expo prebuild --clean --platform ios before building this release.');
    }
    const extensions = [{ name: 'NeowFocusWidgets', suffix: 'widgets', point: 'com.apple.widgetkit-extension', files: ['FocusWidgets.swift', 'FocusArt.swift'], shared: ['FocusShared.swift', 'CloudStore.swift'] }];
    for (const extension of extensions) {
      const folder = path.join(nativeRoot, extension.name);
      fs.mkdirSync(folder, { recursive: true });
      for (const file of extension.files) fs.copyFileSync(path.join(root, 'native-sources', extension.name, file), path.join(folder, file));
      for (const file of extension.shared) fs.copyFileSync(path.join(root, 'modules/neowfocus-native/ios', file), path.join(folder, file));
      fs.copyFileSync(path.join(root, 'modules/neowfocus-native/ios/PrivacyInfo.xcprivacy'), path.join(folder, 'PrivacyInfo.xcprivacy'));
      const info = {
        CFBundleDisplayName: '집중', CFBundleName: '$(PRODUCT_NAME)', CFBundleIdentifier: '$(PRODUCT_BUNDLE_IDENTIFIER)',
        CFBundleExecutable: '$(EXECUTABLE_NAME)', CFBundlePackageType: 'XPC!', CFBundleShortVersionString: '$(MARKETING_VERSION)', CFBundleVersion: '$(CURRENT_PROJECT_VERSION)',
        NSExtension: { NSExtensionPointIdentifier: extension.point },
      };
      fs.writeFileSync(path.join(folder, `${extension.name}-Info.plist`), plist.build(info));
      fs.writeFileSync(path.join(folder, `${extension.name}.entitlements`), plist.build({
        'com.apple.security.application-groups': [GROUP], ...(cloudEnabled && extension.name === 'NeowFocusWidgets' ? { 'com.apple.developer.icloud-container-identifiers': [CONTAINER], 'com.apple.developer.icloud-services': ['CloudKit'] } : {}),
      }));
      addExtension(project, extension.name, `${config.ios.bundleIdentifier}.${extension.suffix}`, [...extension.files, ...extension.shared], config);
    }
    return mod;
  });
};
