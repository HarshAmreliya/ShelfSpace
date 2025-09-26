# UI Components Library

A comprehensive collection of reusable UI components built with React, TypeScript, and Tailwind CSS. These components form the foundation of the ShelfSpace design system and are used throughout the application.

## Design Principles

- **Consistency**: Uniform visual language across all components
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard and screen reader support
- **Flexibility**: Configurable variants and customizable styling
- **Performance**: Optimized for minimal re-renders and bundle size
- **Developer Experience**: Comprehensive TypeScript support and clear APIs

## Components

### Button

Versatile button component with multiple variants, sizes, and states.

```tsx
import { Button } from '@/components/ui/Button';

// Basic usage
<Button>Click me</Button>

// With variants and sizes
<Button variant="secondary" size="lg">Large Secondary</Button>

// With loading state
<Button isLoading loadingText="Saving...">Save</Button>

// With icons
<Button leftIcon={Plus} rightIcon={ArrowRight}>Add Item</Button>
```

**Variants:**

- `primary` - Main action button (default)
- `secondary` - Secondary actions
- `outline` - Outlined button
- `ghost` - Minimal button without background
- `link` - Text link styled as button
- `destructive` - Dangerous actions

**Sizes:**

- `xs` - Extra small (28px height)
- `sm` - Small (32px height)
- `md` - Medium (40px height, default)
- `lg` - Large (44px height)
- `xl` - Extra large (48px height)

### Card

Flexible container component with various styling options.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";

<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>Main content goes here</CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>;
```

**Variants:**

- `default` - Standard card with border
- `outlined` - Emphasized border
- `elevated` - Card with shadow
- `filled` - Filled background

**Sub-components:**

- `CardHeader` - Title and description area
- `CardTitle` - Semantic heading element
- `CardDescription` - Subtitle text
- `CardContent` - Main content area
- `CardFooter` - Action area

### Input

Form input component with validation and accessibility features.

```tsx
import { Input } from "@/components/ui/Input";

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error="Please enter a valid email"
  required
/>;
```

**Features:**

- Built-in validation states
- Accessibility labels and descriptions
- Icon support
- Multiple input types
- Controlled and uncontrolled modes

### Avatar

User avatar component with fallback support.

```tsx
import { Avatar } from "@/components/ui/Avatar";

<Avatar src="/user-avatar.jpg" alt="John Doe" fallback="JD" size="lg" />;
```

**Sizes:**

- `xs` - 24px
- `sm` - 32px
- `md` - 40px (default)
- `lg` - 48px
- `xl` - 64px

### Badge

Small status and category indicators.

```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="success">Completed</Badge>
<Badge variant="warning" size="sm">Pending</Badge>
```

**Variants:**

- `default` - Neutral gray
- `primary` - Brand color
- `success` - Green for positive states
- `warning` - Yellow for caution
- `error` - Red for errors
- `info` - Blue for information

### Skeleton

Loading placeholder components.

```tsx
import { Skeleton } from '@/components/ui/Skeleton';

<Skeleton className="h-4 w-32" />
<Skeleton className="h-20 w-full rounded-lg" />
```

### Spinner

Loading indicator component.

```tsx
import { Spinner } from '@/components/ui/Spinner';

<Spinner size="md" />
<Spinner size="lg" className="text-blue-500" />
```

### OptimizedImage

Enhanced image component with optimization and loading states.

```tsx
import { OptimizedImage } from "@/components/ui/OptimizedImage";

<OptimizedImage
  src="/book-cover.jpg"
  alt="Book cover"
  width={200}
  height={300}
  priority
/>;
```

## Design Tokens

### Colors

The components use a consistent color palette defined in Tailwind CSS:

- **Primary**: Indigo Dye (#1e3a8a variants)
- **Gray Scale**: Gray 50-900 for neutral elements
- **Semantic Colors**:
  - Success: Green 500-700
  - Warning: Yellow 500-700
  - Error: Red 500-700
  - Info: Blue 500-700

### Typography

- **Font Family**: Inter (system fallback)
- **Font Sizes**: text-xs to text-xl
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing

- **Padding**: p-2 to p-10 (8px to 40px)
- **Margins**: m-2 to m-10 (8px to 40px)
- **Gaps**: gap-2 to gap-8 (8px to 32px)

### Border Radius

- **Small**: rounded (4px)
- **Medium**: rounded-md (6px)
- **Large**: rounded-lg (8px)
- **Extra Large**: rounded-xl (12px)

## Accessibility Features

### Keyboard Navigation

- All interactive components support keyboard navigation
- Proper tab order and focus management
- Escape key handling for dismissible components

### Screen Reader Support

- Semantic HTML elements
- ARIA labels and descriptions
- Live regions for dynamic content
- Proper heading hierarchy

### Visual Accessibility

- Sufficient color contrast ratios (4.5:1 minimum)
- Focus indicators for all interactive elements
- Support for reduced motion preferences
- High contrast mode compatibility

## Customization

### Tailwind CSS Classes

All components accept a `className` prop for custom styling:

```tsx
<Button className="bg-purple-600 hover:bg-purple-700">
  Custom Purple Button
</Button>
```

### CSS Custom Properties

Components support CSS custom properties for theming:

```css
:root {
  --button-primary-bg: #1e3a8a;
  --button-primary-hover: #1e40af;
  --card-background: #ffffff;
  --card-border: #e5e7eb;
}
```

### Variant Extension

Create new variants by extending the existing variant objects:

```tsx
const customButtonVariants = {
  ...buttonVariants,
  variant: {
    ...buttonVariants.variant,
    gradient: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  },
};
```

## Testing

### Component Testing

```tsx
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

test("renders button with correct text", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
});

test("handles click events", async () => {
  const handleClick = jest.fn();
  const { user } = render(<Button onClick={handleClick}>Click me</Button>);

  await user.click(screen.getByRole("button"));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Accessibility Testing

```tsx
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

test("Button has no accessibility violations", async () => {
  const { container } = render(<Button>Accessible Button</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Performance Considerations

### Bundle Size

- Components are tree-shakeable
- Icons are imported individually to reduce bundle size
- Minimal runtime dependencies

### Runtime Performance

- Components use React.memo where appropriate
- Expensive calculations are memoized
- Event handlers are optimized to prevent unnecessary re-renders

### Loading Performance

- Images use Next.js optimization
- Lazy loading for non-critical components
- Skeleton components for perceived performance

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Legacy Support**: Graceful degradation for older browsers

## Migration Guide

### From v1 to v2

- `size` prop values changed from numbers to strings
- `variant` prop renamed from `type` to `variant`
- Icon props now accept Lucide React components directly

### Breaking Changes

- Removed deprecated `color` prop in favor of `variant`
- Changed default button size from `sm` to `md`
- Updated focus ring styles for better accessibility

## Contributing

### Adding New Components

1. Create component file in `src/components/ui/`
2. Add TypeScript interfaces in `types/components.ts`
3. Export from `src/components/ui/index.ts`
4. Add comprehensive JSDoc documentation
5. Include usage examples and tests

### Component Guidelines

- Use forwardRef for components that need ref access
- Include displayName for better debugging
- Support both controlled and uncontrolled modes where applicable
- Follow existing naming conventions and patterns
