import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link" | "destructive";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  "data-testid"?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  fallbackIcon?: LucideIcon;
  status?: "online" | "offline" | "away" | "busy";
  showStatus?: boolean;
  "data-testid"?: string;
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "neutral";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  rounded?: boolean;
  dot?: boolean;
  children?: ReactNode;
  "data-testid"?: string;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "default" | "outlined" | "elevated" | "filled";
  padding?: "xs" | "sm" | "md" | "lg" | "xl";
  radius?: "xs" | "sm" | "md" | "lg" | "xl";
  shadow?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  interactive?: boolean;
  children?: ReactNode;
  "data-testid"?: string;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  type?: string;
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "filled" | "outline";
  isRequired?: boolean;
  isInvalid?: boolean;
  disabled?: boolean;
  "data-testid"?: string;
  id?: string;
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: "text" | "rectangular" | "circular";
  animation?: "pulse" | "wave" | "none";
  lines?: number;
  "data-testid"?: string;
}
