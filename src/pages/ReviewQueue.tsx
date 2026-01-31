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
  ChevronDown,
  User,
  Clock,
  Filter,
  X,
  Send,
  AlertTriangle,
  Info,
  CheckSquare,
  Square,
  Trash2,
  Eye
} from 'lucide-react'

type SubagentRun = Database['public']['Tables']['subagent_runs']['Row']

interface ReviewNote {
  id: string
  author: string
  message: string
  timestamp: string
  type: 'comment' | 'status_change' | 'system'
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'changes_requested'
type FilterPriority = 'all' | 'low' | 'medium' | 'high' | 'critical'

const ReviewQueue = () => {
  const [subagentRuns, setSubagentRuns] = useState<SubagentRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  
  // Filtering
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all')
  const [showFilters, setShowFilters] = useState(false)
  
  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkActionInProgress, setBulkActionInProgress] = useState(false)
  
  // Expandable sections
  const [expandedOutputs, setExpandedOutputs] = useState<Set<string>>(new Set())
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  
  // Notes system
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({})
  const [notesData, setNotesData] = useState<Record<string, ReviewNote[]>>({})

  // Priority mapping (in real app, this would come from the database)
  const getPriority = (run: SubagentRun): 'low' | 'medium' | 'high' | 'critical' => {
    // Derive priority from cost and status
    if (run.status === 'error' || run.status === 'failed') return 'critical'
    if (run.cost > 5) return 'high'
    if (run.cost > 2) return 'medium'
    return 'low'
  }

