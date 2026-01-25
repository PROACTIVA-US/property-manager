/**
 * Help Center Content - Categories and Articles
 */

export interface HelpCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  relatedArticles?: string[];
}

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: 'Rocket',
    description: 'New to PropertyManager? Start here to learn the basics',
  },
  {
    id: 'properties',
    name: 'Properties',
    icon: 'Building2',
    description: 'Managing your property portfolio',
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: 'Wrench',
    description: 'Maintenance and improvement projects',
  },
  {
    id: 'tenants',
    name: 'Tenants',
    icon: 'Users',
    description: 'Tenant management and communications',
  },
  {
    id: 'finances',
    name: 'Finances',
    icon: 'DollarSign',
    description: 'Budgeting, expenses, and financial tracking',
  },
  {
    id: 'shortcuts',
    name: 'Keyboard Shortcuts',
    icon: 'Keyboard',
    description: 'Work faster with keyboard shortcuts',
  },
];

export const HELP_ARTICLES: HelpArticle[] = [
  // Getting Started
  {
    id: 'welcome-overview',
    title: 'Welcome to PropertyManager',
    category: 'getting-started',
    tags: ['introduction', 'overview', 'basics'],
    content: `**PropertyManager** is your all-in-one platform for managing rental properties, maintenance projects, and tenant relationships.

**Key Features:**
- **Property Portfolio**: Track all your properties in one place
- **Project Management**: Organize maintenance and improvement projects
- **3D Viewer**: Visualize property layouts and annotate projects
- **AI Project Creator**: Generate detailed project plans with bills of materials
- **Tenant Management**: Keep track of tenant information and communications

**Getting Started:**
1. Add your properties to the system
2. Create maintenance projects as needed
3. Use the AI assistant to plan complex projects
4. Track expenses and budgets
5. Manage tenant information and responsibilities

Use **Cmd+/** to access this help center anytime, or **Cmd+.** to get AI-powered suggestions based on your current context.`,
  },
  {
    id: 'navigation-basics',
    title: 'Navigation Basics',
    category: 'getting-started',
    tags: ['navigation', 'menu', 'pages'],
    content: `**Main Navigation:**

The sidebar provides access to all major sections:

- **Welcome**: Your home dashboard with recent activity
- **Properties**: View and manage your property portfolio
- **Projects**: Track maintenance and improvement projects
- **3D View**: Interactive 3D property visualization
- **Reports**: Financial and operational reports

**Quick Actions:**

Use keyboard shortcuts for faster navigation:
- **Cmd+K**: Command palette (search anything)
- **Cmd+/**: Help center (this panel)
- **Cmd+.**: AI assistant suggestions

**Breadcrumbs:**

Follow the breadcrumb trail at the top of pages to understand your current location and navigate back.`,
  },

  // Properties
  {
    id: 'adding-properties',
    title: 'Adding Properties',
    category: 'properties',
    tags: ['property', 'add', 'create'],
    content: `**To add a new property:**

1. Navigate to the Properties page
2. Click "Add Property" button
3. Fill in the property details:
   - Address and location
   - Property type (single-family, condo, etc.)
   - Square footage
   - Number of bedrooms/bathrooms
   - Purchase price and current value

**Property Images:**

- Upload property photos for your records
- Images help with tenant communications
- Useful for insurance documentation

**Notes and Tags:**

Add notes about special features, recent renovations, or maintenance needs. Use tags to categorize properties (e.g., "needs-repair", "premium").`,
  },
  {
    id: 'property-gallery',
    title: 'Property Gallery',
    category: 'properties',
    tags: ['gallery', 'photos', 'images'],
    content: `**Property Gallery Features:**

The property gallery displays all your properties with:

- **Image Carousel**: Browse through property photos
- **Quick Stats**: See key metrics at a glance
- **Filter & Search**: Find properties quickly
- **3D View Access**: Jump to 3D visualization

**Carousel Controls:**

- Click arrows or swipe to navigate photos
- Click image to view full size
- Add/remove photos from property details

**Gallery Actions:**

- Click property card to view details
- Use "View 3D" button for interactive model
- Edit property information inline`,
  },

  // Projects
  {
    id: 'creating-projects',
    title: 'Creating Projects',
    category: 'projects',
    tags: ['project', 'create', 'maintenance'],
    content: `**Creating a New Project:**

1. Click "New Project" or "Create with AI ✨"
2. Choose manual entry or AI-assisted creation

**Manual Project Creation:**

- Enter project title and description
- Set priority (low, medium, high, urgent)
- Assign vendor if known
- Add estimated cost and timeline
- Define project phases

**AI-Assisted Creation:**

Use natural language to describe your project:

\`"Build a 12x16 deck with stairs and railing"\`

The AI will generate:
- Detailed project phases
- Complete bill of materials
- Cost estimates with tax
- Impact analysis

**Project Status:**

Track progress through these stages:
- Draft → Pending Approval → Approved → In Progress → Completed`,
  },
  {
    id: 'project-phases',
    title: 'Project Phases & Milestones',
    category: 'projects',
    tags: ['phases', 'milestones', 'timeline'],
    content: `**Project Phases:**

Break large projects into manageable phases:

- **Phase 1**: Planning and permits
- **Phase 2**: Site preparation
- **Phase 3**: Main construction
- **Phase 4**: Finishing and inspection

**Milestones:**

Each phase contains milestones (tasks):

- Mark milestones as completed
- Track progress percentage
- Set due dates
- Add notes and blockers

**Timeline View:**

The Gantt-style timeline shows:
- Phase dependencies
- Critical path
- Resource allocation
- Deadline tracking`,
  },
  {
    id: 'bill-of-materials',
    title: 'Bill of Materials (BOM)',
    category: 'projects',
    tags: ['bom', 'materials', 'costs', 'export'],
    content: `**Bill of Materials Overview:**

AI-generated projects include a complete BOM with:

- **Materials List**: All items needed, grouped by category
- **Pricing**: Unit prices and totals
- **Suppliers**: Recommended vendors
- **Waste Factor**: Built-in material overages

**BOM Categories:**

- Lumber & Framing
- Hardware & Fasteners
- Electrical
- Plumbing
- Finishing Materials
- Concrete & Masonry

**Export Options:**

Export BOM to CSV for:
- Printing shopping lists
- Sharing with contractors
- Importing into spreadsheets
- Cost tracking`,
  },

  // Tenants
  {
    id: 'tenant-responsibilities',
    title: 'Tenant Responsibilities',
    category: 'tenants',
    tags: ['tenant', 'responsibilities', 'checklist'],
    content: `**Tenant Checklist:**

Help tenants understand their responsibilities:

- **Regular Maintenance**: Change filters, test smoke alarms
- **Lawn Care**: Mowing, watering, weeding
- **Snow Removal**: Driveways and walkways
- **Pest Prevention**: Keep property clean
- **Damage Reporting**: Report issues promptly

**Communication:**

- Use the notification center for important updates
- Document all maintenance requests
- Keep records of communications
- Set expectations clearly

**Lease Compliance:**

Ensure tenants follow lease terms regarding:
- Noise levels
- Pet policies
- Guest policies
- Property modifications`,
  },

  // Finances
  {
    id: 'budget-tracking',
    title: 'Budget & Expense Tracking',
    category: 'finances',
    tags: ['budget', 'expenses', 'costs'],
    content: `**Project Budgets:**

Set and track budgets for each project:

- **Estimated Cost**: Initial budget
- **Actual Cost**: Running total of expenses
- **Variance**: Over/under budget alerts

**Expense Categories:**

Track spending by:
- Materials
- Labor
- Permits
- Equipment rental
- Contingency

**Financial Reports:**

Generate reports showing:
- Total project costs
- Cost per property
- Monthly expenses
- Year-over-year comparisons`,
  },

  // Shortcuts
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    category: 'shortcuts',
    tags: ['shortcuts', 'keyboard', 'hotkeys'],
    content: `**Global Shortcuts:**

- **Cmd+K** (Ctrl+K): Open command palette
- **Cmd+/** (Ctrl+/): Toggle help center
- **Cmd+.** (Ctrl+.): Toggle AI assistant

**Navigation:**

- **Cmd+1**: Go to Welcome
- **Cmd+2**: Go to Properties
- **Cmd+3**: Go to Projects
- **Cmd+4**: Go to 3D View

**Actions:**

- **Cmd+N**: New project
- **Cmd+S**: Save changes
- **Esc**: Close modals and panels

**Productivity Tips:**

Use keyboard shortcuts to work faster without reaching for the mouse. Most actions are accessible via **Cmd+K** command palette.`,
  },
];

// Helper Functions
export function getArticlesByCategory(categoryId: string): HelpArticle[] {
  return HELP_ARTICLES.filter((article) => article.category === categoryId);
}

export function searchArticles(query: string): HelpArticle[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  return HELP_ARTICLES.filter(
    (article) =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      article.content.toLowerCase().includes(lowerQuery)
  );
}

export function getArticleById(id: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((article) => article.id === id);
}
