export interface NavigationItemData {
  name: string;
  href: string;
  icon: string; // Icon name as string for better serialization
  badge?: number;
  children?: NavigationItemData[];
  ariaLabel?: string;
  isDisabled?: boolean;
}

export interface NavigationState {
  activeTab: string;
  isCollapsed: boolean;
  expandedItems: string[];
}

export interface NavigationPreferences {
  isCollapsed: boolean;
  favoriteItems: string[];
  customOrder?: string[];
}

export interface NavigationActions {
  setActiveTab: (tab: string) => void;
  toggleCollapse: () => void;
  toggleItemExpansion: (itemName: string) => void;
  navigateToItem: (item: NavigationItemData) => void;
  handleKeyboardNavigation: (
    event: KeyboardEvent,
    items: NavigationItemData[]
  ) => void;
}

export interface NavigationItemProps {
  item: NavigationItemData;
  isActive: boolean;
  isCollapsed: boolean;
  isExpanded: boolean;
  onItemClick: (item: NavigationItemData) => void;
  level?: number;
  className?: string;
}

export interface NavigationHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export interface NavigationFooterProps {
  isCollapsed: boolean;
  onSignOut?: () => void;
  className?: string;
}

export interface NavigationProps {
  className?: string;
  onSignOut?: () => void;
  initialTab?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}
