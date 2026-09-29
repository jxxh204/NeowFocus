# Timer Completion Requirements

## Overview
This document outlines the requirements for the timer completion state and related functionality based on the Figma design specifications.

---

## 1. Timer Completion States

### 1.1 Default Page - Timer Completion
**Window Mode**: Full focus page (400×186px)
**Trigger**: Timer countdown reaches 00:00

**Visual Changes:**
- Timer display switches from countdown to completion indicator
- Shows paw icon in circular timer area
- Displays session count below timer: `N회차` (N sessions)
  - Format: Korean text "회차" with number prefix
  - Example: `1회차`, `25회차`, `999회차`
  - Max display: `999+회차` (for sessions > 999)

### 1.2 Tiny Window - Timer Completion
**Window Mode**: Minimized (320×36px)
**Behavior**: Automatically expands to default page size (400×186px) when timer completes

**Transition Flow:**
```
Tiny window (timer running)
→ Timer reaches 00:00
→ Auto-expand to default page size
→ Show completion state
```

### 1.3 Minimized/Hidden State - Timer Completion
**Window States**:
- Application minimized to dock
- Application hidden (⌘H)

**Behavior**:
- Window pops up at last known position
- Shows completion state immediately
- Brings window to front automatically

---

## 2. Timer Completion Indicator

### 2.1 Paw Icon Animation
**Visual Design:**
- Location: Center of circular timer (64×64px)
- Icon: Paw icon (28×28px)
- Background: Circular fill

**Animation:**
- **Type**: Blinking/flashing
- **Colors**: Alternating between two colors
  - Color 1: `#00FF85` (bright green)
  - Color 2: `#1FAA67` (darker green)
- **Timing**:
  - Duration: 300ms per color
  - Delay: 300ms between transitions
  - Loop: Infinite until user action

**Implementation Notes:**
```typescript
// Animation cycle
Color #00FF85 (300ms) → Color #1FAA67 (300ms) → repeat
```

### 2.2 Session Counter
**Display Format:**
- Position: Below circular timer
- Text: `{N}회차` where N is session count
- Font size: 20px (same as timer countdown)

**Counter Logic:**
- Starts at `1회차` for first completion
- Increments with each "타이머 한번 더" (Repeat Timer)
- Maximum: `999회차`
- Overflow: Display `999+회차` for counts > 999

**Persistence:**
- Counter tied to current task
- Resets when new task created
- Maintains count when repeating same task

---

## 3. Completion Action Buttons

### 3.1 Button Layout
**Container:**
- Full width: 400px
- Height: 48px
- Two buttons side by side (200px each)

### 3.2 Button 1 - 새 작업 (New Task)
**Properties:**
- Width: 200px
- Position: Left side
- Label: "새 작업" (New Task)
- Icon: (16×16px) positioned after text

**Functionality:**
- Navigate to input page (`/`)
- Clear current task data
- Reset session counter
- Clear timer state

### 3.3 Button 2 - 타이머 한번 더 (Repeat Timer)
**Properties:**
- Width: 200px
- Position: Right side
- Label: "타이머 한번 더" (One More Timer)
- Icon: (16×16px) positioned after text

**Functionality:**
- Keep current task name and duration
- Increment session counter
- Restart timer from initial duration
- Continue tracking under same task

---

## 4. Session Counter Management

### 4.1 Counter Increment Logic
**Trigger**: Click "타이머 한번 더" button

**Flow:**
```
First completion: 1회차
After 1st repeat: 2회차
After 2nd repeat: 3회차
...
After 998th repeat: 999회차
After 999th repeat: 999+회차 (no further increment displayed)
```

### 4.2 Counter Display Rules
| Session Count | Display |
|---------------|---------|
| 1 | 1회차 |
| 25 | 25회차 |
| 999 | 999회차 |
| 1000+ | 999+회차 |

### 4.3 Counter Reset Conditions
- User clicks "새 작업" (New Task)
- User creates new task from input page
- Application completely restarts (if not persisted)

### 4.4 Counter Persistence
**Storage:**
- Save session count to localStorage with task
- Key format: `task_{taskId}_sessionCount`
- Restore on app restart if task continues

---

## 5. Window Behavior on Completion

### 5.1 From Default Page
**Current State**: Focus page visible (400×186px)
**On Completion**:
1. Stop countdown at 00:00
2. Switch to completion UI
3. Start paw icon animation
4. Display session count
5. Show action buttons
6. Keep window at current position

### 5.2 From Tiny Window
**Current State**: Minimized window (320×36px)
**On Completion**:
1. Stop countdown at 00:00
2. **Animate window size to 400×186px**
3. Transition to completion UI
4. Start paw icon animation
5. Display session count
6. Show action buttons

**Animation:**
- Duration: 200-300ms smooth transition
- Easing: ease-out
- Maintain window center position during resize

### 5.3 From Minimized/Hidden State
**Current State**: Window minimized to dock or hidden
**On Completion**:
1. Restore window to last known position
2. Bring window to foreground
3. Show completion state
4. Start paw icon animation
5. Play notification sound (optional)

**Platform Behavior:**
- macOS: Use app.show() and window.focus()
- Respect system notification settings
- No interruption if Do Not Disturb enabled

---

## 6. Integration with Existing Features

### 6.1 Task Context Updates
```typescript
interface TaskState {
  taskName: string;
  duration: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
  sessionCount: number; // NEW
  completedAt?: Date;   // NEW
}
```

