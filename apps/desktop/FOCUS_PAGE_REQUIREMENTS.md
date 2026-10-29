# Focus Page Requirements

## Overview
This document outlines the requirements for the Focus page timer functionality based on the Figma design specifications.

## Page Structure
- **Route**: `/focus`
- **Window Size**: 400px × 186px (expandable height for modals)
- **Layout**: Top bar (30px) + Timer content (108px) + Bottom button (48px)

---

## 1. Timer Display States

### 1.1 Default Timer State
**Visual Elements:**
- Task name text display (left side, multiline support)
- Circular timer (right side, 64×64px)
- Time remaining display below timer (format: `MM:SS`)
- Start/Stop button at bottom

**States:**
- Initial: 24:59 (25 minutes)
- Running: Counting down (e.g., 08:24, 00:05)
- Completed: 00:00

---

## 2. Timer Controls

### 2.1 Hover Menu
**Trigger**: Mouse hover over timer area (80×88px region)

**Menu Container:**
- Size: W 68px / H 52px
- Background: #000000 / opacity 80%
- Corner radius: 8px
- Position: Center of circular timer

**Menu Items:**
- **일시정지 (Pause)**: Top item
- **작업중단 (Stop Task)**: Bottom item

**Menu Item Styles:**
- Size: W 68px / H 26px
- Content: Icon (14×14px) + Label
- Icon position: 7.5px from left
- Text position: 23.5px from left
- Text size: 10px
- Text color: #ffffff
- Bottom border: #ffffff / opacity 8% / 1px

**States:**
- `enabled`: No background color
- `hover`: Background color #ffffff / fill 20%

### 2.2 Pause State
**Visual Indicator:**
- Play icon (▶) displayed in center of timer
- Button format: W 47px / H 24px
- Icon: 14×14px at position (6, 5)
- Label: 재개 (Resume)

**Behavior:**
- Timer stops counting
- Play button remains visible (not just on hover)
- Clicking anywhere on timer area resumes countdown
- Pause state persists when switching to tiny window mode

**Functionality:**
- Pause button shown during active timer
- Click to pause timer
- Resume by clicking timer area or play button

---

## 3. Stop Confirmation Modal

### 3.1 Trigger
- Click "작업중단" (Stop Task) menu item during active timer

### 3.2 Modal Container
**Dimensions:**
- Width: 240px
- Height: 108px
- Background: #000000 / opacity 80%
- Position: Centered overlay on timer page

### 3.3 Modal Content
**Header:**
- Text: "진행중인 작업을 중단하실 건가요?" (Do you want to stop the current task?)
- Position: Top center

**Buttons:**
- Container: W 240px / H 48px
- Two buttons side by side (120px each)

**Button 1 - 닫기 (Close):**
- Style: White outline button
- Position: Left
- Border: Right side only - #ffffff / opacity 10% / 1px
- Action: Close modal, return to timer

**Button 2 - 중단하기 (Stop):**
- Style: White outline button
- Position: Right
- **Text: Bold weight** (different from Close button)
- Action: Stop timer and task, return to input page

---

## 4. Component Specifications

### 4.1 Timer Component
**Circular Timer:**
- Size: 64×64px
- Progress indicator (circular)
- Time display: Format `MM:SS`
- Font size: 20px (time display below circle)

### 4.2 Task Name Display
**Container:**
- Size: 292×88px (W×H)
- Position: Left side, with 12px padding
- Text area: 268×64px

**Text Properties:**
- Multiline support
- Text overflow handling
- Left aligned

### 4.3 Bottom Action Button
**Dimensions:**
- Full width: 400px
- Height: 48px
- Matches existing button component

**Separator:**
- Horizontal line above button
- Full width (400px)

---

## 5. Interaction Behaviors

### 5.1 Timer Running
- Countdown starts when start button clicked
- Menu appears on hover over timer area
- Play icon hidden during active countdown
- Time updates every second

### 5.2 Pause Interaction
- Click pause menu item → timer pauses
- Play icon appears in timer center
- Click timer area → resume countdown
- Pause state maintained across window size changes

### 5.3 Stop Interaction
- Click stop menu item → show confirmation modal
- Background dimmed/disabled during modal
- Cancel → return to timer
- Confirm → stop task, navigate to input page

### 5.4 Hover States
- Timer area: Show menu overlay
- Menu items: Background color change (#ffffff 20%)
- Smooth transitions for hover effects

---

## 6. State Management

### Required States
- `timerStatus`: `idle` | `running` | `paused` | `completed`
- `timeRemaining`: number (seconds)
- `taskName`: string
- `showModal`: boolean (stop confirmation)
- `hovering`: boolean (timer hover state)

### Persistence
- Pause state persists across window mode changes
- Timer state saved to prevent loss on app restart

---

## 7. Responsive Behavior

### Window Modes
1. **Full mode**: 400×186px (current design)
2. **Tiny window**: Timer state and pause status maintained

### Transitions
- Smooth transitions between states
- No data loss when switching window modes
- Pause state explicitly preserved

---

## 8. Accessibility

### Keyboard Navigation
- Tab through interactive elements
- Enter/Space to activate buttons
- Escape to close modal

### Visual Feedback
- Clear hover states
- Focus indicators on interactive elements
- High contrast for visibility (dark background with white text)

---

## 9. Technical Notes

### Component Reuse
- Use existing button component from common components
- Use existing topBar component
- Maintain consistent styling with theme system

### Performance
- Timer updates: requestAnimationFrame or setInterval (1000ms)
- Hover detection: optimize for smooth menu display
- Modal: prevent interaction with background when active

### Code Organization
```
src/renderer/src/page/focus/
├── index.tsx                 # Main focus page
├── components/
│   ├── TimerDisplay.tsx      # Circular timer with controls
│   ├── TimerMenu.tsx         # Hover menu (pause/stop)
│   └── StopConfirmModal.tsx  # Stop confirmation dialog
└── hooks/
    ├── useTimer.tsx          # Timer logic hook
    └── useFocusState.tsx     # Focus page state management
```

---

## 10. Design Specifications Summary

### Colors
- Background (modal/menu): #000000 / opacity 80%
- Text: #ffffff
- Borders: #ffffff / opacity 8-10%
- Hover background: #ffffff / fill 20%

### Typography
- Timer time: 20px
- Menu labels: 10px
- Task name: (check theme)
- Modal text: (check theme)

### Spacing
- Container padding: 10-16px
- Menu item padding: 6-7.5px
- Icon size: 14×14px
- Button height: 48px

### Borders & Radius
- Menu corner radius: 8px
- Button corner radius: (use theme)
- Border width: 1px

---

## Implementation Checklist

- [ ] Create TimerDisplay component with circular progress
- [ ] Implement hover menu with pause/stop options
- [ ] Add pause state UI (play button in center)
- [ ] Create stop confirmation modal
- [ ] Implement timer countdown logic
- [ ] Add pause/resume functionality
- [ ] Handle modal show/hide state
- [ ] Integrate with TaskContext for task data
- [ ] Add keyboard shortcuts (if required)
- [ ] Test window mode transitions
- [ ] Verify state persistence
- [ ] Add smooth hover transitions
- [ ] Test with various task name lengths
- [ ] Implement timer completion handling
