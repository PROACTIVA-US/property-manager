/**
 * useRecentActivity Hook - Aggregates recent activity across projects and properties
 */

import { useState, useEffect } from 'react';
import { getProjects } from '../lib/projects';

export interface ActivityItem {
  id: string;
  type: 'property' | 'project' | 'bom' | 'vendor';
  title: string;
  description?: string;
  status?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export function useRecentActivity(limit: number = 10) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivity() {
      try {
        setLoading(true);
        setError(null);

        const allActivities: ActivityItem[] = [];

        // Fetch projects
        try {
          const projects = getProjects();
          projects.forEach((project) => {
            allActivities.push({
              id: project.id,
              type: 'project',
              title: project.title,
              description: project.description,
              status: project.status,
              createdAt: new Date(project.createdAt),
              updatedAt: new Date(project.updatedAt),
            });
          });
        } catch (err) {
          console.error('Failed to fetch projects:', err);
        }

        // Dedup by ID
        const uniqueActivities = Array.from(
          new Map(allActivities.map((item) => [item.id, item])).values()
        );

        // Sort by most recent (updatedAt or createdAt)
        uniqueActivities.sort((a, b) => {
          const aTime = a.updatedAt || a.createdAt;
          const bTime = b.updatedAt || b.createdAt;
          return bTime.getTime() - aTime.getTime();
        });

        // Limit results
        setActivities(uniqueActivities.slice(0, limit));
      } catch (err) {
        console.error('Failed to fetch activity:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, [limit]);

  return { activities, loading, error };
}
