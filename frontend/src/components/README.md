# Components Directory

This directory contains all React components organized by feature and purpose. The architecture follows a modular approach with clear separation of concerns and reusable patterns.

## 🏗️ Architecture Overview

This components directory follows the **app/src separation pattern** where:
- **`app/`** directory contains only routing and page components
- **`src/`** directory contains all business logic, components, hooks, and services
- Components are organized semantically by domain and feature
- Strict import boundaries prevent circular dependencies

## Directory Structure

```
src/components/
├── auth/              # Authentication components
├── book/              # Book-related components
├── chat/              # Chat and AI assistant components
├── common/            # Shared utility components
├── dashboard/         # Dashboard feature components
├── discover/          # Book discovery components
├── groups/            # Reading groups components
├── layout/            # Layout and navigation components
├── library/           # Library management components
├── settings/          # Settings page components
└── ui/                # Base UI components (design system)
```

## 🔄 Recent Refactoring Changes

### Component Consolidation
- **BookCard**: Consolidated multiple variants into a single, configurable component with sub-components
- **LoadingStates**: Broke down large component into focused sub-components (SidebarSkeleton, ContentSkeleton, PageSkeleton)
- **ErrorFallbacks**: Standardized error handling across all features

### Performance Optimizations
- Added `React.memo` to all components to prevent unnecessary re-renders
- Integrated `OptimizedImage` component for better image performance
- Implemented virtual scrolling for large lists
- Added proper `useCallback` and `useMemo` hooks

### Type Safety Improvements
- Fixed all TypeScript compilation errors
- Standardized prop interfaces with descriptive names
- Resolved import path issues and type conflicts
- Added comprehensive type exports

## Component Categories

### Feature Components

Feature components are organized by application domain and contain business logic specific to that feature.

- **auth/**: Login, registration, and authentication flows
- **book/**: Book details, reviews, and book-specific interactions
- **chat/**: AI assistant interface and chat functionality
- **dashboard/**: Overview, statistics, and personalized content
- **discover/**: Book discovery, recommendations, and browsing
- **groups/**: Reading groups, discussions, and social features
- **library/**: Personal library management and organization
- **settings/**: User preferences and application settings

### Layout Components

Components that define the overall application structure and navigation.

- **layout/**: Navigation, headers, footers, and page layouts

### Shared Components

Reusable components used across multiple features.

- **common/**: Error boundaries, loading states, accessibility helpers
- **ui/**: Base design system components (buttons, cards, inputs, etc.)

## Component Architecture

### Component Types

#### 1. Feature Components

Main orchestrator components that manage feature-level state and coordinate child components.

```tsx
// Example: LibraryFeature
export function LibraryFeature({ searchParams }: LibraryFeatureProps) {
  const state = useLibraryState(searchParams);

  return (
    <ErrorBoundary fallback={LibraryErrorFallback}>
      <LibrarySidebar {...sidebarProps} />
      <LibraryMainContent {...contentProps} />
    </ErrorBoundary>
  );
}
```

#### 2. Container Components

Components that manage local state and data fetching for a specific UI section.

```tsx
// Example: BookGrid
export function BookGrid({ books, onBookSelect }: BookGridProps) {
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onSelect={onBookSelect} />
      ))}
    </div>
  );
}
```

#### 3. Presentation Components

Pure components that receive data via props and focus solely on rendering.

```tsx
// Example: BookCard
export function BookCard({ book, onSelect }: BookCardProps) {
  return (
    <Card onClick={() => onSelect?.(book)}>
      <img src={book.cover} alt={book.title} />
      <h3>{book.title}</h3>
      <p>{book.author}</p>
    </Card>
  );
}
```

### Component Patterns

#### Error Boundaries

All feature components are wrapped with error boundaries for graceful error handling.

```tsx
<ErrorBoundary
  fallback={FeatureErrorFallback}
  onError={(error, errorInfo) => logError(error, errorInfo)}
  level="feature"
>
  <FeatureComponent />
</ErrorBoundary>
```

#### Loading States

Components handle loading states with skeleton components and suspense boundaries.

```tsx
<Suspense fallback={<FeatureLoadingSkeleton />}>
  <FeatureComponent />
</Suspense>
```

#### Accessibility

All components follow WCAG 2.1 AA guidelines with proper ARIA labels, keyboard navigation, and semantic HTML.

```tsx
<button
  aria-label="Add book to reading list"
  onClick={handleAddBook}
  onKeyDown={handleKeyDown}
>
  <Plus aria-hidden="true" />
  Add Book
</button>
```

## State Management

### Component State Hierarchy

1. **Global State**: User authentication, theme, global preferences
2. **Feature State**: Feature-specific data and UI state
3. **Component State**: Local UI state and temporary data

### State Management Patterns

#### Custom Hooks

Feature-specific state is managed through custom hooks that encapsulate business logic.

```tsx
// useLibraryState - manages all library-related state
const { selectedList, viewMode, filteredBooks, actions } =
  useLibraryState(searchParams);
```

#### Context Providers

Global state is provided through React Context with optimized re-render behavior.

```tsx
<AppProvider>
  <ThemeProvider>
    <Application />
  </ThemeProvider>
</AppProvider>
```

## Styling and Theming

### Tailwind CSS

Components use Tailwind CSS for styling with consistent design tokens.

```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
  {/* Component content */}
