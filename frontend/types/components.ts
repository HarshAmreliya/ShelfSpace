import {
  ReactNode,
  HTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
} from "react";
import { LucideIcon } from "lucide-react";
import { ColorVariant, SizeVariant } from "./common";

// Base component props
export interface BaseComponentProps {
  className?: string | undefined;
  children?: ReactNode;
  "data-testid"?: string;
}

// Button component props
export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size">,
    BaseComponentProps {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "link"
    | "destructive";
  size?: SizeVariant;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  fullWidth?: boolean;
}

// Input component props
export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    BaseComponentProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  size?: SizeVariant;
  variant?: "default" | "filled" | "outline";
  isRequired?: boolean;
  isInvalid?: boolean;
}

// Card component props
export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    BaseComponentProps {
  variant?: "default" | "outlined" | "elevated" | "filled";
  padding?: SizeVariant;
  radius?: SizeVariant;
  shadow?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  interactive?: boolean;
}

// Modal component props
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
  trapFocus?: boolean;
}

// Dropdown component props
export interface DropdownProps extends BaseComponentProps {
  trigger: ReactNode;
  items: DropdownItem[];
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  offset?: number;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  closeOnSelect?: boolean;
}

export interface DropdownItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  shortcut?: string;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
  onClick?: () => void;
}

// Toast component props
export interface ToastProps extends BaseComponentProps {
  id: string;
  title?: string;
  description: string;
  variant?: ColorVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

// Badge component props
export interface BadgeProps extends BaseComponentProps {
  variant?: ColorVariant | "neutral";
  size?: SizeVariant;
  rounded?: boolean;
  dot?: boolean;
}

// Avatar component props
export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: SizeVariant;
  shape?: "circle" | "square";
  fallbackIcon?: LucideIcon;
  status?: "online" | "offline" | "away" | "busy";
  showStatus?: boolean;
}

// Skeleton component props
export interface SkeletonProps extends BaseComponentProps {
  width?: string | number;
  height?: string | number;
  variant?: "text" | "rectangular" | "circular";
  animation?: "pulse" | "wave" | "none";
  lines?: number; // For text variant
}

// Loading spinner props
export interface SpinnerProps extends BaseComponentProps {
  size?: SizeVariant;
  color?: ColorVariant;
  thickness?: number;
  speed?: "slow" | "normal" | "fast";
}

// Progress bar props
export interface ProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  size?: SizeVariant;
  variant?: ColorVariant;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

// Tabs component props
export interface TabsProps extends BaseComponentProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "pills" | "underline";
}

export interface TabsListProps extends BaseComponentProps {
  "aria-label"?: string;
}

export interface TabsTriggerProps extends BaseComponentProps {
  value: string;
  disabled?: boolean;
}

export interface TabsContentProps extends BaseComponentProps {
  value: string;
}

// Accordion component props
export interface AccordionProps extends BaseComponentProps {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
}

export interface AccordionItemProps extends BaseComponentProps {
  value: string;
  disabled?: boolean;
}

export interface AccordionTriggerProps extends BaseComponentProps {
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
}

export interface AccordionContentProps extends BaseComponentProps {}

// Form component props
export interface FormProps
  extends HTMLAttributes<HTMLFormElement>,
    BaseComponentProps {
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  validation?: Record<string, any>;
  defaultValues?: Record<string, any>;
}

export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
}

// Data table props
export interface DataTableProps<T> extends BaseComponentProps {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  sorting?: {
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  };
  selection?: {
    selectedRows: string[];
    onSelectionChange: (selectedRows: string[]) => void;
  };
}

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessor?: keyof T | ((row: T) => any);
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  align?: "left" | "center" | "right";
}

// Search component props
export interface SearchProps extends Omit<InputProps, "type"> {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  suggestions?: string[];
  showSuggestions?: boolean;
  debounceMs?: number;
}

// File upload props
export interface FileUploadProps extends BaseComponentProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onUpload: (files: File[]) => void | Promise<void>;
  onError?: (error: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

// Navigation component props
export interface NavigationProps extends BaseComponentProps {
  items: NavigationItem[];
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "pills" | "underline";
  currentPath?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
  children?: NavigationItem[];
  onClick?: () => void;
}

// Breadcrumb props
export interface BreadcrumbProps extends BaseComponentProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  maxItems?: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
  current?: boolean;
}
