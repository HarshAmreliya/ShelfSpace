# BookCard Component System

The BookCard component system provides a comprehensive, flexible way to display book information across the application. This system was refactored to consolidate multiple variants into a single, maintainable architecture.

## 🏗️ Architecture

The BookCard system consists of:

### Core Components
- **`BookCard`**: Main orchestrator component that renders appropriate variant
- **`BookCover`**: Handles book cover display with optimization
- **`BookInfo`**: Displays book metadata (title, author, rating, etc.)
- **`BookActions`**: Manages action buttons and interactions

### Variant Components
- **`BookCardCompact`**: Minimal display for lists and sidebars
- **`BookCardGrid`**: Standard grid layout for library views
- **`BookCardDashboard`**: Dashboard-specific layout with quick actions
- **`BookCardLibrary`**: Library management view with status indicators
- **`BookCardDetailed`**: Rich display with full book information

## 📦 Usage

### Basic Usage

```tsx
import { BookCard } from "@/components/common/BookCard";

<BookCard
  book={book}
  variant="grid"
  size="medium"
  showProgress={true}
  showActions={true}
  actions={{
    onView: (book) => navigate(`/book/${book.id}`),
    onEdit: (book) => openEditModal(book),
    onRemove: (book) => removeFromLibrary(book.id)
  }}
/>
```

### Using Sub-components

```tsx
import { BookCover, BookInfo, BookActions } from "@/components/common/BookCard";

<div className="custom-book-layout">
  <BookCover 
    src={book.cover} 
    alt={book.title}
    width="w-16" 
    height="h-24" 
  />
  <BookInfo 
    book={book}
    showRating={true}
    showProgress={true}
  />
  <BookActions 
    book={book}
    actions={actions}
    variant="vertical"
  />
</div>
```

## 🎨 Variants

### Compact
```tsx
<BookCard variant="compact" book={book} size="small" />
```
- Minimal information display
- Small footprint
- Perfect for lists and sidebars

### Grid
```tsx
<BookCard variant="grid" book={book} size="medium" />
```
- Standard card layout
- Balanced information density
- Default for library views

### Dashboard
```tsx
<BookCard variant="dashboard" book={book} size="large" />
```
- Quick action buttons
- Reading progress emphasis
- Dashboard-specific styling

### Library
```tsx
<BookCard variant="library" book={book} size="medium" />
```
- Status indicators
- Library management actions
- Reading list integration

### Detailed
```tsx
<BookCard variant="detailed" book={book} size="large" />
```
- Full book information
- Rich metadata display
- Comprehensive action set

## 🔧 Props

### BookCard Props

```tsx
interface BookCardProps {
  book: Book;
  variant?: "compact" | "grid" | "dashboard" | "library" | "detailed";
  size?: "small" | "medium" | "large";
  showProgress?: boolean;
  showActions?: boolean;
  actions?: BookCardActions;
  onClick?: (book: Book) => void;
  className?: string;
}
```

### BookCardActions

```tsx
interface BookCardActions {
  onView?: (book: Book) => void;
  onEdit?: (book: Book) => void;
  onRemove?: (book: Book) => void;
  onAddToList?: (book: Book) => void;
  onMore?: (book: Book) => void;
}
```

## 🎯 Hooks

### useBookCard

Provides common book card logic and utilities:

```tsx
import { useBookCard } from "@/hooks/useBookCard";

const { handleBookClick, coverUrl, statusColor, formattedStatus } = useBookCard({
  book,
  actions,
  onClick
});
```

### useBookCardSize

Manages size configurations for different variants:

```tsx
import { useBookCardSize } from "@/hooks/useBookCardSize";

const sizeConfig = useBookCardSize("medium");
// Returns: { image: { width: "w-16", height: "h-24" }, card: "p-4", ... }
```

## 🚀 Performance Features

### React.memo Optimization
All components are wrapped with `React.memo` to prevent unnecessary re-renders:

```tsx
export const BookCard = memo(function BookCard({ book, variant, ...props }) {
  // Component implementation
});
```

### OptimizedImage Integration
Book covers use the `OptimizedImage` component for:
- Lazy loading
- Automatic format optimization
- Fallback handling
- Blur placeholders

### Virtual Scrolling Support
The BookCard system is compatible with virtual scrolling for large lists:

```tsx
<VirtualBookList
  books={books}
  renderItem={(book) => (
    <BookCard book={book} variant="compact" size="small" />
  )}
/>
```

## 🎨 Styling

### Size Variants

| Size | Image | Padding | Title | Author |
|------|-------|---------|-------|--------|
| Small | 48x64px | 12px | 14px | 12px |
| Medium | 64x96px | 16px | 16px | 14px |
| Large | 80x120px | 24px | 18px | 16px |

### Theme Support
All variants support light/dark themes with proper contrast ratios and accessibility compliance.

## 🧪 Testing

### Component Tests
```tsx
describe("BookCard", () => {
  it("renders book information correctly", () => {
    render(<BookCard book={mockBook} variant="grid" />);
    expect(screen.getByText(mockBook.title)).toBeInTheDocument();
    expect(screen.getByText(mockBook.author)).toBeInTheDocument();
  });

  it("calls onClick when card is clicked", async () => {
    const onClick = jest.fn();
    const { user } = render(<BookCard book={mockBook} onClick={onClick} />);
    
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledWith(mockBook);
  });
});
```

### Accessibility Tests
```tsx
test("has no accessibility violations", async () => {
  const { container } = render(<BookCard book={mockBook} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 🔄 Migration Guide

### From Old BookCard Variants

**Before:**
```tsx
import { BookCardCompact } from "./BookCardCompact";
import { BookCardGrid } from "./BookCardGrid";
import { BookCardDashboard } from "./BookCardDashboard";

<BookCardGrid book={book} />
```

**After:**
```tsx
import { BookCard } from "@/components/common/BookCard";

<BookCard book={book} variant="grid" />
```

### Custom BookCard Implementations

If you have custom BookCard implementations, consider:

1. **Extract common logic** into the `useBookCard` hook
2. **Use sub-components** (BookCover, BookInfo, BookActions) for custom layouts
3. **Follow the variant pattern** for consistency
4. **Add proper TypeScript types** for all props

## 🐛 Troubleshooting

### Common Issues

**BookCard not rendering:**
- Ensure the `book` prop contains required fields (id, title, author, cover)
- Check that the variant is one of the supported options

**Actions not working:**
- Verify that action handlers are properly passed in the `actions` prop
- Check that event handlers are not preventing default behavior

**Performance issues:**
- Ensure you're using `React.memo` for custom components
- Consider using virtual scrolling for large lists
- Check that images are properly optimized

### Debug Mode

Enable debug mode to see component state:

```tsx
<BookCard 
  book={book} 
  variant="grid" 
  debug={true} // Shows component state in console
/>
```

## 📚 Related Documentation

- [Component Architecture Guide](../README.md)
- [Performance Optimization Guide](../../../docs/performance.md)
- [Accessibility Guidelines](../../../docs/accessibility.md)
- [Testing Strategy](../../../docs/testing.md)