</div>
```

### CSS Custom Properties

Theme-aware components use CSS custom properties for dynamic theming.

```css
.button-primary {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
}
```

### Responsive Design

Components are built mobile-first with responsive breakpoints.

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Responsive grid */}
</div>
```

## Performance Optimization

### Memoization

Components use React.memo, useMemo, and useCallback to prevent unnecessary re-renders.

```tsx
const BookCard = memo(function BookCard({ book, onSelect }: BookCardProps) {
  const handleSelect = useCallback(() => {
    onSelect?.(book);
  }, [book, onSelect]);

  return <Card onClick={handleSelect}>{/* Component content */}</Card>;
});
```

### Code Splitting

Large components are lazy-loaded to reduce initial bundle size.

```tsx
const LibraryFeature = lazy(() => import("./LibraryFeature"));

function LibraryPage() {
  return (
    <Suspense fallback={<LibraryLoadingSkeleton />}>
      <LibraryFeature />
    </Suspense>
  );
}
```

### Virtual Scrolling

Large lists use virtual scrolling for optimal performance.

```tsx
<VirtualBookList books={books} itemHeight={120} overscan={5} />
```

## Testing Strategy

### Component Testing

Each component has corresponding test files with comprehensive coverage.

```tsx
// BookCard.test.tsx
describe("BookCard", () => {
  it("renders book information correctly", () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText(mockBook.title)).toBeInTheDocument();
  });

  it("calls onSelect when clicked", async () => {
    const onSelect = jest.fn();
    const { user } = render(<BookCard book={mockBook} onSelect={onSelect} />);

    await user.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(mockBook);
  });
});
```

### Integration Testing

Feature components have integration tests that verify component interactions.

```tsx
// LibraryFeature.test.tsx
describe("LibraryFeature", () => {
  it("filters books when search query changes", async () => {
    const { user } = renderWithProviders(<LibraryFeature />);

    await user.type(screen.getByPlaceholderText("Search books"), "fiction");

    await waitFor(() => {
      expect(screen.getByText("Fiction Book")).toBeInTheDocument();
      expect(screen.queryByText("Non-Fiction Book")).not.toBeInTheDocument();
    });
  });
});
```

### Accessibility Testing

Components are tested for accessibility compliance using jest-axe.

```tsx
test("has no accessibility violations", async () => {
  const { container } = render(<BookCard book={mockBook} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Documentation Standards

### JSDoc Comments

All components have comprehensive JSDoc documentation with examples.

````tsx
/**
 * BookCard Component
 *
 * Displays book information in a card format with optional actions.
 *
 * @example
 * ```tsx
 * <BookCard
 *   book={book}
 *   onSelect={(book) => navigate(`/book/${book.id}`)}
 *   showProgress
 * />
 * ```
 *
 * @param book - Book data to display
 * @param onSelect - Callback when card is selected
 * @param showProgress - Whether to show reading progress
 */
````

### README Files

Each feature directory contains a README with architecture overview, usage examples, and API documentation.

### Type Definitions

All components have comprehensive TypeScript interfaces with JSDoc comments.

```tsx
interface BookCardProps {
  /** Book data to display */
  book: Book;
  /** Callback when card is selected */
  onSelect?: (book: Book) => void;
  /** Whether to show reading progress */
  showProgress?: boolean;
  /** Additional CSS classes */
  className?: string;
}
```

## Best Practices

### Component Design

- Keep components focused on a single responsibility
- Use composition over inheritance
- Prefer props over context for component communication
- Make components testable by avoiding tight coupling

### Performance

- Use React.memo for expensive components
- Implement proper key props for lists
- Avoid creating objects/functions in render
- Use lazy loading for large components

### Accessibility

- Use semantic HTML elements
- Provide proper ARIA labels and descriptions
- Ensure keyboard navigation works correctly
- Test with screen readers

### Error Handling

- Wrap components with error boundaries
- Provide meaningful error messages
- Implement graceful degradation
- Log errors for debugging

## Migration and Maintenance

### Component Updates

When updating components, follow these guidelines:

1. Maintain backward compatibility when possible
2. Use deprecation warnings for breaking changes
3. Update documentation and examples
4. Add migration guides for major changes

### Refactoring

- Extract reusable logic into custom hooks
- Split large components into smaller ones
- Move business logic out of presentation components
- Consolidate similar components when appropriate

### Dependencies

- Keep dependencies up to date
- Audit for security vulnerabilities
- Remove unused dependencies
- Document peer dependencies clearly
