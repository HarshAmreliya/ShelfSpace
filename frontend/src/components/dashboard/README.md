# Dashboard Feature Components

The Dashboard feature provides an overview of user's reading activity, statistics, and personalized recommendations. It's designed as a modular system with reusable components and efficient state management.

## Architecture Overview

```
DashboardFeature (Main Orchestrator)
├── sections/
│   ├── CurrentlyReadingSection
│   ├── RecentActivitySection
│   ├── RecommendationsSection
│   └── StatsSection
└── components/
    ├── BookCard
    ├── StatsCard
    └── ActivityItem
```

## Components

### DashboardFeature

Main orchestrator component that manages dashboard state and coordinates between sections.

**Props:**

- `initialData?: DashboardData` - Optional initial data for SSR
- `refreshInterval?: number` - Auto-refresh interval in milliseconds

**Features:**

- Dashboard data management
- Auto-refresh functionality
- Error boundaries and loading states
- Responsive layout
- User preferences persistence

### Section Components

#### CurrentlyReadingSection

Displays books currently being read with progress indicators.

**Features:**

- Reading progress visualization
- Quick actions (mark as finished, update progress)
- Responsive card layout
- Empty state handling

#### RecentActivitySection

Shows recent reading activity and achievements.

**Features:**

- Activity timeline
- Achievement badges
- Social interactions (if enabled)
- Pagination for large activity lists

#### RecommendationsSection

Displays personalized book recommendations.

**Features:**

- AI-powered recommendations
- Recommendation reasons
- Quick add to reading list
- Refresh recommendations

#### StatsSection

Shows reading statistics and analytics.

**Features:**

- Reading streak tracking
- Books read this year/month
- Average reading time
- Genre distribution charts

### Reusable Components

#### BookCard

Reusable book display component with multiple variants.

**Props:**

- `book: Book` - Book data
- `variant?: 'compact' | 'detailed' | 'minimal'` - Display variant
- `showProgress?: boolean` - Show reading progress
- `actions?: BookCardActions` - Available actions

#### StatsCard

Displays statistical information with icons and trends.

**Props:**

- `title: string` - Card title
- `value: string | number` - Main statistic value
- `trend?: { value: number; direction: 'up' | 'down' }` - Trend information
- `icon?: LucideIcon` - Display icon

#### ActivityItem

Displays individual activity items in the activity feed.

**Props:**

- `activity: Activity` - Activity data
- `showAvatar?: boolean` - Show user avatar
- `compact?: boolean` - Compact display mode

## State Management

### useDashboardState

Main state hook for dashboard data and preferences.

**Returns:**

- `data: DashboardData` - Dashboard data
- `preferences: DashboardPreferences` - User preferences
- `isLoading: boolean` - Loading state
- `error: Error | null` - Error state
- `actions: DashboardActions` - Action functions

### useDashboardData

Handles data fetching and caching for dashboard.

**Features:**

- Data fetching with SWR pattern
- Automatic refresh
- Error handling and retries
- Cache invalidation

### useDashboardPreferences

Manages user preferences for dashboard layout and behavior.

**Preferences:**

- `showStats: boolean` - Show statistics section
- `showRecentActivity: boolean` - Show recent activity
- `showRecommendations: boolean` - Show recommendations
- `compactView: boolean` - Use compact layout
- `refreshInterval: number` - Auto-refresh interval

## Data Flow

1. **DashboardFeature** initializes with preferences and optional initial data
2. **useDashboardData** fetches dashboard data from services
3. **Data flows down** to section components via props
4. **User interactions** trigger actions that update state
5. **Preferences changes** are persisted to localStorage

## Performance Optimizations

### Memoization

- Section components are memoized to prevent unnecessary re-renders
- Expensive calculations are memoized with useMemo
- Callback functions are memoized with useCallback

### Data Loading

- Initial data can be provided for SSR
- Incremental loading for large datasets
- Background refresh without blocking UI

