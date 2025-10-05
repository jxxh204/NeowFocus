const path = require('path');
const { execSync } = require('child_process');

module.exports = {
  packagerConfig: {
    name: 'NeowFocus',
    executableName: 'NeowFocus',
    appBundleId: 'com.neowfocus.pomodorotimer',
    appCategoryType: 'public.app-category.productivity',
    icon: path.join(__dirname, 'build', 'icon'),
    dir: './out',

    // Mac App Store 서명 설정
    osxSign: {
      identity: 'Apple Distribution: JaeHwan Kim (L67FAG9382)',
      platform: 'mas',
      type: 'distribution',
      provisioningProfile: path.join(__dirname, 'build', 'NeowFocus_Mac_App_Store.provisionprofile'),
      optionsForFile: (filePath) => {
        // Helper 앱들과 프레임워크에는 inherit entitlements 사용
        const entitlements = filePath.includes('.app/')
          ? path.join(__dirname, 'build', 'entitlements.mas.inherit.plist')
          : path.join(__dirname, 'build', 'entitlements.mas.plist');
        return {
          hardenedRuntime: false,
          entitlements
        };
      },
    },
    osxNotarize: false,

    // Extended Info.plist
    extendInfo: {
      ITSAppUsesNonExemptEncryption: false,
      CFBundleIconName: 'AppIcon',
      CFBundleIconFile: 'AppIcon',
      LSMinimumSystemVersion: '11.0.0',
      NSHighResolutionCapable: true,
    },

    // Extra resources
    extraResource: [
      path.join(__dirname, 'build', 'compiled', 'Assets.car'),
      path.join(__dirname, 'build', 'compiled', 'AppIcon.icns'),
    ],

    ignore: [/\.map$/],
  },

  makers: [
    {
      name: '@electron-forge/maker-pkg',
      config: {
        name: 'NeowFocus',
        identity: '3rd Party Mac Developer Installer: JaeHwan Kim (L67FAG9382)',
        install: '/Applications',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['mas'],
    },
  ],

  hooks: {
    postPackage: async (forgeConfig, options) => {
      const outputDir = options.outputPaths[0];
      const appPath = path.join(outputDir, 'NeowFocus.app');

      // MAS 플랫폼인 경우에만 서명
      if (options.platform === 'mas') {
        console.log('\n🔧 @electron/osx-sign을 사용하여 서명 중...');

        const { sign } = require('@electron/osx-sign');

        try {
          await sign({
            app: appPath,
            identity: 'Apple Distribution: JaeHwan Kim (L67FAG9382)',
            platform: 'mas',
            type: 'distribution',
            provisioningProfile: path.join(__dirname, 'build', 'NeowFocus_Mac_App_Store.provisionprofile'),
            optionsForFile: (filePath) => {
              // 리소스 파일 (.pak, .dat, .bin 등)은 서명하지 않음
              const ext = path.extname(filePath);
              const resourceExtensions = ['.pak', '.dat', '.bin', '.lproj', '.txt', '.html', '.js', '.json'];

              // 확장자로 판단하거나 Resources 폴더 내 파일이면 건너뛰기
              if (resourceExtensions.includes(ext) || filePath.includes('/Resources/') || filePath.includes('.lproj/')) {
                return null; // null을 반환하면 서명하지 않음
              }

              const entitlements = filePath.includes('.app/')
                ? path.join(__dirname, 'build', 'entitlements.mas.inherit.plist')
                : path.join(__dirname, 'build', 'entitlements.mas.plist');
              return {
                hardenedRuntime: false,
                entitlements
              };
            },
          });
          console.log('✅ 서명 완료!');
        } catch (error) {
          console.error('❌ 서명 실패:', error);
          throw error;
        }
      }

      // 권한 수정
      console.log('\n🔧 권한 수정 중...');
      execSync(`chmod -R a+rX "${appPath}"`, { stdio: 'inherit' });

      console.log('✅ 후처리 완료!\n');
    },
  },
};
