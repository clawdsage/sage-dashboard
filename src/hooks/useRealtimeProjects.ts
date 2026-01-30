import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { retryWithBackoff, isOnline } from '../lib/retry'
import type { Database } from '../types/supabase'

type Project = Database['public']['Tables']['projects']['Row']

export const useRealtimeProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch initial projects with retry logic
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      
      // Check network connectivity
      if (!isOnline()) {
        throw new Error('NETWORK_ERROR: Unable to fetch projects. Please check your internet connection.')
      }
      
      const { data, error } = await retryWithBackoff(async () => {
        const result = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (result.error) throw result.error
        return result
      }, {
        maxRetries: 3,
        initialDelay: 1000,
        retryableErrors: ['NETWORK_ERROR', 'CONNECTION_ERROR', 'TIMEOUT']
      })

      setProjects(data || [])
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects'
      console.error('Error fetching projects:', err)
      setError(new Error(errorMessage))
    } finally {
      setLoading(false)
    }
  }, [])

  // Set up realtime subscription
  useEffect(() => {
    fetchProjects()

    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload) => {
          // Project change received - updating state
          
          // Smooth animation trigger
          const event = new CustomEvent('data-update', { 
            detail: { table: 'projects', event: payload.eventType }
          })
          window.dispatchEvent(event)

          // Update local state based on event type
          switch (payload.eventType) {
            case 'INSERT':
              setProjects(prev => [payload.new as Project, ...prev])
              break
            case 'UPDATE':
              setProjects(prev => 
                prev.map(project => 
                  project.id === payload.new.id ? payload.new as Project : project
                )
              )
              break
            case 'DELETE':
              setProjects(prev => 
                prev.filter(project => project.id !== payload.old.id)
              )
              break
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchProjects])

  return { projects, loading, error, refetch: fetchProjects }
}