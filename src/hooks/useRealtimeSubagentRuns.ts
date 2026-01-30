import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase'

type SubagentRun = Database['public']['Tables']['subagent_runs']['Row']

export const useRealtimeSubagentRuns = (projectId?: string) => {
  const [subagentRuns, setSubagentRuns] = useState<SubagentRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch initial subagent runs
  const fetchSubagentRuns = useCallback(async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('subagent_runs')
        .select('*')
        .order('started_at', { ascending: false })

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query

      if (error) throw error
      setSubagentRuns(data || [])
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subagent runs'
      console.error('Error fetching subagent runs:', err)
      setError(new Error(`Unable to load agent activity: ${errorMessage}. Please check your connection.`))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // Set up realtime subscription
  useEffect(() => {
    fetchSubagentRuns()

    const channel = supabase
      .channel('subagent-runs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subagent_runs'
        },
        (payload) => {
          // Subagent run change received - updating state
          
          // Smooth animation trigger
          const event = new CustomEvent('data-update', { 
            detail: { table: 'subagent_runs', event: payload.eventType }
          })
          window.dispatchEvent(event)

          // Filter by projectId if specified
          const shouldInclude = !projectId || 
            (payload.new && (payload.new as SubagentRun).project_id === projectId) ||
            (payload.old && (payload.old as SubagentRun).project_id === projectId)

          if (!shouldInclude) return

          // Update local state based on event type
          switch (payload.eventType) {
            case 'INSERT':
              setSubagentRuns(prev => [payload.new as SubagentRun, ...prev])
              break
            case 'UPDATE':
              setSubagentRuns(prev => 
                prev.map(run => 
                  run.id === payload.new.id ? payload.new as SubagentRun : run
                )
              )
              break
            case 'DELETE':
              setSubagentRuns(prev => 
                prev.filter(run => run.id !== payload.old.id)
              )
              break
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSubagentRuns, projectId])

  // Calculate derived statistics
  const activeAgents = subagentRuns.filter(run => run.status === 'active').length
  const totalCost = subagentRuns.reduce((sum, run) => sum + run.cost, 0)
  const averageProgress = subagentRuns.length > 0 
    ? subagentRuns.reduce((sum, run) => sum + run.progress, 0) / subagentRuns.length 
    : 0

  return { 
    subagentRuns, 
    loading, 
    error, 
    refetch: fetchSubagentRuns,
    stats: {
      activeAgents,
      totalCost,
      averageProgress,
      totalRuns: subagentRuns.length
    }
  }
}