# Maintenance Guidelines

This document provides guidelines for maintaining and extending the ShelfSpace frontend application following the established architecture patterns.

## 🏗️ Architecture Principles

### App/Src Separation Pattern

The application follows a strict separation between routing and business logic:

```
frontend/
├── app/                    # Next.js App Router (routing only)
│   ├── (dashboard)/       # Route groups
│   ├── api/              # API routes
│   └── layout.tsx        # Root layout
└── src/                   # Business logic and components
    ├── components/        # React components
    ├── hooks/            # Custom hooks
    ├── services/         # API services
    ├── utils/            # Utility functions
    ├── contexts/         # React contexts
    └── types/            # TypeScript definitions
```

**Rules:**
- `app/` directory contains ONLY routing and page components
- `src/` directory contains ALL business logic, components, hooks, and services
- No business logic in `app/` directory
- No routing logic in `src/` directory

## 📁 File Organization

### Component Structure

```
src/components/
├── feature/              # Feature-specific components
│   ├── FeatureComponent.tsx
│   ├── FeatureSubComponent.tsx
│   └── index.ts         # Export barrel
├── common/              # Shared components
│   ├── ComponentName/
│   │   ├── ComponentName.tsx
│   │   ├── SubComponent.tsx
│   │   ├── index.ts
│   │   └── README.md
│   └── index.ts
└── ui/                  # Design system components
    ├── Button.tsx
    ├── Card.tsx
    └── index.ts
```

### Naming Conventions

- **Components**: PascalCase (e.g., `BookCard.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useBookCard.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase (e.g., `Book.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

## 🔧 Adding New Features

### 1. Create Feature Directory

```bash
mkdir src/components/feature-name
mkdir src/hooks/feature-name
mkdir src/services/feature-name
```

### 2. Component Structure

```tsx
// src/components/feature-name/FeatureComponent.tsx
"use client";

import React, { memo } from "react";
import { useFeatureState } from "@/hooks/feature-name/useFeatureState";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { FeatureErrorFallback } from "@/components/common/ErrorFallbacks";

interface FeatureComponentProps {
  // Define props with JSDoc comments
  /** Initial data for the feature */
  initialData?: FeatureData;
  /** Callback when feature state changes */
  onChange?: (state: FeatureState) => void;
  /** Additional CSS classes */
  className?: string;
}

export const FeatureComponent = memo(function FeatureComponent({
  initialData,
  onChange,
  className,
}: FeatureComponentProps) {
  const { state, actions } = useFeatureState(initialData);

  return (
    <ErrorBoundary fallback={FeatureErrorFallback}>
      <div className={className}>
        {/* Component implementation */}
      </div>
    </ErrorBoundary>
  );
});

FeatureComponent.displayName = "FeatureComponent";
```

### 3. Custom Hook

```tsx
// src/hooks/feature-name/useFeatureState.ts
import { useState, useCallback, useMemo } from "react";
import { FeatureData, FeatureState, FeatureActions } from "@/types/feature";

export function useFeatureState(initialData?: FeatureData) {
  const [state, setState] = useState<FeatureState>({
    // Initial state
  });

  const actions = useMemo<FeatureActions>(() => ({
    // Action implementations
  }), []);

  return { state, actions };
}
```

### 4. Service Layer

```tsx
// src/services/featureService.ts
import { FeatureData, FeatureResponse } from "@/types/feature";
import { api } from "@/lib/api";

export class FeatureService {
  static async getFeatureData(id: string): Promise<FeatureResponse> {
    return api.get(`/features/${id}`);
  }

  static async updateFeature(id: string, data: Partial<FeatureData>): Promise<FeatureResponse> {
    return api.put(`/features/${id}`, data);
  }
}
```

### 5. Type Definitions

```tsx
// types/feature.ts
export interface FeatureData {
  id: string;
  name: string;
  // ... other properties
}

export interface FeatureState {
  data: FeatureData | null;
  loading: boolean;
  error: string | null;
}

export interface FeatureActions {
  loadData: (id: string) => Promise<void>;
  updateData: (data: Partial<FeatureData>) => Promise<void>;
}
```

### 6. Export Barrel

```tsx
// src/components/feature-name/index.ts
export { FeatureComponent } from "./FeatureComponent";
export type { FeatureComponentProps } from "./FeatureComponent";
```

## 🎨 Component Development

### Component Template

```tsx
"use client";

import React, { memo, useCallback, useMemo } from "react";
import { cn } from "@/utils/cn";

interface ComponentNameProps {
  /** Description of the prop */
  propName: PropType;
  /** Optional prop with default */
  optionalProp?: OptionalType;
  /** Event handler */
  onEvent?: (data: EventData) => void;
  /** CSS classes */
  className?: string;
}

export const ComponentName = memo(function ComponentName({
  propName,
  optionalProp = "defaultValue",
  onEvent,
  className,
}: ComponentNameProps) {
  const handleEvent = useCallback((data: EventData) => {
    onEvent?.(data);
  }, [onEvent]);

  const computedValue = useMemo(() => {
    // Expensive computation
    return computeValue(propName);
  }, [propName]);

  return (
    <div className={cn("base-classes", className)}>
      {/* Component content */}
    </div>
  );
});

ComponentName.displayName = "ComponentName";
```

### Performance Best Practices

1. **Use React.memo** for components that receive stable props
2. **Use useCallback** for event handlers passed to child components
3. **Use useMemo** for expensive computations
4. **Implement proper key props** for list items
5. **Use lazy loading** for large components

```tsx
// Good: Memoized component with stable props
const BookCard = memo(function BookCard({ book, onSelect }: BookCardProps) {
  const handleSelect = useCallback(() => {
    onSelect?.(book);
  }, [book, onSelect]);

  return <Card onClick={handleSelect}>{/* content */}</Card>;
});

// Good: Memoized expensive computation
const filteredBooks = useMemo(() => {
  return books.filter(book => book.title.includes(searchQuery));
}, [books, searchQuery]);
```

## 🧪 Testing Guidelines

### Component Testing

```tsx
// ComponentName.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { ComponentName } from "./ComponentName";

describe("ComponentName", () => {
  it("renders correctly", () => {
    render(<ComponentName propName="test" />);
    expect(screen.getByText("test")).toBeInTheDocument();
  });

  it("calls onEvent when triggered", () => {
    const onEvent = jest.fn();
    render(<ComponentName propName="test" onEvent={onEvent} />);
    
    fireEvent.click(screen.getByRole("button"));
    expect(onEvent).toHaveBeenCalledWith(expectedData);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ComponentName propName="test" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Hook Testing

```tsx
// useFeatureState.test.ts
import { renderHook, act } from "@testing-library/react";
import { useFeatureState } from "./useFeatureState";

describe("useFeatureState", () => {
  it("initializes with default state", () => {
    const { result } = renderHook(() => useFeatureState());
    expect(result.current.state).toEqual(expectedInitialState);
  });

  it("updates state when action is called", async () => {
    const { result } = renderHook(() => useFeatureState());
    
    await act(async () => {
      await result.current.actions.loadData("test-id");
    });
    
    expect(result.current.state.data).toBeDefined();
  });
});
```

## 🚀 Performance Optimization

### Code Splitting

```tsx
// Lazy load large components
const HeavyComponent = lazy(() => import("./HeavyComponent"));

function App() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Virtual Scrolling

```tsx
// For large lists
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: virtualItem.size,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ItemComponent item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🔍 Debugging

### Debug Utilities

```tsx
// utils/debugUtils.ts
export const debugLog = (component: string, message: string, data?: any) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[${component}] ${message}`, data);
  }
};

// Usage in components
const BookCard = memo(function BookCard({ book }: BookCardProps) {
  debugLog("BookCard", "Rendering book", { id: book.id, title: book.title });
  
  return <div>{/* component content */}</div>;
});
```

### Error Boundaries

```tsx
// components/common/ErrorBoundary.tsx
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    logError(error, errorInfo);
    
    // Update state to show error UI
    this.setState({ hasError: true, error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}
```

## 📦 Dependency Management

### Adding Dependencies

1. **Check if dependency is already available** in the project
2. **Use latest stable version** unless there's a specific reason not to
3. **Add to appropriate package.json** (dependencies vs devDependencies)
4. **Update lock file** and test thoroughly
5. **Document breaking changes** in CHANGELOG.md

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update specific package
npm update package-name

# Update all packages (be careful!)
npm update

# Check for security vulnerabilities
npm audit
npm audit fix
```

## 🐛 Common Issues and Solutions

### Import Path Issues

**Problem**: Module not found errors
**Solution**: Use absolute imports with `@/` prefix

```tsx
// Good
import { Button } from "@/components/ui/Button";
import { useBookCard } from "@/hooks/useBookCard";

// Bad
import { Button } from "../../ui/Button";
import { useBookCard } from "../../hooks/useBookCard";
```

### TypeScript Errors

**Problem**: Type conflicts or missing types
**Solution**: Check type exports in `types/index.ts`

```tsx
// Ensure types are properly exported
export type { Book, BookStatus, BookFormat } from "./book";
export type { User, UserPreferences } from "./user";
```

### Performance Issues

**Problem**: Slow rendering or memory leaks
**Solution**: 
1. Check for missing `React.memo` on expensive components
2. Verify `useCallback` and `useMemo` dependencies
3. Use React DevTools Profiler to identify bottlenecks
4. Implement virtual scrolling for large lists

### Build Errors

**Problem**: Build fails with TypeScript or ESLint errors
**Solution**:
1. Run `npm run build` to see specific errors
2. Fix TypeScript errors first
3. Address ESLint warnings
4. Ensure all imports resolve correctly

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [ESLint Rules](https://eslint.org/docs/rules)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)

### Best Practices
- [React Best Practices](https://react.dev/learn)
- [TypeScript Best Practices](https://typescript-eslint.io/rules)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref)
- [Performance Best Practices](https://web.dev/performance)

## 🤝 Contributing

### Code Review Checklist

- [ ] Follows established architecture patterns
- [ ] Has proper TypeScript types
- [ ] Includes comprehensive tests
- [ ] Follows accessibility guidelines
- [ ] Has proper error handling
- [ ] Uses performance optimizations where appropriate
- [ ] Includes documentation updates
- [ ] Passes all linting and type checks

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Accessibility testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors or warnings
```

## 📞 Support

For questions or issues:

1. **Check existing documentation** in this file and component READMEs
2. **Search existing issues** in the project repository
3. **Create a new issue** with detailed information
4. **Contact the development team** for urgent matters

Remember: Good documentation and following established patterns makes maintenance easier for everyone! 🚀
