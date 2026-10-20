const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

// Expo SDK 57 provides this delegate; iOS 27 requires the scene lifecycle at launch.
const sceneManifest = {
  UIApplicationSupportsMultipleScenes: false,
  UISceneConfigurations: {
    UIWindowSceneSessionRoleApplication: [{
      UISceneConfigurationName: 'Default Configuration',
      UISceneDelegateClassName: 'EXExpoAppSceneDelegate'
    }]
  }
};

function updateAppDelegate(source) {
  if (!source.includes('ExpoReactNativeFactoryProvider')) {
    if (!source.includes('class AppDelegate: ExpoAppDelegate {')) {
      throw new Error('Unexpected AppDelegate template: cannot configure the Expo scene lifecycle.');
    }
    source = source.replace('class AppDelegate: ExpoAppDelegate {', 'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {');
  }
  // The scene delegate owns the window and starts the factory created in didFinishLaunching.
  return source.replace(/#if os\(iOS\) \|\| os\(tvOS\)\s+window = UIWindow\(frame: UIScreen\.main\.bounds\)[\s\S]*?#endif\s*/,
    '// ExpoAppSceneDelegate creates the window and starts React Native.\n\n    ');
}

function withSceneLifecycle(config) {
  config = withInfoPlist(config, mod => {
    mod.modResults.UIApplicationSceneManifest = sceneManifest;
    return mod;
  });
  return withAppDelegate(config, mod => {
    if (mod.modResults.language !== 'swift') throw new Error('NeowFocus scene lifecycle requires the Swift AppDelegate.');
    mod.modResults.contents = updateAppDelegate(mod.modResults.contents);
    return mod;
  });
}

module.exports = withSceneLifecycle;
module.exports.updateAppDelegate = updateAppDelegate;
module.exports.sceneManifest = sceneManifest;
