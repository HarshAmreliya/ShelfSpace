# Micro-Interactions Guide

A comprehensive guide to using micro-interactions and animations in the ShelfSpace frontend.

## Overview

Micro-interactions are small, subtle animations and feedback mechanisms that enhance user experience by providing visual feedback, guiding attention, and making the interface feel more responsive and alive.

## Components

### 1. Enhanced Button (`EnhancedButton`)

A button component with ripple effects, loading states, and smooth transitions.

```tsx
import { EnhancedButton } from "@/components/ui/EnhancedButton";

<EnhancedButton
  variant="primary"
  size="md"
  loading={false}
  icon={<Plus />}
  iconPosition="left"
  ripple={true}
  onClick={handleClick}
>
  Add Book
</EnhancedButton>;
```

**Props:**

- `variant`: "primary" | "secondary" | "ghost" | "danger"
- `size`: "sm" | "md" | "lg"
- `loading`: boolean - Shows loading spinner
- `icon`: React.ReactNode - Icon to display
- `iconPosition`: "left" | "right"
- `ripple`: boolean - Enable ripple effect on click

### 2. Enhanced Card (`EnhancedCard`)

Cards with hover effects and staggered animations.

```tsx
import {
  EnhancedCard,
  CardHeader,
  CardBody,
  CardFooter,
} from "@/components/ui/EnhancedCard";

<EnhancedCard hoverable animated delay={100}>
  <CardHeader>
    <h3>Book Title</h3>
  </CardHeader>
  <CardBody>
    <p>Book description...</p>
  </CardBody>
  <CardFooter>
    <button>Read More</button>
  </CardFooter>
</EnhancedCard>;
```

**Props:**

- `hoverable`: boolean - Enable hover lift effect
- `animated`: boolean - Enable fade-in animation
- `delay`: number - Animation delay in ms
- `onClick`: () => void - Click handler

### 3. Enhanced Input (`EnhancedInput`)

Input fields with validation states, icons, and smooth transitions.

```tsx
import { EnhancedInput, EnhancedTextarea } from "@/components/ui/EnhancedInput";

<EnhancedInput
  label="Email"
  type="email"
  placeholder="Enter your email"
  icon={<Mail />}
  clearable
  error="Invalid email address"
  success="Email is valid"
  hint="We'll never share your email"
/>

<EnhancedTextarea
  label="Description"
  placeholder="Enter description"
  showCount
  maxLength={500}
  rows={4}
/>
```

**Props:**

- `label`: string - Input label
- `error`: string - Error message
- `success`: string - Success message
- `hint`: string - Helper text
- `icon`: React.ReactNode - Leading icon
- `clearable`: boolean - Show clear button
- `showPasswordToggle`: boolean - For password inputs
- `showCount`: boolean - For textarea character count

### 4. Toast Notifications

Use the `useToast` hook for toast notifications.

```tsx
import { useToast } from "@/hooks/useToast";

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success("Book added successfully!");
  };

  const handleError = () => {
    toast.error("Failed to add book");
  };

  const handleWarning = () => {
    toast.warning("Please save your changes");
  };

  const handleInfo = () => {
    toast.info("New feature available");
  };

  return <button onClick={handleSuccess}>Add Book</button>;
}
```

### 5. Tooltip

Hover tooltips with smooth animations.

```tsx
import { Tooltip } from "@/components/ui/MicroInteractions";

<Tooltip content="Click to edit" position="top">
  <button>Edit</button>
</Tooltip>;
```

**Props:**

- `content`: string - Tooltip text
- `position`: "top" | "bottom" | "left" | "right"

### 6. Animated Counter

Animates number changes.

```tsx
import { AnimatedCounter } from "@/components/ui/MicroInteractions";

<AnimatedCounter value={1234} duration={1000} />;
```

### 7. Progress Bar

Animated progress indicator.

```tsx
import { AnimatedProgressBar } from "@/components/ui/MicroInteractions";

<AnimatedProgressBar progress={75} showLabel />;
```

### 8. Scroll Animations

Animate elements as they scroll into view.

```tsx
import { ScrollAnimation, StaggerContainer } from "@/components/ui/ScrollAnimations";

<ScrollAnimation animation="slide-up" delay={100}>
  <div>Content appears on scroll</div>
</ScrollAnimation>

<StaggerContainer staggerDelay={100}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</StaggerContainer>
```

**Animation types:**

- `fade` - Simple fade in
- `slide-up` - Slide from bottom
- `slide-left` - Slide from right
- `slide-right` - Slide from left
- `scale` - Scale up
- `bounce` - Bounce in

### 9. Page Transitions

Smooth transitions between pages.

```tsx
import { PageTransition, FadeTransition, ScaleTransition, SlideTransition } from "@/components/ui/PageTransition";

// In your layout
<PageTransition>
  {children}
</PageTransition>

// Or use specific transitions
<FadeTransition>{children}</FadeTransition>
<ScaleTransition>{children}</ScaleTransition>
<SlideTransition direction="up">{children}</SlideTransition>
```

### 10. Floating Action Button

Expandable FAB with label.

