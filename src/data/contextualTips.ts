/**
 * Contextual Tips - Route-based helpful tips that appear when users visit pages
 */

export interface ContextualTip {
  id: string;
  route: string; // Route pattern to match
  title: string;
  message: string;
  actionText?: string;
  actionRoute?: string;
  dismissable: boolean;
}

export const CONTEXTUAL_TIPS: ContextualTip[] = [
  {
    id: 'welcome-tip',
    route: '/',
    title: 'Welcome to PropertyManager!',
    message:
      'This is your central dashboard. Use Quick Start cards to jump into common tasks, or check Recent Activity to see what\'s new.',
    actionText: 'Learn More',
    actionRoute: '/help',
    dismissable: true,
  },
  {
    id: 'properties-tip',
    route: '/properties',
    title: 'Property Dashboard',
    message:
      'View all your properties here. Click any property card to see details, or use "Add Property" to register a new property.',
    actionText: 'Add Property',
    actionRoute: '/properties',
    dismissable: true,
  },
  {
    id: 'projects-tip',
    route: '/projects',
    title: 'Project Management',
    message:
      'Track maintenance and improvement projects. Try "Create with AI" to get instant project plans with materials lists and cost estimates.',
    actionText: 'Create with AI',
    actionRoute: '/projects',
    dismissable: true,
  },
  {
    id: '3d-view-tip',
    route: '/3d-view',
    title: '3D Property Viewer',
    message:
      'Visualize your properties in 3D. Use mouse to rotate, scroll to zoom, and right-click to pan. Click objects to see details.',
    dismissable: true,
  },
  {
    id: 'financials-tip',
    route: '/financials',
    title: 'Financial Reports',
    message:
      'Monitor income, expenses, and profitability across all your properties. Generate reports for tax time or investor presentations.',
    dismissable: true,
  },
  {
    id: 'vendors-tip',
    route: '/vendors',
    title: 'Vendor Management',
    message:
      'Keep track of contractors, suppliers, and service providers. Store contact info, ratings, and project history.',
    actionText: 'Add Vendor',
    actionRoute: '/vendors',
    dismissable: true,
  },
  {
    id: 'tenants-tip',
    route: '/tenants',
    title: 'Tenant Management',
    message:
      'Manage tenant information, lease agreements, and communications. Set up payment tracking and maintenance requests.',
    actionText: 'Add Tenant',
    actionRoute: '/tenants',
    dismissable: true,
  },
  {
    id: 'documents-tip',
    route: '/documents',
    title: 'Document Storage',
    message:
      'Store and organize all your property documents: leases, invoices, contracts, receipts, and more. Everything searchable and secure.',
    actionText: 'Upload Document',
    actionRoute: '/documents',
    dismissable: true,
  },
  {
    id: 'maintenance-tip',
    route: '/maintenance',
    title: 'Maintenance Tracking',
    message:
      'Create and track maintenance tasks. Set priorities, assign vendors, and monitor completion status.',
    actionText: 'Create Task',
    actionRoute: '/maintenance',
    dismissable: true,
  },
];

export function getTipForRoute(route: string): ContextualTip | undefined {
  return CONTEXTUAL_TIPS.find((tip) => tip.route === route);
}
