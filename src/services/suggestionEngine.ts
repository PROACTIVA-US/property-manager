/**
 * Suggestion Engine - Generates context-aware AI suggestions
 */

import type { Suggestion } from '../stores/aiAssistantStore';
import { getProjects } from '../lib/projects';
import { getAllBOMs } from '../lib/bom';

interface SuggestionContext {
  currentRoute: string;
  recentActions: string[];
}

// Route-specific suggestions (static, always available)
const ROUTE_SUGGESTIONS: Record<string, Suggestion[]> = {
  '/': [
    {
      id: 'welcome-explore',
      type: 'next-step',
      priority: 'medium',
      title: 'Explore Your Properties',
      description: 'View your property portfolio and recent projects',
      actionLabel: 'Go to Properties',
      action: () => (window.location.href = '/properties'),
    },
  ],
  '/projects': [
    {
      id: 'create-ai-project',
      type: 'action',
      priority: 'high',
      title: 'Create Project with AI',
      description: 'Describe your project and get instant plans with bill of materials',
      actionLabel: 'Try AI Creator',
    },
    {
      id: 'review-phases',
      type: 'reminder',
      priority: 'medium',
      title: 'Review Project Phases',
      description: 'Check if any projects need milestone updates',
      actionLabel: 'View Projects',
    },
  ],
  '/3d-view': [
    {
      id: '3d-annotations',
      type: 'insight',
      priority: 'low',
      title: 'Add Project Annotations',
      description: 'Place markers on your 3D model to visualize project locations',
      actionLabel: 'Learn More',
    },
  ],
};

// Default fallback suggestions
const DEFAULT_SUGGESTIONS: Suggestion[] = [
  {
    id: 'keyboard-shortcuts',
    type: 'insight',
    priority: 'low',
    title: 'Keyboard Shortcuts',
    description: 'Use Cmd+K for command palette, Cmd+/ for help, Cmd+. for this assistant',
  },
];

/**
 * Generate suggestions based on current context
 */
export async function generateSuggestions(
  context: SuggestionContext
): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = [];

  // 1. Add route-specific suggestions
  const routeSuggestions = ROUTE_SUGGESTIONS[context.currentRoute] || [];
  suggestions.push(...routeSuggestions);

  // 2. Generate data-driven suggestions
  try {
    const dataSuggestions = await generateDataDrivenSuggestions();
    suggestions.push(...dataSuggestions);
  } catch (error) {
    console.error('Failed to generate data-driven suggestions:', error);
  }

  // 3. Add defaults if we have too few suggestions
  if (suggestions.length < 3) {
    suggestions.push(...DEFAULT_SUGGESTIONS);
  }

  // 4. Sort by priority and limit
  return suggestions
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 6);
}

/**
 * Generate suggestions based on actual data
 */
async function generateDataDrivenSuggestions(): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = [];

  try {
    // Check for projects without BOMs
    const projects = getProjects();
    const boms = getAllBOMs();
    const projectsWithoutBOM = projects.filter(
      (p) => !boms.find((b) => b.projectId === p.id)
    );

    if (projectsWithoutBOM.length > 0) {
      suggestions.push({
        id: 'add-bom',
        type: 'action',
        priority: 'high',
        title: `${projectsWithoutBOM.length} Projects Need BOMs`,
        description: 'Generate bills of materials for better cost tracking',
        actionLabel: 'View Projects',
        action: () => (window.location.href = '/projects'),
      });
    }

    // Check for high priority projects
    const urgentProjects = projects.filter((p) => p.priority === 'urgent');
    if (urgentProjects.length > 0) {
      suggestions.push({
        id: 'urgent-projects',
        type: 'reminder',
        priority: 'high',
        title: `${urgentProjects.length} Urgent Projects`,
        description: 'These projects require immediate attention',
        actionLabel: 'View Projects',
        action: () => (window.location.href = '/projects'),
      });
    }

    // Check for draft projects
    const draftProjects = projects.filter((p) => p.status === 'draft');
    if (draftProjects.length >= 3) {
      suggestions.push({
        id: 'draft-cleanup',
        type: 'insight',
        priority: 'medium',
        title: `${draftProjects.length} Draft Projects`,
        description: 'Consider reviewing and completing or archiving draft projects',
        actionLabel: 'Review Drafts',
        action: () => (window.location.href = '/projects'),
      });
    }
  } catch (error) {
    console.error('Error generating data-driven suggestions:', error);
  }

  return suggestions;
}
