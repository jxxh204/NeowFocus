# Mac App Store 빌드 설정 가이드

## 1. Apple Developer Center 설정

### 1.1 CSR 파일 생성 (Certificate Signing Request)

**CSR 파일은 인증서를 요청할 때 필요한 파일입니다. 먼저 한 번만 생성하면 여러 인증서에 재사용할 수 있습니다.**

1. **키체인 접근 앱** 열기
   ```bash
   # Spotlight에서 "키체인 접근" 검색 또는
   open -a "Keychain Access"
   ```

2. **메뉴바에서 CSR 생성**
   - 상단 메뉴: **키체인 접근 → 인증서 지원 → 인증 기관에서 인증서 요청...**
   - 영문: **Keychain Access → Certificate Assistant → Request a Certificate From a Certificate Authority...**

3. **정보 입력**
   - **사용자 이메일 주소**: Apple Developer 계정 이메일 (예: your@email.com)
   - **일반 이름**: 본인 이름 (예: JaeHwan Kim)
   - **CA 이메일 주소**: 비워두기
   - **요청 항목**: "**디스크에 저장됨**" 선택
   - **본인이 키 쌍 정보 지정** 체크

4. **저장**
   - 파일 이름: `CertificateSigningRequest.certSigningRequest`
   - 저장 위치: 바탕화면 또는 원하는 위치
   - 키 크기: 2048비트
   - 알고리즘: RSA

### 1.2 인증서 생성

1. **Apple Developer Center** 접속
   - https://developer.apple.com/account/resources/certificates

2. **Mac App Distribution 인증서** 생성
   - 왼쪽 메뉴: **Certificates** → **(+) 버튼** 클릭
   - 타입: **Mac App Distribution** 선택 → **Continue**
   - **Choose File** 클릭 → 위에서 생성한 CSR 파일 업로드
   - **Continue** 클릭
   - 인증서 다운로드: `distribution.cer` 또는 유사한 이름
   - **더블클릭**하여 키체인에 자동 설치
   - 키체인에서 확인 시 이름: "**3rd Party Mac Developer Application: JaeHwan Kim (L67FAG9382)**" 형식
   - ℹ️ 참고: "Apple Distribution"으로 표시될 수도 있음 (Apple이 이름을 여러 번 변경, 동일 인증서)

3. **Mac Installer Distribution 인증서** 생성
   - 왼쪽 메뉴: **Certificates** → **(+) 버튼** 클릭
   - 타입: **Mac Installer Distribution** 선택 → **Continue**
   - **Choose File** 클릭 → 동일한 CSR 파일 업로드 (재사용 가능)
   - **Continue** 클릭
   - 인증서 다운로드: `installer.cer` 또는 유사한 이름
   - **더블클릭**하여 키체인에 자동 설치
   - 키체인에서 확인 시 이름: "**3rd Party Mac Developer Installer: JaeHwan Kim (L67FAG9382)**" 형식

4. **키체인에서 확인**
   ```bash
   # 터미널에서 설치된 인증서 확인
   security find-identity -v -p codesigning
   ```

   출력 예시:
   ```
   1) ABC123... "3rd Party Mac Developer Application: JaeHwan Kim (L67FAG9382)"
   2) DEF456... "3rd Party Mac Developer Installer: JaeHwan Kim (L67FAG9382)"
   ```

   또는:
   ```
   1) ABC123... "Apple Distribution: JaeHwan Kim (L67FAG9382)"
   2) DEF456... "3rd Party Mac Developer Installer: JaeHwan Kim (L67FAG9382)"
   ```

### 1.3 App ID 등록

#### 중요: NeowFocus는 기본 Electron 앱이므로 Main App ID만 등록하면 됩니다!

**Electron의 Helper 앱들은 별도 App ID가 필요 없습니다.** 메인 앱의 Provisioning Profile을 공유합니다.

1. **Identifiers** 메뉴 이동
   - https://developer.apple.com/account/resources/identifiers

2. **Main App ID 등록**
   - **(+) 버튼** 클릭
   - **App IDs** 선택 → **Continue**
   - **Type**: **App** 선택 → **Continue**

3. **App ID 정보 입력**
   - **Description**: `NeowFocus` (앱 설명)
   - **Bundle ID**: **Explicit** 선택
   - **Bundle ID 입력**: `com.neowfocus.pomodorotimer`

4. **Capabilities 설정**

   NeowFocus 앱의 경우 다음 Capabilities만 선택:

   ✅ **필수 Capabilities:**
   - **App Sandbox** (Mac App Store 필수)

   ✅ **선택 Capabilities** (현재 코드 기준):
   - 추가 Capabilities 없음

   ❌ **불필요한 Capabilities** (체크하지 마세요):
   - iCloud
   - Push Notifications
   - Sign in with Apple
   - Network Extensions
   - 기타 등등

   **중요:**
   - App Sandbox는 자동으로 활성화됩니다
   - 앱에서 실제로 사용하지 않는 Capabilities는 선택하지 마세요
   - 나중에 필요하면 언제든지 추가할 수 있습니다