  // Priority badge styling
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    }
  }

  // Filter subagent runs based on selected filters
  const getFilteredRuns = () => {
    return subagentRuns.filter(run => {
      // Status filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'pending' && run.review_status !== 'pending') return false
        if (filterStatus === 'approved' && run.review_status !== 'approved') return false
        if (filterStatus === 'rejected' && run.review_status !== 'rejected') return false
        if (filterStatus === 'changes_requested' && run.review_status !== 'changes_requested') return false
      }
      
      // Priority filter
      if (filterPriority !== 'all') {
        const runPriority = getPriority(run)
        if (runPriority !== filterPriority) return false
      }
      
      return true
    })
  }

  const filteredRuns = getFilteredRuns()

  // Fetch subagent runs that need review
  const fetchReviewQueue = async () => {
    try {
      setLoading(true)
      // Fetch: completed agents needing review OR failed/error agents needing triage
      const { data, error } = await supabase
        .from('subagent_runs')
        .select('*')
        .or('review_status.eq.pending,review_status.eq.approved,review_status.eq.rejected,review_status.eq.changes_requested,status.eq.error,status.eq.failed')
        .order('completed_at', { ascending: false })

      if (error) throw error
      setSubagentRuns(data || [])
      
      // Load notes for each run (simulated - in real app would be from database)
      const notesMap: Record<string, ReviewNote[]> = {}
      data?.forEach(run => {
        notesMap[run.id] = loadNotesForRun(run)
      })
      setNotesData(notesMap)
      
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load review queue'
      console.error('Error fetching review queue:', err)
      setError(`Unable to load review queue: ${errorMessage}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  // Load notes for a run (simulated - in real app would be from database)
  const loadNotesForRun = (run: SubagentRun): ReviewNote[] => {
    const notes: ReviewNote[] = []
    
    // Add initial creation note
    notes.push({
      id: `${run.id}-created`,
      author: 'system',
      message: 'Sub-agent run created',
      timestamp: run.created_at || new Date().toISOString(),
      type: 'system'
    })
    
    // Add review comment if exists
    if (run.review_comment && run.reviewed_at) {
      notes.push({
        id: `${run.id}-review`,
        author: run.reviewed_by || 'admin',
        message: run.review_comment,
        timestamp: run.reviewed_at,
        type: 'comment'
      })
    }
    
    // Add status change if reviewed
    if (run.review_status && run.review_status !== 'pending' && run.reviewed_at) {
      const statusText = run.review_status === 'approved' ? 'approved this output'
        : run.review_status === 'rejected' ? 'rejected this output'
        : 'requested changes'
      
      notes.push({
        id: `${run.id}-status`,
        author: run.reviewed_by || 'admin',
        message: statusText,
        timestamp: run.reviewed_at,
        type: 'status_change'
      })
    }
    
    return notes.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  // Set up realtime subscription and auto-refresh
  useEffect(() => {
    fetchReviewQueue()
    
    // Auto-refresh every 15 seconds
    const refreshInterval = setInterval(fetchReviewQueue, 15000)

    const channel = supabase
      .channel('review-queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subagent_runs'
        },
        (payload) => {
          // Review queue change received - updating state
          
          // Update local state based on event type
          switch (payload.eventType) {
            case 'INSERT':
              const newRun = payload.new as SubagentRun
              setSubagentRuns(prev => [newRun, ...prev])
              setNotesData(prev => ({
                ...prev,
                [newRun.id]: loadNotesForRun(newRun)
              }))
              break
            case 'UPDATE':
              setSubagentRuns(prev => {
                const updatedRun = payload.new as SubagentRun
                return prev.map(run => 
                  run.id === updatedRun.id ? updatedRun : run
                )
              })
              // Update notes
              const updatedRun = payload.new as SubagentRun
              setNotesData(prev => ({
                ...prev,
                [updatedRun.id]: loadNotesForRun(updatedRun)
              }))
              break
            case 'DELETE':
              setSubagentRuns(prev => 
                prev.filter(run => run.id !== payload.old.id)
              )
              setNotesData(prev => {
                const newNotes = { ...prev }
                delete newNotes[payload.old.id]
                return newNotes
              })
              break
          }
        }
      )
      .subscribe()

    return () => {
      clearInterval(refreshInterval)
      supabase.removeChannel(channel)
    }
  }, [])

  // Handle adding a note
  const handleAddNote = async (runId: string) => {
    const noteText = noteInputs[runId]?.trim()
    if (!noteText) return

    const newNote: ReviewNote = {
      id: `${runId}-note-${Date.now()}`,
      author: 'admin', // In real app, current user
      message: noteText,
      timestamp: new Date().toISOString(),
      type: 'comment'
    }

    // Update local state
    setNotesData(prev => ({
      ...prev,
      [runId]: [...(prev[runId] || []), newNote]
    }))

    // Clear input
    setNoteInputs(prev => {
      const newInputs = { ...prev }
      delete newInputs[runId]
      return newInputs
    })

    // In real app, would save to database here
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      // Would actually save note to database
    } catch (err) {
      console.error('Error saving note:', err)
    }
  }

  // Handle review action for single item
  const handleReviewAction = async (
    runId: string, 
    action: 'approve' | 'reject' | 'request_changes'
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

      const run = subagentRuns.find(r => r.id === runId)

      // Update the subagent run
      const { error: updateError } = await supabase
        .from('subagent_runs')
        .update({
          review_status: reviewStatus,
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
          message: `${activityMessage}: ${run?.name}`,
          subagent_run_id: runId,
          project_id: run?.project_id || null,
          task_id: run?.task_id || null
        })

      if (activityError) throw activityError

      // Add status change note
      const statusNote: ReviewNote = {
        id: `${runId}-status-${Date.now()}`,
        author: 'admin',
        message: `${activityMessage.toLowerCase()}`,
        timestamp: new Date().toISOString(),
        type: 'status_change'
      }

      setNotesData(prev => ({
        ...prev,
        [runId]: [...(prev[runId] || []), statusNote]
      }))

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error updating review status:', err)
      alert(`Failed to ${action} output: ${errorMessage}. Please try again.`)
    } finally {
      setUpdatingId(null)
    }
  }

  // Handle bulk actions
  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedIds.size === 0) return

    const confirmMessage = `Are you sure you want to ${action} ${selectedIds.size} item(s)?`
    if (!confirm(confirmMessage)) return

    setBulkActionInProgress(true)

    try {
      const promises = Array.from(selectedIds).map(id => 
        handleReviewAction(id, action)
      )
      
      await Promise.all(promises)
      
      // Clear selection
      setSelectedIds(new Set())
    } catch (err) {
      console.error('Error performing bulk action:', err)
      alert('Some items may not have been updated. Please check and try again.')
    } finally {
      setBulkActionInProgress(false)
    }
  }

  // Toggle selection
  const toggleSelection = (runId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(runId)) {
        newSet.delete(runId)
      } else {
        newSet.add(runId)
      }
      return newSet
    })
  }

  // Select all filtered
  const selectAllFiltered = () => {
    const allIds = new Set(filteredRuns.map(run => run.id))
    setSelectedIds(allIds)
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  // Toggle output expansion
  const toggleOutputExpansion = (runId: string) => {
    setExpandedOutputs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(runId)) {
        newSet.delete(runId)
      } else {
        newSet.add(runId)
      }
      return newSet
    })
  }

  // Toggle notes expansion
  const toggleNotesExpansion = (runId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(runId)) {
        newSet.delete(runId)
      } else {
        newSet.add(runId)
      }
      return newSet
    })
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Review Queue</h1>
          <p className="text-slate-400 mt-2">
            Review and approve sub-agent outputs
            {filteredRuns.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-slate-800 rounded text-sm">
                {filteredRuns.length} {filterStatus !== 'all' || filterPriority !== 'all' ? 'filtered' : 'total'}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showFilters ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filterStatus !== 'all' || filterPriority !== 'all') && (
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </button>
          <button
            onClick={fetchReviewQueue}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Filters</h3>
            <button
              onClick={() => {
                setFilterStatus('all')
                setFilterPriority('all')
              }}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Review Status
              </label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'pending', 'approved', 'rejected', 'changes_requested'] as FilterStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === status
                        ? 'bg-primary text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'critical', 'high', 'medium', 'low'] as FilterPriority[]).map(priority => (
                  <button
                    key={priority}
                    onClick={() => setFilterPriority(priority)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterPriority === priority
                        ? 'bg-primary text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-primary/10 border border-primary rounded-xl p-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-primary" />
            <span className="text-white font-medium">
              {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleBulkAction('approve')}
              disabled={bulkActionInProgress}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {bulkActionInProgress ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Approve All
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              disabled={bulkActionInProgress}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {bulkActionInProgress ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Reject All
            </button>
            <button
              onClick={clearSelection}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Select All Button */}
      {filteredRuns.length > 0 && selectedIds.size === 0 && (
        <div className="flex justify-end">
          <button
            onClick={selectAllFiltered}
            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            Select All ({filteredRuns.length})
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredRuns.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <FileText className="w-16 h-16 text-slate-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {filterStatus !== 'all' || filterPriority !== 'all' 
              ? 'No matching outputs found'
              : 'No outputs pending review'
            }
          </h3>
          <p className="text-slate-400 max-w-md">
            {filterStatus !== 'all' || filterPriority !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'All completed sub-agent outputs have been reviewed. New outputs will appear here when they\'re ready for review.'
            }
          </p>
        </div>
      )}

      {/* Review Cards */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6">
        {filteredRuns.map((run) => {
          const priority = getPriority(run)
          const isExpanded = expandedOutputs.has(run.id)
          const isNotesExpanded = expandedNotes.has(run.id)
          const isSelected = selectedIds.has(run.id)
          const runNotes = notesData[run.id] || []
          
          return (
            <div
              key={run.id}
              className={`bg-slate-800/50 rounded-xl border transition-all ${
                isSelected 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 lg:p-6 border-b border-slate-700">
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  <button
                    onClick={() => toggleSelection(run.id)}
                    className="flex-shrink-0 mt-1"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500 hover:text-slate-300 transition-colors" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-white truncate">{run.name}</h3>
                          
                          {/* Priority Badge */}
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityStyle(priority)}`}>
                            {priority.toUpperCase()}
                          </span>
                          
                          {/* Status Badge */}
                          {run.review_status && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              run.review_status === 'approved' ? 'bg-green-500/20 text-green-400'
                              : run.review_status === 'rejected' ? 'bg-red-500/20 text-red-400'
                              : run.review_status === 'changes_requested' ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-slate-500/20 text-slate-400'
                            }`}>
                              {run.review_status.replace('_', ' ').toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2 mt-1">
                          {run.task_description || 'No description provided'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-slate-400 text-xs">Completed</div>
                          <div className="text-white truncate">{formatDate(run.completed_at)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div>
                          <div className="text-slate-400 text-xs">Cost</div>
                          <div className="text-white">{formatCost(run.cost)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Hash className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div>
                          <div className="text-slate-400 text-xs">Tokens</div>
                          <div className="text-white">{run.tokens_used.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div>
                          <div className="text-slate-400 text-xs">API Calls</div>
                          <div className="text-white">{run.api_calls}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Output Section */}
              <div className="border-b border-slate-700">
                <button
                  onClick={() => toggleOutputExpansion(run.id)}
                  className="w-full p-4 lg:p-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                      Output {run.output ? `(${run.output.length} chars)` : ''}
                    </h4>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="px-4 lg:px-6 pb-4 lg:pb-6">
                    <div className="bg-slate-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                      {run.output ? (
                        <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                          {run.output}
                        </pre>
                      ) : (
                        <p className="text-slate-500 italic">No output available</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div className="border-b border-slate-700">
                <button
                  onClick={() => toggleNotesExpansion(run.id)}
                  className="w-full p-4 lg:p-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                      Review Notes ({runNotes.length})
                    </h4>
                  </div>
                  {isNotesExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                
                {isNotesExpanded && (
                  <div className="px-4 lg:px-6 pb-4 lg:pb-6 space-y-4">
                    {/* Notes Thread */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {runNotes.map(note => (
                        <div key={note.id} className={`p-3 rounded-lg ${
                          note.type === 'system' ? 'bg-slate-800/50'
                          : note.type === 'status_change' ? 'bg-primary/10'
                          : 'bg-slate-900'
                        }`}>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">{note.author}</span>
                              {note.type === 'status_change' && (
                                <AlertCircle className="w-3 h-3 text-primary" />
                              )}
                            </div>
                            <span className="text-xs text-slate-400 whitespace-nowrap">
                              {formatDate(note.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300">{note.message}</p>
                        </div>
                      ))}
                      
                      {runNotes.length === 0 && (
                        <p className="text-slate-500 italic text-sm text-center py-4">
                          No notes yet. Add a note below.
                        </p>
                      )}
                    </div>

                    {/* Add Note Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={noteInputs[run.id] || ''}
                        onChange={(e) => setNoteInputs(prev => ({
                          ...prev,
                          [run.id]: e.target.value
                        }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleAddNote(run.id)
                          }
                        }}
                        placeholder="Add a review note..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      />
                      <button
                        onClick={() => handleAddNote(run.id)}
                        disabled={!noteInputs[run.id]?.trim()}
                        className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleReviewAction(run.id, 'approve')}
                    disabled={updatingId === run.id || run.review_status === 'approved'}
                    className="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    {updatingId === run.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span className="truncate">
                      {run.review_status === 'approved' ? 'Approved' : 'Approve'}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleReviewAction(run.id, 'request_changes')}
                    disabled={updatingId === run.id || run.review_status === 'changes_requested'}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    {updatingId === run.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span className="truncate">
                      {run.review_status === 'changes_requested' ? 'Changes Requested' : 'Request Changes'}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleReviewAction(run.id, 'reject')}
                    disabled={updatingId === run.id || run.review_status === 'rejected'}
                    className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    {updatingId === run.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span className="truncate">
                      {run.review_status === 'rejected' ? 'Rejected' : 'Reject'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ReviewQueue
