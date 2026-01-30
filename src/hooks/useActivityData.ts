import { useEffect, useState, useCallback } from 'react'
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

  // Transform subagent runs into activity events
  const transformToActivityEvents = useCallback((runs: SubagentRun[]): ActivityEvent[] => {
    return runs.map(run => {
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
    })
  }, [projects])

  // Calculate statistics
  const calculateStats = useCallback((events: ActivityEvent[]) => {
    const spawns = events.filter(e => e.type === 'spawn').length
    const completions = events.filter(e => e.type === 'complete').length
    const errors = events.filter(e => e.type === 'error').length
    const totalCost = events.reduce((sum, e) => sum + e.cost, 0)
    const totalTokens = events.reduce((sum, e) => sum + e.tokensUsed, 0)

    setStats({
      total: events.length,
      spawns,
      completions,
      errors,
      totalCost,
      totalTokens
    })
  }, [])

  // Fetch activity data
  const fetchActivityData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Build date filter
      let dateFilter = {}
      const now = new Date()
      
      if (dateRange === 'today') {
        const startOfDay = getStartOfDay(now)
        dateFilter = { started_at: { gte: startOfDay.toISOString() } }
      } else if (dateRange === 'week') {
        const startOfWeek = getStartOfWeek(now)
        dateFilter = { started_at: { gte: startOfWeek.toISOString() } }
      } else if (dateRange === 'month') {
        const startOfMonth = getStartOfMonth(now)
        dateFilter = { started_at: { gte: startOfMonth.toISOString() } }
      }

      // Fetch subagent runs
      const { data: runs, error } = await supabase
        .from('subagent_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      // Transform to activity events
      const events = transformToActivityEvents(runs || [])
      
      // Apply filters
      let filteredEvents = events
      if (filter !== 'all') {
        filteredEvents = events.filter(event => {
          if (filter === 'spawns') return event.type === 'spawn'
          if (filter === 'completions') return event.type === 'complete'
          if (filter === 'errors') return event.type === 'error'
          return true
        })
      }

      // Apply date filter
      if (dateRange !== 'all') {
        filteredEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.timestamp)
          let startDate: Date
          
          if (dateRange === 'today') {
            startDate = getStartOfDay(now)
          } else if (dateRange === 'week') {
            startDate = getStartOfWeek(now)
          } else {
            startDate = getStartOfMonth(now)
          }
          
          return eventDate >= startDate
        })
      }

      setActivities(filteredEvents)
      calculateStats(filteredEvents)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load activity data'
      console.error('Error fetching activity data:', err)
      setError(`Unable to load activity: ${errorMessage}. Please check your connection.`)
    } finally {
      setLoading(false)
    }
  }, [filter, dateRange, limit, transformToActivityEvents, calculateStats])

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
        () => {
          // Refresh data when subagent runs change
          fetchActivityData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchProjects, fetchActivityData])

  // Set up auto-refresh every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActivityData()
    }, 20000) // 20 seconds

    return () => clearInterval(interval)
  }, [fetchActivityData])

  return {
    activities,
    loading,
    error,
    stats,
    refetch: fetchActivityData
  }
}