5. **Continue** → **Register** 클릭

6. **완료 확인**
   - Identifiers 목록에 `com.neowfocus.pomodorotimer`가 표시되면 성공

#### Helper App IDs는 등록하지 마세요!

Electron의 Helper 앱들은:
- `NeowFocus Helper.app`
- `NeowFocus Helper (GPU).app`
- `NeowFocus Helper (Plugin).app`
- `NeowFocus Helper (Renderer).app`

이들은 **별도 App ID가 필요 없습니다**. 메인 앱의 Provisioning Profile을 재사용합니다.

### 1.4 Provisioning Profile 생성

**NeowFocus는 하나의 Provisioning Profile만 필요합니다!**

1. **Profiles** 메뉴 이동
   - https://developer.apple.com/account/resources/profiles

2. **Provisioning Profile 생성 시작**
   - **(+) 버튼** 클릭
   - **Distribution** 섹션에서 **Mac App Store** 선택
   - **Continue** 클릭

3. **App ID 선택**
   - 드롭다운에서 `NeowFocus (com.neowfocus.pomodorotimer)` 선택
   - **Continue** 클릭

4. **인증서 선택**
   - 방금 만든 **Mac App Distribution** 인증서 체크
   - 이름: "3rd Party Mac Developer Application: JaeHwan Kim (L67FAG9382)" 또는 "Apple Distribution: ..."
   - **Continue** 클릭

5. **Profile 이름 입력**
   - **Provisioning Profile Name**: `NeowFocus_Mac_App_Store`
   - **Continue** 클릭

6. **다운로드 및 저장**
   - **Download** 버튼 클릭
   - 다운로드된 파일: `NeowFocus_Mac_App_Store.provisionprofile`
   - **저장 위치**: 프로젝트의 `build/` 폴더

   ```bash
   # 프로젝트 루트에서 실행
   mkdir -p build
   mv ~/Downloads/NeowFocus_Mac_App_Store.provisionprofile build/
   ```

7. **확인**
   ```bash
   # Profile 내용 확인
   security cms -D -i build/NeowFocus_Mac_App_Store.provisionprofile
   ```

#### Helper Apps는 별도 Profile 불필요!

Electron Helper 앱들은 메인 앱의 Provisioning Profile을 공유하므로 **추가 Profile을 만들 필요가 없습니다**.

## 2. 로컬 환경 설정

### 2.1 Entitlements 파일 생성

**NeowFocus 앱에 필요한 Entitlements 파일을 생성합니다.**

#### 1. 메인 앱 Entitlements

프로젝트 루트에서 실행:

```bash
mkdir -p build
cat > build/entitlements.mas.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Mac App Store 필수 -->
    <key>com.apple.security.app-sandbox</key>
    <true/>

    <!-- NeowFocus가 사용하는 권한들 -->
    <key>com.apple.security.cs.allow-jit</key>
    <true/>

    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>

    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
</dict>
</plist>
EOF
```

**설명:**
- `com.apple.security.app-sandbox`: Mac App Store 필수
- `com.apple.security.cs.allow-jit`: Electron/Chromium JIT 컴파일러 필요
- `com.apple.security.cs.allow-unsigned-executable-memory`: V8 엔진 필요
- `com.apple.security.cs.disable-library-validation`: Electron 네이티브 모듈 로딩 필요

#### 2. Helper Apps Entitlements

```bash
cat > build/entitlements.mas.inherit.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>

    <key>com.apple.security.inherit</key>
    <true/>

    <key>com.apple.security.cs.allow-jit</key>
    <true/>

    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>

    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
</dict>
</plist>
EOF
```

**설명:**
- `com.apple.security.inherit`: Helper 앱이 메인 앱의 권한 상속
- 나머지는 Electron Helper 프로세스에 필요

#### 3. 파일 확인

```bash
ls -la build/entitlements.mas*.plist
```

출력:
```
-rw-r--r--  1 user  staff  XXX  build/entitlements.mas.plist
-rw-r--r--  1 user  staff  XXX  build/entitlements.mas.inherit.plist
```

### 2.2 환경 변수 설정

1. **인증서 정보 확인**
```bash
security find-identity -v -p codesigning
```

출력 예시:
```
1) ABC123... "Apple Distribution: Your Name (TEAMID)"
2) DEF456... "3rd Party Mac Developer Installer: Your Name (TEAMID)"
```

2. **환경 변수 설정** (`.env` 파일 또는 쉘 설정)
```bash
export CSC_NAME="Apple Distribution: Your Name (TEAMID)"
export CSC_INSTALLER_NAME="3rd Party Mac Developer Installer: Your Name (TEAMID)"
```

### 2.3 Forge 설정 업데이트

`forge.config.js` 파일에 다음 설정 추가:

