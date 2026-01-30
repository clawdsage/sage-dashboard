import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const usePendingReviewCount = () => {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch initial count
  const fetchCount = async () => {
    try {
      setLoading(true)
      const { count, error } = await supabase
        .from('subagent_runs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .eq('review_status', 'pending')

      if (error) throw error
      setCount(count || 0)
    } catch (err) {
      console.error('Error fetching pending review count:', err)
    } finally {
      setLoading(false)
    }
  }

  // Set up realtime subscription
  useEffect(() => {
    fetchCount()

    const channel = supabase
      .channel('pending-review-count-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subagent_runs',
          filter: 'status=eq.completed'
        },
        () => {
          // Refetch count when subagent_runs change
          fetchCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { count, loading }
}