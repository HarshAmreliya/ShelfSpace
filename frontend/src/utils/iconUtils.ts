import {
  Home,
  MessageCircle,
  BookOpen,
  Search,
  Users,
  Settings,
  ChevronRight,
  LogOut,
  LucideIcon,
} from "lucide-react";

// Icon mapping for string-based icon names
const iconMap: Record<string, LucideIcon> = {
  Home,
  MessageCircle,
  BookOpen,
  Search,
  Users,
  Settings,
  ChevronRight,
  LogOut,
};

export function getIconComponent(iconName: string): LucideIcon {
  return iconMap[iconName] || Home; // Default to Home icon if not found
}

export { iconMap };
