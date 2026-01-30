import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase'
import { 
  CheckCircle, 
  RefreshCw, 
  XCircle, 
  MessageSquare,
  Loader2,
  FileText,
  Calendar,
  DollarSign,
  Hash,
  AlertCircle,
  ChevronRight,
  User,
  Clock
} from 'lucide-react'

type SubagentRun = Database['public']['Tables']['subagent_runs']['Row']

const ReviewQueue = () => {
  const [subagentRuns, setSubagentRuns] = useState<SubagentRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})

  // Fetch subagent runs that need review
  const fetchReviewQueue = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('subagent_runs')
        .select('*')
        .eq('status', 'completed')
        .eq('review_status', 'pending')
        .order('completed_at', { ascending: false })

      if (error) throw error
      setSubagentRuns(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching review queue:', err)
      setError(err instanceof Error ? err.message : 'Failed to load review queue')
    } finally {
      setLoading(false)
    }
  }

  // Set up realtime subscription
  useEffect(() => {
    fetchReviewQueue()

    const channel = supabase
      .channel('review-queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subagent_runs',
          filter: 'status=eq.completed'
        },
        (payload) => {
          console.log('Review queue change received:', payload)
          
          // Update local state based on event type
          switch (payload.eventType) {
            case 'INSERT':
              if (payload.new.review_status === 'pending') {
                setSubagentRuns(prev => [payload.new as SubagentRun, ...prev])
              }
              break
            case 'UPDATE':
              setSubagentRuns(prev => {
                const updatedRun = payload.new as SubagentRun
                // Remove if no longer pending review
                if (updatedRun.review_status !== 'pending') {
                  return prev.filter(run => run.id !== updatedRun.id)
                }
                // Update if still pending
                return prev.map(run => 
                  run.id === updatedRun.id ? updatedRun : run
                )
              })
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
  }, [])

  // Handle review action
  const handleReviewAction = async (
    runId: string, 
    action: 'approve' | 'reject' | 'request_changes',
    comment?: string
  ) => {
    try {
      setUpdatingId(runId)
      
      const reviewStatus = action === 'approve' ? 'approved' 
        : action === 'reject' ? 'rejected' 
        : 'changes_requested'
      
      const activityType = action === 'approve' ? 'review_approved'
        : action === 'reject' ? 'review_rejected'
        : 'review_changes_requested'
      
      const activityMessage = action === 'approve' ? 'Output approved'
        : action === 'reject' ? 'Output rejected'
        : 'Changes requested'

      // Update the subagent run
      const { error: updateError } = await supabase
        .from('subagent_runs')
        .update({
          review_status: reviewStatus,
          review_comment: comment || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin' // In a real app, this would be the current user
        })
        .eq('id', runId)

      if (updateError) throw updateError

      // Log to activity log
      const { error: activityError } = await supabase
        .from('activity_log')
        .insert({
          type: activityType,
          message: `${activityMessage}: ${subagentRuns.find(r => r.id === runId)?.name}`,
          subagent_run_id: runId,
          project_id: subagentRuns.find(r => r.id === runId)?.project_id || null,
          task_id: subagentRuns.find(r => r.id === runId)?.task_id || null
        })

      if (activityError) throw activityError

      // Clear comment input
      setCommentInputs(prev => {
        const newInputs = { ...prev }
        delete newInputs[runId]
        return newInputs
      })

    } catch (err) {
      console.error('Error updating review status:', err)
      alert(`Failed to ${action} output: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setUpdatingId(null)
    }
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format cost
  const formatCost = (cost: number) => {
    return `$${cost.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <div className="mt-4 text-slate-400">Loading review queue...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div className="mt-4 text-red-400">{error}</div>
          <button
            onClick={fetchReviewQueue}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Review Queue</h1>
          <p className="text-slate-400 mt-2">
            Review and approve sub-agent outputs
            {subagentRuns.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-slate-800 rounded text-sm">
                {subagentRuns.length} pending
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchReviewQueue}
          className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Empty State */}
      {subagentRuns.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <FileText className="w-16 h-16 text-slate-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No outputs pending review</h3>
          <p className="text-slate-400 max-w-md">
            All completed sub-agent outputs have been reviewed. New outputs will appear here when they're ready for review.
          </p>
        </div>
      )}

      {/* Review Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {subagentRuns.map((run) => (
          <div
            key={run.id}
            className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-4 lg:p-6 border-b border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start lg:items-center gap-3 mb-2">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base lg:text-lg font-semibold text-white truncate">{run.name}</h3>
                      <p className="text-xs lg:text-sm text-slate-400 line-clamp-2">
                        {run.task_description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mt-4">
                    <div className="flex items-center gap-2 text-xs lg:text-sm">
                      <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-300">Completed:</span>
                      <span className="text-white truncate">{formatDate(run.completed_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs lg:text-sm">
                      <DollarSign className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-300">Cost:</span>
                      <span className="text-white">{formatCost(run.cost)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs lg:text-sm">
                      <Hash className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-300">Tokens:</span>
                      <span className="text-white">{run.tokens_used.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs lg:text-sm">
                      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-300">API Calls:</span>
                      <span className="text-white">{run.api_calls}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Output Preview */}
            <div className="p-4 lg:p-6 border-b border-slate-700">
              <h4 className="text-xs lg:text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Output
              </h4>
              <div className="bg-slate-900 rounded-lg p-3 lg:p-4 max-h-48 lg:max-h-60 overflow-y-auto">
                {run.output ? (
                  <pre className="text-xs lg:text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {run.output.length > 800 
                      ? `${run.output.substring(0, 800)}...` 
                      : run.output}
                  </pre>
                ) : (
                  <p className="text-slate-500 italic">No output available</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 lg:p-6">
              <div className="space-y-4">
                {/* Comment Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Feedback (optional)
                  </label>
                  <textarea
                    value={commentInputs[run.id] || ''}
                    onChange={(e) => setCommentInputs(prev => ({
                      ...prev,
                      [run.id]: e.target.value
                    }))}
                    placeholder="Add feedback for the sub-agent..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                    rows={2}
                    inputMode="text"
                    enterKeyHint="done"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleReviewAction(run.id, 'approve', commentInputs[run.id])}
                    disabled={updatingId === run.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    {updatingId === run.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span className="truncate">Approve</span>
                  </button>
                  
                  <button
                    onClick={() => handleReviewAction(run.id, 'request_changes', commentInputs[run.id])}
                    disabled={updatingId === run.id}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    {updatingId === run.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span className="truncate">Request Changes</span>
                  </button>
                  
                  <button
                    onClick={() => handleReviewAction(run.id, 'reject', commentInputs[run.id])}
                    disabled={updatingId === run.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    {updatingId === run.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span className="truncate">Reject</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReviewQueue