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
npm run build        # Production build with type checking
npm run build:mac    # Build for macOS
npm run build:win    # Build for Windows
npm run build:linux  # Build for Linux
```

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

4. **Path Aliases**: Use these imports:
   - `@renderer/*` for renderer source files
   - `@components/*` for UI components
   - `@hooks/*` for custom hooks
   - `@styles/*` for styling
   - `@assets/*` for assets

## Development Guidelines

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
- Uses electron-vite for development and building
- electron-builder for packaging
- Platform-specific builds available for Windows, macOS, and Linux