# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
NeowFocus is an Electron-based Pomodoro timer desktop application with React and TypeScript. It features a cute cat-themed UI with system tray integration and always-on-top floating timer functionality.

## Essential Commands

### Development
```bash
npm run dev          # Start development server with hot reload and sourcemaps
npm run format       # Format code with Prettier
npm run lint         # Lint and fix with ESLint
npm run typecheck    # Run TypeScript type checking for both Node and Web
```

### Building
```bash
pnpm run build        # Build source code with electron-vite
pnpm run package      # Package app with Electron Forge
pnpm run make         # Create distributable packages
pnpm run build:mas    # Build universal .app for Mac App Store (auto version bump)
pnpm run build:pkg    # Build and create signed PKG installer for MAS
```

### Deployment
```bash
pnpm run deploy:testflight  # Full TestFlight deployment workflow:
                            # 1. Clean previous builds
                            # 2. Build MAS universal binary
                            # 3. Verify signatures and provisioning
                            # 4. Create signed PKG
                            # 5. Open Transporter for upload
                            # 6. Guide through App Store Connect
```

### Build System Details
- **Packaging**: Uses @electron/forge (Apple's official tool)
- **Source compilation**: electron-vite
- **Output directory**: `out/` (not `dist/`)
- **Universal binaries**: Supports both x64 and arm64 architectures
- **Code signing**: Automatic via Forge with custom postPackage hook for Helper apps
- **Version management**: Automatic patch version increment on each build:mas

## Architecture

### Process Structure
The application uses Electron's multi-process architecture:

- **Main Process** (`src/main/`): Manages window creation, system tray, and OS-level interactions
  - Window management in `handlers/windowHandler.ts`
  - Tray management in `handlers/trayHandler.ts`
  - IPC protocols defined in `IpcProtocol.ts`

- **Renderer Process** (`src/renderer/src/`): React application for UI
  - Router setup with 3 routes: `/` (input), `/focus` (timer), `/minimize_focus` (mini view)
  - State management via TaskContext and PopupContext
  - Custom hooks for timer logic and local storage persistence

- **Preload** (`src/preload/`): Secure bridge between main and renderer

### Key Architectural Decisions

1. **State Management**: React Context API with localStorage persistence
   - TaskContext manages task name, duration, and timer state
   - Tasks persist between app sessions via useLocalStorage hook

2. **Timer Implementation**: 
   - Default 25-minute (1500 seconds) Pomodoro sessions
   - Circular progress visualization with SVG
   - States: idle, play, end

3. **Window Behavior**:
   - Fixed 384x60px size (expandable to 900px height)
   - Always-on-top floating window
   - Frameless with transparency support
   - Keyboard shortcuts disabled during focus sessions

4. **Mac App Store Build Process**:
   - **prePackage hook**: Removes MAS-incompatible files (Squirrel, Login Helper, crashpad)
   - **osxSign (during packaging)**: Signs main app and frameworks with MAS distribution cert
   - **postPackage hook**: Embeds provisioning profiles in Helper apps and re-signs all apps
   - **maker-pkg**: Creates signed PKG installer for App Store submission
   - All provisioning profiles must be embedded before final signing
   - Universal builds combine x64 + arm64 architectures

5. **Path Aliases**: Use these imports:
   - `@renderer/*` for renderer source files
   - `@components/*` for UI components
   - `@hooks/*` for custom hooks
   - `@styles/*` for styling
   - `@assets/*` for assets

## Development Guidelines

### Build & Package System
- **Package manager**: pnpm (with hoisted node-linker)
- **Forge config**: `forge.config.js` (replaces electron-builder)
- **entitlements**: `build/entitlements.mas.plist` (main) and `build/entitlements.mas.inherit.plist` (helpers)
- **Provisioning**: `build/NeowFocus_Mac_App_Store.provisionprofile`
- **Icons**: Compiled to `build/compiled/Assets.car` and `AppIcon.icns`
- **Scripts**: Version management (`increment-version.js`), deployment (`deploy-testflight.sh`), verification (`verify-mas-build.sh`)

### TypeScript Configuration
- Separate configs for Node (main/preload) and Web (renderer)
- Always run `npm run typecheck` before committing

### Component Structure
- Components in `src/renderer/src/component/`
- Use styled-components for styling
- Follow existing patterns for state management with Context API

### IPC Communication
- Define protocols in `src/main/IpcProtocol.ts`
- Use contextBridge in preload for secure communication
- Handle window events through established handlers

### Build Process
- **electron-vite**: Source code compilation (main/preload/renderer)
- **@electron/forge**: App packaging and distribution
  - Config file: `forge.config.js`
  - Output directory: `out/`
  - Makers: PKG (Mac App Store), ZIP
- **Mac App Store Build**:
  - Forge's `osxSign` handles all signing automatically
  - Entitlements: `build/entitlements.mas.plist` and `build/entitlements.mas.inherit.plist`
  - Provisioning profile: `build/NeowFocus_Mac_App_Store.provisionprofile`
  - `postPackage` hook removes MAS-incompatible components (Squirrel, crashpad_handler, Login Helper)