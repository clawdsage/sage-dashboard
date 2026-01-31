import { X, Loader2, Trash2, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase'

type Project = Database['public']['Tables']['projects']['Row']

interface EditProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
  onSuccess?: () => void
  onDelete?: () => void
}

const EditProjectModal = ({ isOpen, onClose, project, onSuccess, onDelete }: EditProjectModalProps) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    priority: 'medium',
    status: 'planning',
    deadline: null
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Initialize form with project data when modal opens
  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        name: project.name,
        description: project.description,
        priority: project.priority,
        status: project.status,
        deadline: project.deadline
      })
      setErrors({})
      setSubmitError(null)
      setShowDeleteConfirm(false)
    }
  }, [project, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? e.target.value : null
    setFormData(prev => ({
      ...prev,
      deadline: value
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Project name is required'
    }

    if (formData.name && formData.name.length > 100) {
      newErrors.name = 'Project name must be less than 100 characters'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!project || !validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: formData.name,
          description: formData.description?.trim() || null,
          priority: formData.priority,
          status: formData.status,
          deadline: formData.deadline,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id)

      if (error) throw error

      // Show success notification
      window.dispatchEvent(new CustomEvent('show-notification', {
        detail: {
          type: 'success',
          message: 'Project updated successfully!'
        }
      }))

      // Trigger data update event for real-time updates
      window.dispatchEvent(new CustomEvent('data-update', {
        detail: { table: 'projects' }
      }))

      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Close modal
      onClose()

    } catch (error) {
      console.error('Error updating project:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to update project')
      
      // Show error notification
      window.dispatchEvent(new CustomEvent('show-notification', {
        detail: {
          type: 'error',
          message: 'Failed to update project'
        }
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!project) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // First, check if there are any subagent runs or tasks associated with this project
      const { data: agentRuns, error: agentRunsError } = await supabase
        .from('subagent_runs')
        .select('id')
        .eq('project_id', project.id)
        .limit(1)

      if (agentRunsError) throw agentRunsError

      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('project_id', project.id)
        .limit(1)

      if (tasksError) throw tasksError

      if (agentRuns && agentRuns.length > 0) {
        setSubmitError('Cannot delete project with active sub-agent runs. Please delete or reassign the runs first.')
        return
      }

      if (tasks && tasks.length > 0) {
        setSubmitError('Cannot delete project with tasks. Please delete or reassign the tasks first.')
        return
      }

      // Delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)

      if (error) throw error

      // Show success notification
      window.dispatchEvent(new CustomEvent('show-notification', {
        detail: {
          type: 'success',
          message: 'Project deleted successfully!'
        }
      }))

      // Trigger data update event
      window.dispatchEvent(new CustomEvent('data-update', {
        detail: { table: 'projects' }
      }))

      // Call delete callback if provided
      if (onDelete) {
        onDelete()
      }

      // Close modal
      onClose()

    } catch (error) {
      console.error('Error deleting project:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to delete project')
      
      // Show error notification
      window.dispatchEvent(new CustomEvent('show-notification', {
        detail: {
          type: 'error',
          message: 'Failed to delete project'
        }
      }))
    } finally {
      setIsSubmitting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        description: '',
        priority: 'medium',
        status: 'planning',
        deadline: null
      })
      setErrors({})
      setSubmitError(null)
      setShowDeleteConfirm(false)
      onClose()
    }
  }

  // Handle Escape key
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isSubmitting) {
          handleClose()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, isSubmitting])

  if (!isOpen || !project) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div 
          className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-background-card border border-slate-800 shadow-2xl transition-all mx-2 sm:mx-0"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800">
            <div>
              <h2 id="modal-title" className="text-lg sm:text-xl font-semibold text-white">Edit Project</h2>
              <p id="modal-description" className="text-xs sm:text-sm text-slate-400 mt-1">Update project details</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:bg-slate-800 rounded-lg"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Project Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className={`input-field w-full ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter project name"
                disabled={isSubmitting}
                autoFocus
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-2 text-sm text-red-400" role="alert">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                className="input-field w-full min-h-[80px] sm:min-h-[100px] resize-none"
                placeholder="Describe the project goals and requirements..."
                disabled={isSubmitting}
                rows={2}
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-400">{errors.description}</p>
              )}
              <p className="mt-2 text-xs text-slate-500">
                {(formData.description || '').length}/500 characters
              </p>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || 'planning'}
                onChange={handleInputChange}
                className="input-field w-full"
                disabled={isSubmitting}
              >
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority || 'medium'}
                onChange={handleInputChange}
                className="input-field w-full"
                disabled={isSubmitting}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-slate-300 mb-2">
                Deadline (Optional)
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline || ''}
                onChange={handleDateChange}
                className="input-field w-full"
                disabled={isSubmitting}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="p-3 sm:p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{submitError}</p>
              </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white mb-2">Are you sure you want to delete this project?</p>
                    <p className="text-sm text-slate-400 mb-3">This action cannot be undone. All project data will be permanently removed.</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:bg-slate-800 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:bg-red-700 rounded-lg flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3 h-3" />
                            Delete Project
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div>
                {!showDeleteConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isSubmitting}
                    className="px-4 py-3 sm:py-2 text-sm font-medium text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:bg-red-500/10 rounded-lg flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Project
                  </button>
                )}
              </div>
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-3 sm:py-2 text-sm font-medium text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed py-3 sm:py-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProjectModal