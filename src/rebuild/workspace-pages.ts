import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Home,
  Inbox,
  NotebookTabs,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type {
  HousePageIcon,
  HouseSection,
  HouseWorkspacePage,
} from './types';

const icons: Record<HousePageIcon, LucideIcon> = {
  home: Home,
  'clipboard-list': ClipboardList,
  users: Users,
  'circle-dollar-sign': CircleDollarSign,
  'building-2': Building2,
  inbox: Inbox,
  'file-text': FileText,
  'notebook-tabs': NotebookTabs,
  'calendar-days': CalendarDays,
  wrench: Wrench,
};

export function workspaceIcon(icon: HousePageIcon) {
  return icons[icon] ?? FileText;
}

export function workspacePageRoute(page: HouseWorkspacePage): HouseSection {
  return page.systemKey ?? `page:${page.id}`;
}
