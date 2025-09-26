# Library Feature Components

The Library feature provides comprehensive book and reading list management functionality. It follows a modular architecture with clear separation of concerns between presentation, state management, and data access.

## Architecture Overview

```
LibraryFeature (Main Orchestrator)
├── LibrarySidebar (Reading Lists & Navigation)
│   ├── SearchInput
│   └── ReadingListItem
├── LibraryHeader (Filters & Controls)
│   ├── ViewModeToggle
│   └── FilterControls
└── LibraryMainContent (Book Display)
    ├── BookGrid
    ├── BookList
    ├── VirtualBookGrid (for large collections)
    └── VirtualBookList (for large collections)
```

## Components

### LibraryFeature

Main orchestrator component that manages overall library state and coordinates between child components.

**Props:**

- `searchParams?: { [key: string]: string | string[] | undefined }` - URL search parameters for state initialization

**Features:**

- Reading list management
- Book filtering and searching
- View mode switching (grid/list)
- Keyboard navigation
- Error boundaries and loading states

### LibrarySidebar

Displays reading lists and provides navigation between them.

**Props:**

- `readingLists: ReadingList[]` - Array of reading lists
- `selectedList: string` - Currently selected list ID
- `onListSelect: (listId: string) => void` - List selection handler

**Features:**

- Reading list display with icons and counts
- Search functionality
- Responsive collapse on mobile
- Keyboard navigation support

### LibraryHeader

Contains view controls, filters, and search functionality.

**Props:**

- `viewMode: ViewMode` - Current view mode (grid/list)
- `onViewModeChange: (mode: ViewMode) => void` - View mode change handler
- `filters: LibraryFilters` - Current filter state
- `onFiltersChange: (filters: Partial<LibraryFilters>) => void` - Filter change handler

**Features:**

- View mode toggle
- Search input with debouncing
- Genre and status filters
- Sort options

### BookGrid / BookList

Display books in grid or list format respectively.

**Props:**

- `books: Book[]` - Array of books to display
- `onBookSelect?: (book: Book) => void` - Book selection handler
- `selectedBooks?: string[]` - Array of selected book IDs
- `isLoading?: boolean` - Loading state

**Features:**

- Responsive layouts
- Book selection
- Loading skeletons
- Virtualization support for large collections

## State Management

The library feature uses a layered state management approach:

### useLibraryState

Main state hook that orchestrates all library-related state.

**Returns:**

- `selectedList: string` - Currently selected reading list
- `viewMode: ViewMode` - Current view mode
- `searchQuery: string` - Current search query
- `filteredBooks: Book[]` - Filtered and sorted books
- `actions: LibraryActions` - Action functions for state updates

### useLibraryFilters

Manages filtering and search state with debouncing.

### useLibraryActions

Provides action functions for book and reading list operations.

### useLibraryPreferences

Handles user preferences persistence (view mode, selected list, etc.).

## Data Flow

1. **LibraryFeature** initializes state from URL parameters
2. **useLibraryState** coordinates between different state hooks
3. **Data hooks** (useReadingLists, useBooks) fetch data from services
4. **State changes** flow down to child components via props
5. **User actions** flow up via callback props

## Keyboard Navigation

The library feature supports comprehensive keyboard navigation:

- `Ctrl/Cmd + K`: Focus search input
- `G`: Toggle between grid and list view
- `?`: Show keyboard shortcuts help
- `Escape`: Clear search or close modals
- `Arrow keys`: Navigate between books
- `Enter`: Select/open book
- `Space`: Toggle book selection

## Error Handling

Each component level has appropriate error boundaries:

- **Feature level**: LibraryErrorFallback for critical errors
- **Component level**: Individual error states for non-critical failures
- **Data level**: Error states in data fetching hooks

## Performance Optimizations

- **Memoization**: Components use React.memo and useMemo appropriately
- **Virtualization**: Large book collections use virtual scrolling
- **Debouncing**: Search input is debounced to reduce API calls
- **Lazy loading**: Images are loaded lazily with Next.js Image component

## Testing

Components are designed for testability:

- **Pure functions**: Business logic extracted to testable utilities
- **Dependency injection**: Services injected via hooks
- **Test utilities**: Mock providers and data available
- **Accessibility**: ARIA labels and semantic HTML for screen readers

## Usage Examples

### Basic Library Display

```tsx
import { LibraryFeature } from "@/components/library";

export default function LibraryPage() {
  return <LibraryFeature />;
}
```

### With URL Parameters

```tsx
import { LibraryFeature } from "@/components/library";

export default function LibraryPage({ searchParams }) {
  return <LibraryFeature searchParams={searchParams} />;
}
```

### Custom Error Handling

```tsx
import { LibraryFeature } from "@/components/library";
import { ErrorBoundary } from "@/components/common";

export default function LibraryPage() {
  return (
    <ErrorBoundary
      fallback={CustomLibraryErrorFallback}
      onError={(error, errorInfo) => {
        // Custom error reporting
        console.error("Library error:", error, errorInfo);
      }}
    >
      <LibraryFeature />
    </ErrorBoundary>
  );
}
```

## Accessibility

The library feature follows WCAG 2.1 AA guidelines:

- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA labels**: Descriptive labels for interactive elements
- **Keyboard navigation**: Full keyboard accessibility
- **Screen reader support**: Proper announcements for state changes
- **Color contrast**: Sufficient contrast ratios for all text
- **Focus management**: Visible focus indicators and logical tab order

## Browser Support

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Accessibility tools**: Compatible with screen readers and keyboard navigation
