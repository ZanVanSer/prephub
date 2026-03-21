import type { LucideProps } from "lucide-react";
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Folder,
  Image as ImageGlyph,
  LayoutDashboard,
  LogOut,
  Mail,
  Search,
  Settings,
  Sparkles,
  User
} from "lucide-react";

type AppIconProps = Omit<LucideProps, "size" | "strokeWidth">;

const iconProps = {
  size: 20,
  strokeWidth: 1.9
} as const;

export function DashboardIcon(props: AppIconProps) {
  return <LayoutDashboard {...iconProps} {...props} />;
}

export function ImageIcon(props: AppIconProps) {
  return <ImageGlyph {...iconProps} {...props} />;
}

export function MailIcon(props: AppIconProps) {
  return <Mail {...iconProps} {...props} />;
}

export function SearchIcon(props: AppIconProps) {
  return <Search {...iconProps} {...props} />;
}

export function BellIcon(props: AppIconProps) {
  return <Bell {...iconProps} {...props} />;
}

export function SettingsIcon(props: AppIconProps) {
  return <Settings {...iconProps} {...props} />;
}

export function LogoutIcon(props: AppIconProps) {
  return <LogOut {...iconProps} {...props} />;
}

export function ChevronLeftIcon(props: AppIconProps) {
  return <ChevronLeft {...iconProps} {...props} />;
}

export function ChevronRightIcon(props: AppIconProps) {
  return <ChevronRight {...iconProps} {...props} />;
}

export function SparklesIcon(props: AppIconProps) {
  return <Sparkles {...iconProps} {...props} />;
}

export function FolderIcon(props: AppIconProps) {
  return <Folder {...iconProps} {...props} />;
}

export function ChartIcon(props: AppIconProps) {
  return <BarChart3 {...iconProps} {...props} />;
}

export function UserIcon(props: AppIconProps) {
  return <User {...iconProps} {...props} />;
}
