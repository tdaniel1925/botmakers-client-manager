# Select All Projects Feature

## Overview
Added the ability to select all projects across all pages, not just the ones on the current page. This follows the Gmail pattern where selecting all items on a page offers to select all items in the folder.

## How It Works

### 1. Select All on Current Page
- Check the "Select all on this page" checkbox
- Selects only the 12 projects visible on the current page
- Shows: "12 projects selected" in the blue banner

### 2. Select All Projects Across All Pages
When all projects on the current page are selected:
- An **amber banner** appears below the blue selection banner
- Banner text: "All 12 projects on this page are selected."
- Button: **"Select all X projects"** (where X is the total project count)
- Clicking the button selects ALL projects across ALL pages

### 3. Visual Indicators

#### Blue Selection Banner (always visible when items selected)
```
[12 projects selected]                    [Clear Selection] [Delete Selected]
```

Or when all selected:
```
[All 98 projects selected]                [Clear Selection] [Delete Selected]
```

#### Amber "Select All" Banner (appears when current page fully selected)
```
All 12 projects on this page are selected.     [Select all 98 projects]
```

#### Checkbox Label Updates
- Default: "Select all on this page"
- When all selected: "All 98 projects selected"

## User Flow

### Flow 1: Select All Across Pages
1. User checks "Select all on this page" checkbox
2. Amber banner appears: "All 12 projects on this page are selected."
3. User clicks "Select all 98 projects" button
4. Blue banner updates: "All 98 projects selected"
5. Checkbox label updates: "All 98 projects selected"
6. User can delete all 98 projects

### Flow 2: Manual Deselection
1. User has selected all 98 projects
2. User manually unchecks one project
3. System exits "select all" mode
4. Shows: "97 projects selected"
5. Amber banner reappears if current page is still fully selected

### Flow 3: Clear Selection
1. User clicks "Clear Selection" button
2. All selections cleared (regardless of mode)
3. Both banners disappear
4. Checkbox unchecked

## Implementation Details

### State Management
```typescript
const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
const [selectAllMode, setSelectAllMode] = useState(false);
```

- `selectedProjects`: Set of selected project IDs
- `selectAllMode`: Boolean flag for "all projects" mode

### Key Functions

#### `selectAllProjects()`
```typescript
const selectAllProjects = () => {
  setSelectedProjects(new Set(projects.map(p => p.id)));
  setSelectAllMode(true);
};
```
Selects ALL project IDs across all pages and sets mode flag.

#### `clearAllSelections()`
```typescript
const clearAllSelections = () => {
  setSelectedProjects(new Set());
  setSelectAllMode(false);
};
```
Clears all selections and resets mode.

#### `toggleProjectSelection()`
```typescript
const toggleProjectSelection = (projectId: string) => {
  const newSelection = new Set(selectedProjects);
  if (newSelection.has(projectId)) {
    newSelection.delete(projectId);
    setSelectAllMode(false); // Exit select all mode
  } else {
    newSelection.add(projectId);
  }
  setSelectedProjects(newSelection);
};
```
Manual deselection exits "select all" mode.

#### `allCurrentPageSelected`
```typescript
const allCurrentPageSelected = currentProjects.length > 0 && 
  currentProjects.every(p => selectedProjects.has(p.id)) &&
  selectedProjects.size === currentProjects.length;
```
Determines when to show the amber "select all" banner.

## UI Components

### Amber Banner (Conditional)
```tsx
{allCurrentPageSelected && !selectAllMode && projects.length > currentProjects.length && (
  <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
    <span className="text-sm text-amber-900">
      All {currentProjects.length} projects on this page are selected.
    </span>
    <Button 
      variant="link" 
      onClick={selectAllProjects}
      className="text-amber-900 underline font-semibold"
    >
      Select all {projects.length} projects
    </Button>
  </div>
)}
```

### Blue Selection Banner (Updated)
```tsx
<span className="text-sm font-medium text-blue-900">
  {selectAllMode ? (
    <>All {projects.length} projects selected</>
  ) : (
    <>{selectedProjects.size} project{selectedProjects.size > 1 ? 's' : ''} selected</>
  )}
</span>
```

### Checkbox Label (Updated)
```tsx
<span className="text-sm text-gray-600">
  {selectAllMode ? `All ${projects.length} projects selected` : 'Select all on this page'}
</span>
```

## Edge Cases Handled

### 1. Single Page (No Amber Banner)
If all projects fit on one page:
- Amber banner does NOT appear
- Only checkbox selection needed

### 2. Manual Deselection in "Select All" Mode
- User unchecks one project
- Exits "select all" mode automatically
- Shows accurate count (e.g., "97 projects selected")

### 3. Page Navigation
- Selected items persist across page navigation
- User can navigate pages and see which projects are selected
- Checkboxes reflect selection state

### 4. Clear Selection
- Clears all selections regardless of mode
- Resets both selection set and mode flag

### 5. Delete Operation
- Works with both partial and full selections
- Confirmation shows correct count
- After deletion, selections are cleared

## Visual Design

### Color Scheme
- **Blue Banner** (Selection): `bg-blue-50 border-blue-200 text-blue-900`
- **Amber Banner** (Select All Prompt): `bg-amber-50 border-amber-200 text-amber-900`

### Placement
1. Blue selection banner (top)
2. Amber "select all" banner (below blue)
3. Checkbox with label (below banners)
4. Project list

## Benefits

✅ **Efficient Bulk Operations** - Delete 100+ projects at once  
✅ **Clear Visual Feedback** - Users know exactly what's selected  
✅ **Flexible Selection** - Choose between page or all  
✅ **Intuitive UX** - Follows Gmail's familiar pattern  
✅ **Safe Operations** - Clear confirmation dialogs  

## Testing Checklist

- [ ] Select all on page (12 items) - shows blue banner with "12 projects selected"
- [ ] Amber banner appears when page fully selected
- [ ] Click "Select all X projects" - blue banner updates to "All X projects selected"
- [ ] Checkbox label updates to "All X projects selected"
- [ ] Manually deselect one project - exits select all mode
- [ ] Clear Selection button - clears everything
- [ ] Delete selected projects - confirmation shows correct count
- [ ] Navigate between pages - selections persist
- [ ] Single page scenario - no amber banner appears
- [ ] All selected + delete all - works correctly

## Future Enhancements

Potential improvements:
- [ ] Keyboard shortcuts (Ctrl+A to select all)
- [ ] "Invert Selection" option
- [ ] "Select by status" (e.g., all active projects)
- [ ] "Select by organization" filter
- [ ] Export selected projects
- [ ] Bulk status change for selected projects

