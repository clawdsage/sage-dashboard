import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase'
import { formatRelativeTime, getStartOfDay, getStartOfWeek, getStartOfMonth } from '../utils/formatTime'

type SubagentRun = Database['public']['Tables']['subagent_runs']['Row']
type Project = Database['public']['Tables']['projects']['Row']

export type ActivityEvent = {
  id: string
  type: 'spawn' | 'complete' | 'error'
  timestamp: string
  relativeTime: string
  agentName: string
  description: string
  projectId: string | null
  projectName?: string
  status: string
  progress: number
  tokensUsed: number
  cost: number
  startedAt: string
  completedAt: string | null
}

export type DateRange = 'today' | 'week' | 'month' | 'all'

export const useActivityData = (
  filter: 'all' | 'spawns' | 'completions' | 'errors' = 'all',
  dateRange: DateRange = 'all',
  limit: number = 50
) => {
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [projects, setProjects] = useState<Record<string, Project>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    spawns: 0,
    completions: 0,
    errors: 0,
    totalCost: 0,
    totalTokens: 0
  })

  // Store all runs and their transformed activities for incremental updates
  const allRunsRef = useRef<SubagentRun[]>([])
  const allActivitiesRef = useRef<ActivityEvent[]>([])
  // Debounce timer for rapid updates
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch projects for mapping project IDs to names
  const fetchProjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
      
      if (error) throw error
      
      const projectMap: Record<string, Project> = {}
      data?.forEach(project => {
        projectMap[project.id] = project
      })
      setProjects(projectMap)
    } catch (err) {
      console.error('Error fetching projects:', err)
    }
  }, [])

  // Transform a single subagent run into an activity event
  const transformToActivityEvent = useCallback((run: SubagentRun): ActivityEvent => {
    let type: 'spawn' | 'complete' | 'error' = 'spawn'
    let description = ''
    let timestamp = run.started_at
    
    if (run.status === 'completed' && run.completed_at) {
      type = 'complete'
      description = `Completed ${run.name}`
      timestamp = run.completed_at
    } else if (run.status === 'failed' || run.status === 'error') {
      type = 'error'
      description = `${run.name} encountered an error`
      timestamp = run.completed_at || run.started_at
    } else if (run.status === 'active') {
      type = 'spawn'
      description = `Spawned ${run.name}`
    } else {
      type = 'spawn'
      description = `Started ${run.name}`
    }

    return {
      id: run.id,
      type,
      timestamp,
      relativeTime: formatRelativeTime(timestamp),
      agentName: run.name,
      description,
      projectId: run.project_id,
      projectName: run.project_id ? projects[run.project_id]?.name : undefined,
      status: run.status,
      progress: run.progress,
      tokensUsed: run.tokens_used || 0,
      cost: run.cost || 0,
      startedAt: run.started_at,
      completedAt: run.completed_at
    }
  }, [projects])

  // Apply filters to activities
  const applyFilters = useCallback((activities: ActivityEvent[]) => {
    let filtered = activities
    
    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(event => {
        if (filter === 'spawns') return event.type === 'spawn'
        if (filter === 'completions') return event.type === 'complete'
        if (filter === 'errors') return event.type === 'error'
        return true
      })
    }

    // Apply date filter
    if (dateRange !== 'all') {
      const now = new Date()
      let startDate: Date
      
      if (dateRange === 'today') {
        startDate = getStartOfDay(now)
      } else if (dateRange === 'week') {
        startDate = getStartOfWeek(now)
      } else {
        startDate = getStartOfMonth(now)
      }
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.timestamp)
        return eventDate >= startDate
      })
    }

    // Apply limit
    return filtered.slice(0, limit)
  }, [filter, dateRange, limit])

  // Calculate statistics from filtered activities
  const calculateStats = useCallback((filteredActivities: ActivityEvent[]) => {
    const spawns = filteredActivities.filter(e => e.type === 'spawn').length
    const completions = filteredActivities.filter(e => e.type === 'complete').length
    const errors = filteredActivities.filter(e => e.type === 'error').length
    const totalCost = filteredActivities.reduce((sum, e) => sum + e.cost, 0)
    const totalTokens = filteredActivities.reduce((sum, e) => sum + e.tokensUsed, 0)

    return {
      total: filteredActivities.length,
      spawns,
      completions,
      errors,
      totalCost,
      totalTokens
    }
  }, [])

  // Update filtered activities and stats
  const updateFilteredActivities = useCallback(() => {
    const filtered = applyFilters(allActivitiesRef.current)
    
    // Only update if the filtered activities have actually changed
    setActivities(prev => {
      // Quick check: if lengths differ, definitely update
      if (prev.length !== filtered.length) return filtered
      
      // Deep comparison: check if any activity has changed
      for (let i = 0; i < filtered.length; i++) {
        if (prev[i]?.id !== filtered[i]?.id) return filtered
        // Check if any important properties have changed
        if (
          prev[i]?.type !== filtered[i]?.type ||
          prev[i]?.status !== filtered[i]?.status ||
          prev[i]?.progress !== filtered[i]?.progress ||
          prev[i]?.cost !== filtered[i]?.cost ||
          prev[i]?.tokensUsed !== filtered[i]?.tokensUsed
        ) {
          return filtered
        }
      }
      
      // No changes detected, return previous array to prevent re-render
      return prev
    })
    
    // Always update stats since they're derived from filtered activities
    setStats(calculateStats(filtered))
  }, [applyFilters, calculateStats])

  // Fetch initial activity data
  const fetchActivityData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch subagent runs
      const { data: runs, error } = await supabase
        .from('subagent_runs')
        .select('*')
        .order('started_at', { ascending: false })

      if (error) throw error

      // Store all runs
      allRunsRef.current = runs || []
      
      // Transform to activity events
      const events = allRunsRef.current.map(run => transformToActivityEvent(run))
      allActivitiesRef.current = events
      
      // Update filtered activities
      updateFilteredActivities()
      
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load activity data'
      console.error('Error fetching activity data:', err)
      setError(`Unable to load activity: ${errorMessage}. Please check your connection.`)
    } finally {
      setLoading(false)
    }
  }, [transformToActivityEvent, updateFilteredActivities])

  // Handle realtime updates with debouncing
  const handleRealtimeUpdate = useCallback((payload: any) => {
    // Smooth animation trigger
    const event = new CustomEvent('data-update', { 
      detail: { table: 'subagent_runs', event: payload.eventType }
    })
    window.dispatchEvent(event)

    switch (payload.eventType) {
      case 'INSERT': {
        const newRun = payload.new as SubagentRun
        // Add to runs array
        allRunsRef.current = [newRun, ...allRunsRef.current]
        break
      }
      
      case 'UPDATE': {
        const updatedRun = payload.new as SubagentRun
        // Update in runs array
        allRunsRef.current = allRunsRef.current.map(run => 
          run.id === updatedRun.id ? updatedRun : run
        )
        break
      }
      
      case 'DELETE': {
        const deletedRun = payload.old as SubagentRun
        // Remove from runs array
        allRunsRef.current = allRunsRef.current.filter(
          run => run.id !== deletedRun.id
        )
        break
      }
    }
    
    // Re-transform all runs to activities
    allActivitiesRef.current = allRunsRef.current.map(run => transformToActivityEvent(run))
    
    // Debounce the filtered activities update to prevent rapid re-renders
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current)
    }
    
    updateTimerRef.current = setTimeout(() => {
      updateFilteredActivities()
    }, 100) // 100ms debounce
  }, [transformToActivityEvent, updateFilteredActivities])

  // Set up realtime subscription
  useEffect(() => {
    fetchProjects()
    fetchActivityData()

    const channel = supabase
      .channel('activity-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subagent_runs'
        },
        handleRealtimeUpdate
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current)
      }
    }
  }, [fetchProjects, fetchActivityData, handleRealtimeUpdate])

  // Update when filters change
  useEffect(() => {
    updateFilteredActivities()
  }, [filter, dateRange, limit, updateFilteredActivities])

  // Refresh activities when projects change (to update project names)
  useEffect(() => {
    if (Object.keys(projects).length > 0 && allRunsRef.current.length > 0) {
      // Re-transform all runs with updated project data
      allActivitiesRef.current = allRunsRef.current.map(run => transformToActivityEvent(run))
      updateFilteredActivities()
    }
  }, [projects, transformToActivityEvent, updateFilteredActivities])

  return {
    activities,
    loading,
    error,
    stats,
    refetch: () => fetchActivityData()
  }
}