### 6.2 Window Management
- Main process handles window state changes
- IPC communication for completion events
- Coordinate with tray icon state updates

### 6.3 localStorage Schema
```typescript
interface StoredTask {
  name: string;
  duration: number;
  sessionCount: number;
  lastCompleted: string; // ISO date
}
```

---

## 7. Design Specifications

### 7.1 Timer Completion Indicator
**Circular Timer:**
- Size: 64×64px
- Background: Animated fill (alternating colors)
- Icon: Paw (28×28px) centered

**Colors:**
- Active color 1: `#00FF85`
- Active color 2: `#1FAA67`
- Text color: `#ffffff` (session count)

**Animation Timing:**
- Transition duration: 300ms
- Delay between colors: 300ms
- Easing: linear

### 7.2 Session Counter
**Typography:**
- Font size: 20px
- Color: `#ffffff`
- Format: `{number}회차`
- Position: Below timer (centered)

### 7.3 Action Buttons
**Layout:**
- Two buttons: 200px each
- Height: 48px
- Separator line above (full width)

**Button Styles:**
- Background: (use theme button style)
- Text: Icon + Label
- Icon size: 16×16px
- Text size: 14px

---

## 8. User Experience Considerations

### 8.1 Notifications
**On Completion:**
- Visual: Paw icon animation
- Audio: Optional completion sound
- System notification: "작업 완료!" (Task Complete!)

### 8.2 Window Focus
**Attention Grabbing:**
- Restore minimized window
- Bounce dock icon (macOS)
- Flash taskbar (Windows)
- Respect Do Not Disturb mode

### 8.3 Quick Actions
**Keyboard Shortcuts (Optional):**
- `Enter` or `Space`: Repeat timer (타이머 한번 더)
- `N`: New task (새 작업)
- `Escape`: Dismiss/minimize window

---

## 9. Technical Implementation

### 9.1 Component Structure
```
src/renderer/src/page/focus/
├── components/
│   ├── TimerCompletion.tsx    # NEW: Completion state UI
│   ├── PawAnimation.tsx        # NEW: Animated paw icon
│   ├── SessionCounter.tsx      # NEW: Session count display
│   └── CompletionActions.tsx   # NEW: Action buttons
└── hooks/
    ├── useSessionCounter.tsx   # NEW: Session count logic
    └── useTimerCompletion.tsx  # NEW: Completion handling
```

### 9.2 Main Process Handlers
```typescript
// src/main/handlers/windowHandler.ts
export function handleTimerCompletion() {
  // Restore window if minimized/hidden
  // Resize if in tiny mode
  // Focus window
  // Send completion event to renderer
}
```

### 9.3 State Management
```typescript
// TaskContext additions
const [sessionCount, setSessionCount] = useState(1);

const incrementSession = () => {
  setSessionCount(prev => Math.min(prev + 1, 1000)); // Cap at 999+
};

const resetSession = () => {
  setSessionCount(1);
};
```

### 9.4 Animation Implementation
```typescript
// Paw icon blinking animation
const PawAnimation = () => {
  const [colorIndex, setColorIndex] = useState(0);
  const colors = ['#00FF85', '#1FAA67'];

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex(prev => (prev + 1) % 2);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <PawIcon
      color={colors[colorIndex]}
      style={{ transition: 'color 300ms linear' }}
    />
  );
};
```

---

## 10. Testing Checklist

- [ ] Timer completes and shows completion state
- [ ] Paw icon animates with correct colors and timing
- [ ] Session counter displays correctly (1회차, 2회차, etc.)
- [ ] Session counter caps at 999+회차
- [ ] "새 작업" button navigates to input page
- [ ] "타이머 한번 더" restarts timer with count increment
- [ ] Tiny window expands to default size on completion
- [ ] Minimized window pops up on completion
- [ ] Hidden window restores on completion
- [ ] Session count persists across app restarts
- [ ] Session count resets on new task creation
- [ ] Window animations are smooth (tiny → default)
- [ ] Completion state visible from all window states
- [ ] No timer runs after completion until action taken
- [ ] Keyboard shortcuts work (if implemented)

---

## 11. Edge Cases

### 11.1 Multiple Rapid Completions
**Scenario**: User quickly clicks "타이머 한번 더" multiple times
**Expected**: Each click increments counter properly

### 11.2 Very High Session Counts
**Scenario**: Session count exceeds 999
**Expected**: Display shows "999+회차" and stops incrementing display

### 11.3 Window States
**Scenario**: Timer completes while window is hidden
**Expected**: Window restores to last position, not screen center

### 11.4 System Notifications Disabled
**Scenario**: User has notifications disabled
**Expected**: Visual completion state still works, no errors

### 11.5 App Restart During Completion State
**Scenario**: User force-quits app while viewing completion state
**Expected**: On restart, task shows as completed with correct session count

---

## Implementation Priority

1. **High Priority**:
   - Timer completion detection
   - Paw icon animation
   - Session counter display and increment
   - Action buttons functionality
   - Window resize from tiny mode

2. **Medium Priority**:
   - Session counter persistence
   - Window restoration from minimized/hidden
   - Smooth animations and transitions
   - System notifications

3. **Low Priority**:
   - Keyboard shortcuts
   - Advanced notification settings
   - Audio completion sound
