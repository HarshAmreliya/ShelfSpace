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
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}
