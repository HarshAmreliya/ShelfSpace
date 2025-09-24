import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { LibraryFeature } from "../LibraryFeature";
import { TestProviders } from "../../../test-utils/test-providers";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock the hooks
jest.mock("../../hooks/library/useLibraryState", () => ({
  useLibraryState: () => ({
    readingLists: [],
    selectedList: "1",
    viewMode: "grid",
    filters: {
      search: "",
      genre: null,
      status: null,
      sortBy: "title",
      sortOrder: "asc",
    },
    isLoading: false,
    error: null,
    actions: {
      selectList: jest.fn(),
      setViewMode: jest.fn(),
      updateFilters: jest.fn(),
      addBook: jest.fn(),
      updateBook: jest.fn(),
      removeBook: jest.fn(),
    },
  }),
}));

describe("LibraryFeature Accessibility", () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(<TestProviders>{component}</TestProviders>);
  };

  it("should not have accessibility violations", async () => {
    const { container } = renderWithProviders(<LibraryFeature />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has proper heading structure", () => {
    renderWithProviders(<LibraryFeature />);

    // Should have a main heading
    const mainHeading = screen.getByRole("heading", { level: 1 });
    expect(mainHeading).toBeInTheDocument();

    // Should have proper heading hierarchy
    const headings = screen.getAllByRole("heading");
    const headingLevels = headings.map((h) => parseInt(h.tagName.charAt(1)));

    // Check that heading levels don't skip (e.g., h1 -> h3)
    for (let i = 1; i < headingLevels.length; i++) {
      expect(headingLevels[i] - headingLevels[i - 1]).toBeLessThanOrEqual(1);
    }
  });

  it("has proper landmark regions", () => {
    renderWithProviders(<LibraryFeature />);

    // Should have main content area
    expect(screen.getByRole("main")).toBeInTheDocument();

    // Should have navigation for reading lists
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("supports keyboard navigation", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LibraryFeature />);

    // Should be able to tab through interactive elements
    const interactiveElements = screen.getAllByRole("button");

    for (const element of interactiveElements) {
      await user.tab();
      expect(document.activeElement).toBe(element);
    }
  });

  it("has proper ARIA labels for interactive elements", () => {
    renderWithProviders(<LibraryFeature />);

    // Search input should have proper labeling
    const searchInput = screen.getByRole("searchbox");
    expect(searchInput).toHaveAccessibleName();

    // Buttons should have accessible names
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveAccessibleName();
    });
  });

  it("provides proper focus management", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LibraryFeature />);

    // Focus should be visible
    const firstFocusableElement = screen.getAllByRole("button")[0];
    firstFocusableElement.focus();

    expect(firstFocusableElement).toHaveFocus();
    expect(firstFocusableElement).toHaveClass("focus:ring-2"); // Assuming focus styles
  });

  it("announces dynamic content changes to screen readers", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LibraryFeature />);

    // Should have live regions for dynamic updates
    const liveRegion = screen.getByRole("status", { hidden: true });
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
  });

  it("has sufficient color contrast", () => {
    renderWithProviders(<LibraryFeature />);

    // This is a simplified test - in a real scenario, you'd use tools like
    // axe-core or manual testing to verify color contrast ratios
    const textElements = screen.getAllByText(/./);

    textElements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      expect(styles.color).toBeDefined();
      expect(styles.backgroundColor).toBeDefined();
    });
  });

  it("supports screen reader navigation", () => {
    renderWithProviders(<LibraryFeature />);

    // Should have proper semantic structure
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();

    // Lists should be properly marked up
    const lists = screen.getAllByRole("list");
    lists.forEach((list) => {
      const listItems = screen.getAllByRole("listitem");
      expect(listItems.length).toBeGreaterThan(0);
    });
  });

  it("handles reduced motion preferences", () => {
    // Mock reduced motion preference
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    renderWithProviders(<LibraryFeature />);

    // Animated elements should respect reduced motion
    const animatedElements = screen.getAllByTestId(/animated/);
    animatedElements.forEach((element) => {
      expect(element).toHaveClass("motion-reduce:transition-none");
    });
  });

  it("provides alternative text for images", () => {
    renderWithProviders(<LibraryFeature />);

    const images = screen.getAllByRole("img");
    images.forEach((image) => {
      expect(image).toHaveAttribute("alt");
      expect(image.getAttribute("alt")).not.toBe("");
    });
  });

  it("has proper form labeling", () => {
    renderWithProviders(<LibraryFeature />);

    // All form controls should have labels
    const formControls = [
      ...screen.getAllByRole("textbox"),
      ...screen.getAllByRole("combobox"),
      ...screen.getAllByRole("checkbox"),
      ...screen.getAllByRole("radio"),
    ];

    formControls.forEach((control) => {
      expect(control).toHaveAccessibleName();
    });
  });
});