```javascript
module.exports = {
  packagerConfig: {
    name: 'NeowFocus',
    executableName: 'NeowFocus',
    appBundleId: 'com.neowfocus.pomodorotimer',
    appCategoryType: 'public.app-category.productivity',
    icon: path.join(__dirname, 'build', 'icon'),
    dir: './out',

    // MAS 서명 설정
    osxSign: {
      identity: process.env.CSC_NAME || 'Apple Distribution: Your Name (TEAMID)',
      provisioningProfile: path.join(__dirname, 'build', 'NeowFocus_Mac_App_Store.provisionprofile'),
      entitlements: path.join(__dirname, 'build', 'entitlements.mas.plist'),
      'entitlements-inherit': path.join(__dirname, 'build', 'entitlements.mas.inherit.plist'),
      hardenedRuntime: false,
      'gatekeeper-assess': false,
      type: 'distribution',
      platform: 'mas',
    },

    osxNotarize: false,

    extendInfo: {
      ITSAppUsesNonExemptEncryption: false,
      CFBundleIconName: 'AppIcon',
      CFBundleIconFile: 'AppIcon',
      LSMinimumSystemVersion: '11.0.0',
      NSHighResolutionCapable: true,
    },

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
        identity: process.env.CSC_INSTALLER_NAME || '3rd Party Mac Developer Installer: Your Name (TEAMID)',
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
      // Helper apps provisioning profile 삽입 및 재서명 로직
      const outputDir = options.outputPaths[0];
      const appPath = path.join(outputDir, 'NeowFocus.app');
      const frameworksPath = path.join(appPath, 'Contents', 'Frameworks');

      const mainProvisioningProfile = path.join(__dirname, 'build', 'NeowFocus_Mac_App_Store.provisionprofile');
      const helperApps = [
        'NeowFocus Helper.app',
        'NeowFocus Helper (GPU).app',
        'NeowFocus Helper (Plugin).app',
        'NeowFocus Helper (Renderer).app',
      ];

      const identity = process.env.CSC_NAME || 'Apple Distribution: Your Name (TEAMID)';
      const entitlementsInherit = path.join(__dirname, 'build', 'entitlements.mas.inherit.plist');

      for (const helperApp of helperApps) {
        const helperPath = path.join(frameworksPath, helperApp);
        if (fs.existsSync(helperPath)) {
          const helperProvisioningPath = path.join(helperPath, 'Contents', 'embedded.provisionprofile');
          fs.copyFileSync(mainProvisioningProfile, helperProvisioningPath);

          execSync(
            `codesign --force --sign "${identity}" --entitlements "${entitlementsInherit}" --timestamp "${helperPath}"`,
            { stdio: 'inherit' }
          );
        }
      }

      // 메인 앱 재서명
      const mainEntitlements = path.join(__dirname, 'build', 'entitlements.mas.plist');
      execSync(
        `codesign --force --sign "${identity}" --entitlements "${mainEntitlements}" --timestamp "${appPath}"`,
        { stdio: 'inherit' }
      );

      // 권한 수정
      execSync(`chmod -R a+rX "${appPath}"`);
    },
  },
};
```

### 2.4 빌드 스크립트 추가

`package.json`에 다음 스크립트 추가:

```json
{
  "scripts": {
    "build:mas": "pnpm run build && electron-forge package --arch=universal --platform=mas",
    "build:pkg": "rm -rf out/ && pnpm run build:mas && electron-forge make --arch=universal --platform=mas"
  }
}
```

## 3. 빌드 및 검증

### 3.1 빌드 실행

```bash
# MAS 앱 빌드
pnpm run build:mas

# PKG 생성
pnpm run build:pkg
```

### 3.2 서명 검증

```bash
# 메인 앱 서명 확인
codesign -dvvv --deep --strict out/NeowFocus-mas-universal/NeowFocus.app

# Helper apps 서명 확인
codesign -dvvv out/NeowFocus-mas-universal/NeowFocus.app/Contents/Frameworks/NeowFocus\ Helper.app

# Provisioning Profile 확인
security cms -D -i out/NeowFocus-mas-universal/NeowFocus.app/Contents/embedded.provisionprofile
```

### 3.3 PKG 검증

```bash
pkgutil --check-signature out/make/pkg/mas/universal/NeowFocus.pkg
```

## 4. App Store Connect 업로드

1. **Transporter 앱** 사용
   - PKG 파일 드래그 앤 드롭
   - 전송(Deliver) 버튼 클릭

2. **App Store Connect** 설정
   - https://appstoreconnect.apple.com
   - 앱 → TestFlight 또는 App Store
   - 빌드 선택 및 제출

## 5. 문제 해결

### 서명 오류
- 키체인에서 인증서 확인
- Provisioning Profile 유효기간 확인
- App ID와 Bundle ID 일치 확인

### Provisioning Profile 오류
- Profile이 올바른 위치(`build/`)에 있는지 확인
- Profile에 인증서가 포함되어 있는지 확인
- Helper apps에 embedded.provisionprofile이 있는지 확인

### 권한 오류
- Entitlements와 Provisioning Profile의 capabilities 일치 확인
- App Sandbox 설정 확인

## 참고 자료

- [Electron Forge 문서](https://www.electronforge.io/)
- [Mac App Store 제출 가이드](https://developer.apple.com/kr/support/app-store/)
- [Code Signing Guide](https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/)