```tsx
import { FloatingActionButton } from "@/components/ui/MicroInteractions";
import { Plus } from "lucide-react";

<FloatingActionButton
  icon={<Plus />}
  label="Add New Book"
  onClick={handleAdd}
/>;
```

## CSS Animation Classes

Use these utility classes directly in your components:

### Fade Animations

- `animate-fade-in` - Simple fade in
- `animate-fade-in-up` - Fade in from bottom
- `animate-fade-in-down` - Fade in from top
- `animate-fade-in-left` - Fade in from left
- `animate-fade-in-right` - Fade in from right

### Scale Animations

- `animate-scale-in` - Scale up
- `animate-bounce-in` - Bounce in

### Other Animations

- `animate-shake` - Shake effect (for errors)
- `animate-pulse` - Pulse opacity
- `animate-pulse-scale` - Pulse scale
- `animate-shimmer` - Shimmer loading effect
- `animate-wiggle` - Wiggle rotation
- `animate-glow` - Glow effect

### Hover Effects

- `hover-lift` - Lift on hover
- `hover-scale` - Scale on hover
- `hover-glow` - Glow on hover
- `hover-brighten` - Brighten on hover

### Button Effects

- `btn-press` - Press down on click
- `transition-smooth` - Smooth transitions
- `transition-bounce` - Bouncy transitions

### Stagger Animations

- `stagger-fade-in` - Stagger children fade in

## Usage Examples

### Book Card with Micro-Interactions

```tsx
import { EnhancedCard } from "@/components/ui/EnhancedCard";
import { Tooltip } from "@/components/ui/MicroInteractions";
import { useToast } from "@/hooks/useToast";

function BookCard({ book }) {
  const toast = useToast();

  const handleAddToLibrary = () => {
    // Add book logic
    toast.success("Book added to library!");
  };

  return (
    <EnhancedCard hoverable animated delay={100}>
      <img src={book.cover} alt={book.title} className="hover-scale" />
      <h3 className="animate-fade-in-up">{book.title}</h3>
      <p className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        {book.author}
      </p>
      <Tooltip content="Add to library" position="top">
        <button onClick={handleAddToLibrary} className="btn-press hover-lift">
          Add to Library
        </button>
      </Tooltip>
    </EnhancedCard>
  );
}
```

### Form with Enhanced Inputs

```tsx
import { EnhancedInput } from "@/components/ui/EnhancedInput";
import { EnhancedButton } from "@/components/ui/EnhancedButton";
import { Mail, Lock } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  return (
    <form className="space-y-4">
      <EnhancedInput
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<Mail />}
        clearable
        error={errors.email}
        placeholder="Enter your email"
      />

      <EnhancedInput
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<Lock />}
        showPasswordToggle
        error={errors.password}
        placeholder="Enter your password"
      />

      <EnhancedButton
        variant="primary"
        size="lg"
        loading={isLoading}
        className="w-full"
      >
        Sign In
      </EnhancedButton>
    </form>
  );
}
```

### Dashboard with Scroll Animations

```tsx
import {
  ScrollAnimation,
  StaggerContainer,
} from "@/components/ui/ScrollAnimations";
import { EnhancedCard } from "@/components/ui/EnhancedCard";

function Dashboard() {
  return (
    <div>
      <ScrollAnimation animation="fade">
        <h1>Welcome to Your Dashboard</h1>
      </ScrollAnimation>

      <StaggerContainer staggerDelay={100}>
        <EnhancedCard>
          <h3>Total Books</h3>
          <AnimatedCounter value={47} />
        </EnhancedCard>

        <EnhancedCard>
          <h3>Reading Progress</h3>
          <AnimatedProgressBar progress={65} showLabel />
        </EnhancedCard>

        <EnhancedCard>
          <h3>Books Read</h3>
          <AnimatedCounter value={12} />
        </EnhancedCard>
      </StaggerContainer>
    </div>
  );
}
```

## Best Practices

1. **Use Sparingly**: Don't overuse animations. They should enhance, not distract.

2. **Performance**: Use CSS transforms and opacity for animations (GPU accelerated).

3. **Accessibility**: Respect `prefers-reduced-motion` (already handled in animations.css).

4. **Timing**: Keep animations short (200-400ms for most interactions).

5. **Consistency**: Use the same animation patterns throughout the app.

6. **Purpose**: Every animation should have a purpose (feedback, guidance, delight).

7. **Loading States**: Always provide feedback for async operations.

8. **Error States**: Use shake or color changes for errors.

9. **Success States**: Use check marks and green colors for success.

10. **Hover States**: Provide clear hover feedback for interactive elements.

## Accessibility

All animations respect the user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

This ensures users who prefer reduced motion have a comfortable experience.

## Performance Tips

1. Use `will-change` for frequently animated properties
2. Avoid animating `width`, `height`, `top`, `left` - use `transform` instead
3. Use `transform: translateZ(0)` to force GPU acceleration
4. Debounce scroll events
5. Use `IntersectionObserver` for scroll animations (already implemented)

## Browser Support

All animations use modern CSS and JavaScript features supported in:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

For older browsers, animations gracefully degrade to instant transitions.
