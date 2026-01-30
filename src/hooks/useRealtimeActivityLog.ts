import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase'

type ActivityLog = Database['public']['Tables']['activity_log']['Row']

export const useRealtimeActivityLog = (limit = 10) => {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch initial activities
  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      setActivities(data || [])
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load activity log'
      console.error('Error fetching activity log:', err)
      setError(new Error(`Unable to load activity: ${errorMessage}. Please refresh the page.`))
    } finally {
      setLoading(false)
    }
  }, [limit])

  // Set up realtime subscription
  useEffect(() => {
    fetchActivities()

    const channel = supabase
      .channel('activity-log-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_log'
        },
        (payload) => {
          // Activity log change received - updating state
          
          // Smooth animation trigger with different intensity based on event type
          const event = new CustomEvent('data-update', { 
            detail: { 
              table: 'activity_log', 
              event: payload.eventType,
              intensity: payload.eventType === 'INSERT' ? 'high' : 'medium'
            }
          })
          window.dispatchEvent(event)

          // Update local state based on event type
          switch (payload.eventType) {
            case 'INSERT':
              // Add new activity at the beginning and maintain limit
              setActivities(prev => {
                const newActivities = [payload.new as ActivityLog, ...prev]
                return newActivities.slice(0, limit)
              })
              break
            case 'UPDATE':
              setActivities(prev => 
                prev.map(activity => 
                  activity.id === payload.new.id ? payload.new as ActivityLog : activity
                )
              )
              break
            case 'DELETE':
              setActivities(prev => 
                prev.filter(activity => activity.id !== payload.old.id)
              )
              break
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchActivities, limit])

  // Group activities by date
  const activitiesByDate = activities.reduce((acc, activity) => {
    const date = new Date(activity.created_at).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(activity)
    return acc
  }, {} as Record<string, ActivityLog[]>)

  return { 
    activities, 
    loading, 
    error, 
    refetch: fetchActivities,
    activitiesByDate
  }
}