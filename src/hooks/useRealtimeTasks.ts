import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase'

type Task = Database['public']['Tables']['tasks']['Row']

export const useRealtimeTasks = (projectId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch initial tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query

      if (error) throw error
      setTasks(data || [])
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks'
      console.error('Error fetching tasks:', err)
      setError(new Error(`Unable to load tasks: ${errorMessage}. Please try again.`))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // Set up realtime subscription
  useEffect(() => {
    fetchTasks()

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          // Task change received - updating state
          
          // Smooth animation trigger
          const event = new CustomEvent('data-update', { 
            detail: { table: 'tasks', event: payload.eventType }
          })
          window.dispatchEvent(event)

          // Filter by projectId if specified
          const shouldInclude = !projectId || 
            (payload.new && (payload.new as Task).project_id === projectId) ||
            (payload.old && (payload.old as Task).project_id === projectId)

          if (!shouldInclude) return

          // Update local state based on event type
          switch (payload.eventType) {
            case 'INSERT':
              setTasks(prev => [payload.new as Task, ...prev])
              break
            case 'UPDATE':
              setTasks(prev => 
                prev.map(task => 
                  task.id === payload.new.id ? payload.new as Task : task
                )
              )
              break
            case 'DELETE':
              setTasks(prev => 
                prev.filter(task => task.id !== payload.old.id)
              )
              break
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTasks, projectId])

  return { tasks, loading, error, refetch: fetchTasks }
}