### Virtual Scrolling

- Activity feed uses virtual scrolling for large lists
- Recommendations can be paginated

## Error Handling

### Error Boundaries

- Feature-level error boundary for critical failures
- Section-level error states for partial failures
- Graceful degradation when services are unavailable

### Retry Logic

- Automatic retry for failed data fetches
- Manual retry buttons for user-initiated retries
- Exponential backoff for repeated failures

## Accessibility

### WCAG 2.1 AA Compliance

- Semantic HTML structure with proper landmarks
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader announcements for dynamic content

### Focus Management

- Logical tab order
- Visible focus indicators
- Skip links for screen readers

### Color and Contrast

- Sufficient color contrast ratios
- Information not conveyed by color alone
- High contrast mode support

## Testing

### Component Testing

```tsx
import { render, screen } from "@testing-library/react";
import { DashboardFeature } from "./DashboardFeature";
import { mockDashboardData } from "@/test-utils";

test("renders dashboard sections", () => {
  render(<DashboardFeature initialData={mockDashboardData} />);

  expect(screen.getByText("Currently Reading")).toBeInTheDocument();
  expect(screen.getByText("Recent Activity")).toBeInTheDocument();
  expect(screen.getByText("Recommendations")).toBeInTheDocument();
});
```

### Integration Testing

```tsx
import { renderWithProviders } from "@/test-utils";
import { DashboardFeature } from "./DashboardFeature";

test("handles data loading and error states", async () => {
  const { user } = renderWithProviders(<DashboardFeature />);

  // Test loading state
  expect(screen.getByTestId("dashboard-loading")).toBeInTheDocument();

  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText("5 books")).toBeInTheDocument();
  });
});
```

## Usage Examples

### Basic Dashboard

```tsx
import { DashboardFeature } from "@/components/dashboard";

export default function DashboardPage() {
  return <DashboardFeature />;
}
```

### With Initial Data (SSR)

```tsx
import { DashboardFeature } from "@/components/dashboard";
import { getDashboardData } from "@/services/dashboard";

export default async function DashboardPage() {
  const initialData = await getDashboardData();

  return <DashboardFeature initialData={initialData} />;
}
```

### Custom Refresh Interval

```tsx
import { DashboardFeature } from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <DashboardFeature
      refreshInterval={30000} // 30 seconds
    />
  );
}
```

### With Custom Error Handling

```tsx
import { DashboardFeature } from "@/components/dashboard";
import { ErrorBoundary } from "@/components/common";

export default function DashboardPage() {
  return (
    <ErrorBoundary
      fallback={CustomDashboardErrorFallback}
      onError={(error) => {
        // Custom error reporting
        analytics.track("dashboard_error", { error: error.message });
      }}
    >
      <DashboardFeature />
    </ErrorBoundary>
  );
}
```

## Customization

### Section Visibility

```tsx
// Hide specific sections based on user preferences
const preferences = {
  showStats: true,
  showRecentActivity: false,
  showRecommendations: true,
  compactView: false,
};

<DashboardFeature preferences={preferences} />;
```

### Custom Components

```tsx
// Use custom components for sections
<DashboardFeature
  components={{
    StatsSection: CustomStatsSection,
    BookCard: CustomBookCard,
  }}
/>
```

## API Integration

### Data Requirements

The dashboard requires the following data endpoints:

- `GET /api/dashboard` - Main dashboard data
- `GET /api/books/currently-reading` - Currently reading books
- `GET /api/activity/recent` - Recent activity
- `GET /api/recommendations` - Personalized recommendations
- `GET /api/stats/reading` - Reading statistics

### Data Caching

- Dashboard data is cached for 5 minutes
- Activity data is cached for 2 minutes
- Recommendations are cached for 30 minutes
- Statistics are cached for 1 hour

## Browser Support

- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+, Samsung Internet 14+
- **Accessibility**: Screen readers, keyboard navigation, high contrast mode
