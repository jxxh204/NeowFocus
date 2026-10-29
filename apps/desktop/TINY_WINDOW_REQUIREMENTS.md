# Tiny Window Requirements

## Overview

This document outlines the requirements for the tiny window mode (작은 창) based on the Figma design specifications. The tiny window is a minimized, compact version of the focus page designed for minimal screen space usage while maintaining timer functionality.

---

## 1. Window Specifications

### 1.1 Dimensions

**Size:**

- Width: 322px (including 1px border)
- Height: 38px (including 1px border)
- Content area: 320px × 36px

**Border:**

- Width: 1px
- Color: (use existing theme)

### 1.2 Window Properties

**Behavior:**

- Always-on-top (floating)
- Frameless window (no title bar)
- Draggable from entire window area
- Transparent/semi-transparent background (maintains existing style)

**Color/Opacity:**

- No color or opacity changes from default focus page
- Maintains existing theme styling

---

## 2. Layout Structure

### 2.1 Component Layout (Left to Right)

```
┌──────────────────────────────────┐
│ Task Name (260px) │ Timer │ Menu │
│                   │ (36px)│(24px)│
└──────────────────────────────────┘
```

**Breakdown:**

1. **Task Name Area**: 260px × 36px (left)
2. **Timer Display**: 36px × 36px (center-right)
3. **Menu Button**: 24px × 36px (right edge)

---

## 3. Task Name Display

### 3.1 Container

**Dimensions:**

- Width: 260px
- Height: 36px
- Padding: 12px (left/right)
- Text area: 236px

### 3.2 Text Behavior

#### Long Text (Exceeds 236px width)

**Behavior**: Text truncation with ellipsis

```
Example:
Full text: "밤잠자고충분히공부만집중이상없으면..."
Display:   "밤잠자고충분히공부만집중이상없으..."
```

**CSS Properties:**

```css
{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

#### Short Text (Within 236px width)

**Behavior**: Center-aligned

```
Example:
Text: "sample text"
Display:  "    sample text    " (centered)
```

**CSS Properties:**

```css
{
  text-align: center;
}
```

### 3.3 Typography

- Font size: 20px (based on existing design)
- Color: #ffffff (or theme text color)
- Single line only (no wrapping)

---

## 4. Timer Display

### 4.1 Container

**Dimensions:**

- Width: 36px
- Height: 36px
- Position: Right of task name

### 4.2 Timer Icon

**Circular Timer:**

- Size: 24×24px
- Position: Centered (6px margin on all sides)
- Shows timer progress (circular progress indicator)

**States:**

- **Running**: Active timer with progress
- **Paused**: Grayed out timer
- **Completed**: Paw icon animation (from completion requirements)

### 4.3 Visual States

#### Running State

- Color: Theme accent color (default timer color)
- Animated progress ring

#### Paused State

- Color: `#8C8C8C` (gray)
- Static display
- No animation

---

## 5. Click Interactions

### 5.1 Timer Area Click

**Clickable Area:**

- Task name (260px) + Timer (36px) = 296px total
- Height: Full 36px

**Action:**

- Single click → Expand to default focus page (400×186px)
- Returns to full-size view with all controls

**Behavior:**

```
Tiny window (320×36px)
  ↓ [Click timer area]
Default focus page (400×186px)
```

### 5.2 Entire Window Drag

**Draggable Area:**

- Entire window area (322×38px)

**Behavior:**

- Click and drag anywhere → Move window
- No title bar needed
- Smooth repositioning
- Window position persists

---

## 6. Window State Management

### 6.1 Transition to Tiny Window

**Triggers:**

- User clicks minimize/shrink button (from default page)
- User selects "작은 창" option from menu

**Animation:**

- Smooth size transition from 400×186px to 322×38px
- Duration: 200-300ms
- Easing: ease-out

### 6.2 Transition to Default Page

**Triggers:**

- User clicks timer area in tiny window
- Timer completes (auto-expand)

**Animation:**

- Smooth size transition from 322×38px to 400×186px
- Duration: 200-300ms
- Easing: ease-out

### 6.3 State Persistence

**Preserved States:**

- Timer countdown value
- Pause state (if paused)
- Task name
- Window position
- Session count (if applicable)

---

## 7. Timer Pause State

### 7.1 Visual Indicator

**Timer Icon:**

- Color changes to `#8C8C8C` (gray)
- Static (no animation)
- Play icon may be shown (smaller scale)

### 7.2 Behavior

**Click Action:**

- Click timer area → Resume timer AND expand to default page

**Note:**

- Unlike default page, tiny window doesn't have hover menu
- Only action is to expand to default page
- Resume happens automatically upon expansion

---

## 8. Menu Button (Right Edge)

### 8.1 Specifications

**Dimensions:**

- Width: 24px
- Height: 36px
- Position: Right edge

**Icon:**

- Three-dot menu (⋮) or hamburger (☰)
- Size: 14×14px (centered)

### 8.2 Menu Actions

**Options:**

- Expand to default view
- (Other options as needed)

**Note:** Design shows menu button but specific menu items not fully specified. Likely minimal options compared to default page.

---

## 9. Design Specifications

### 9.1 Colors

**Task Name Text:**

- Default: #ffffff (or theme text color)
- Opacity: Same as default page

**Timer (Running):**

- Active color: Theme accent (e.g., #00FF85)

**Timer (Paused):**

- Inactive color: #8C8C8C

**Background:**

- Maintains theme background with transparency
- No changes from default page styling

### 9.2 Spacing

**Horizontal Layout:**

- Task name: 260px (with 12px padding = 236px text area)
- Timer: 36px
- Menu: 24px
- Total: 320px (+ 2px border = 322px)

**Vertical:**

- Height: 36px (+ 2px border = 38px)
- Consistent padding for vertical centering

### 9.3 Border

- Width: 1px all sides
- Color: Theme border color
- Radius: (match existing design)

---

## 10. Responsive Behavior

### 10.1 Text Adaptation

**Auto-adjust based on content length:**

| Text Length | Behavior                   |
| ----------- | -------------------------- |
| < 236px     | Center-aligned             |
| > 236px     | Left-aligned with ellipsis |

### 10.2 Window Positioning

**Initial Position:**

- Remember last position from default page
- Default: Top-right corner of screen

**Constraints:**

- Keep window within screen bounds
- Don't allow off-screen positioning

---

## 11. Integration with Focus Page

### 11.1 Shared State

**TaskContext Properties:**

```typescript
interface TaskState {
  taskName: string
  duration: number
  timeRemaining: number
  status: 'idle' | 'running' | 'paused' | 'completed'
  windowMode: 'default' | 'tiny' // NEW
  sessionCount: number
}
```

### 11.2 Window Mode Toggle

**IPC Communication:**

```typescript
// Main process
ipcMain.handle('window:resize', (event, mode: 'default' | 'tiny') => {
  const window = BrowserWindow.fromWebContents(event.sender)
  if (mode === 'tiny') {
    window.setSize(322, 38)
  } else {
    window.setSize(400, 186)
  }
})
```

---

## 12. Technical Implementation

### 12.1 Component Structure

```
src/renderer/src/page/tinyWindow/
├── index.tsx                # Main tiny window page
├── components/
│   ├── TinyTaskName.tsx     # Task name with text logic
│   ├── TinyTimer.tsx        # Compact timer display
│   └── TinyMenu.tsx         # Menu button
└── hooks/
    └── useTinyWindow.tsx    # Tiny window specific logic
```

### 12.2 Route

**Path**: `/tiny_window` (based on existing router setup)

**Navigation:**

- From default focus page: Switch route + resize window
- To default focus page: Switch route + resize window

### 12.3 Text Truncation Logic

```typescript
const TinyTaskName = ({ taskName }: { taskName: string }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      const isOverflow = textRef.current.scrollWidth > textRef.current.clientWidth;
      setIsTruncated(isOverflow);
    }
  }, [taskName]);

  return (
    <TaskNameContainer>
      <TaskNameText
        ref={textRef}
        $centered={!isTruncated}
      >
        {taskName}
      </TaskNameText>
    </TaskNameContainer>
  );
};

const TaskNameText = styled.div<{ $centered: boolean }>`
  width: 236px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: ${props => props.$centered ? 'center' : 'left'};
`;
```

### 12.4 Window Resize Handler

```typescript
const handleExpandToDefault = async () => {
  // IPC call to resize window
  await window.electron.ipcRenderer.invoke('window:resize', 'default')

  // Navigate to default focus page
  navigate('/focus')
}
```

---

## 13. User Experience

### 13.1 Advantages of Tiny Window

- **Minimal screen space**: Only 322×38px
- **Always visible**: Floating on top
- **Quick glance**: See task name and timer at a glance
- **Easy access**: Click to expand for full controls

### 13.2 Limitations

- **No hover menu**: Must expand to access pause/stop
- **Limited info**: Only task name and timer visible
- **No buttons**: Single click action only

### 13.3 Use Cases

- **Multitasking**: Work in other apps while timer runs
- **Screen real estate**: Maximize workspace
- **Focus mode**: Minimal distraction interface
- **Quick monitoring**: Glance at remaining time

---

## 14. Accessibility

### 14.1 Keyboard Support

- `Click` or `Enter`: Expand to default page
- `Esc`: (Optional) Return to input page or close
- `Drag`: Move window with mouse

### 14.2 Visual Feedback

- Hover state on timer area (subtle highlight)
- Cursor changes to pointer over clickable area
- Smooth animations for state changes

---

## 15. Testing Checklist

- [ ] Window resizes to 322×38px correctly
- [ ] Task name truncates with ellipsis for long text
- [ ] Task name centers for short text
- [ ] Timer displays correctly (24×24px)
- [ ] Timer shows running state with correct color
- [ ] Timer shows paused state (#8C8C8C)
- [ ] Click on timer area expands to default page
- [ ] Window is draggable from entire area
- [ ] Window position persists after drag
- [ ] Timer state preserved during window mode switch
- [ ] Smooth transition animation (tiny ↔ default)
- [ ] Window stays within screen bounds
- [ ] Auto-expand on timer completion
- [ ] Menu button visible and functional
- [ ] No performance issues with timer updates

---

## 16. Edge Cases

### 16.1 Very Long Task Names

**Scenario**: Task name is 200+ characters
**Expected**: Truncate with ellipsis at 236px, left-aligned

### 16.2 Empty Task Name

**Scenario**: No task name provided
**Expected**: Show placeholder or default text

### 16.3 Window Off-Screen

**Scenario**: User moves window then changes screen resolution
**Expected**: Reposition window to visible area on next launch

### 16.4 Multiple Rapid Clicks

**Scenario**: User rapidly clicks timer area
**Expected**: Debounce clicks, expand once

### 16.5 Window Dragging During Timer Update

**Scenario**: User drags window while timer ticks
**Expected**: Smooth dragging, no jank or lag

---

## 17. Implementation Priority

1. **High Priority**:
   - Basic tiny window layout (260px text + 36px timer + 24px menu)
   - Window resize functionality
   - Text truncation/centering logic
   - Click to expand behavior
   - Drag to move functionality

2. **Medium Priority**:
   - Smooth transition animations
   - Pause state visual indicator (#8C8C8C)
   - Window position persistence
   - Timer state synchronization

3. **Low Priority**:
   - Menu button functionality
   - Advanced hover effects
   - Keyboard shortcuts
   - Accessibility enhancements

---

## 18. Notes

### Design Intent

The tiny window mode is designed to:

- Provide a distraction-free timer view
- Minimize screen space usage
- Maintain essential functionality
- Enable quick access to full controls

### Technical Considerations

- Route-based view switching (`/tiny_window`)
- IPC communication for window resize
- Shared state via TaskContext
- CSS-based text truncation (no JS measurement needed for basic case)

### Future Enhancements

- Customizable tiny window size
- Additional quick actions in menu
- Mini pause/resume button (without expanding)
- Opacity/transparency settings
