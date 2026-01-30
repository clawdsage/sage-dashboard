import { X, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase'

type ProjectInsert = Database['public']['Tables']['projects']['Insert']

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const CreateProjectModal = ({ isOpen, onClose, onSuccess }: CreateProjectModalProps) => {
  const [formData, setFormData] = useState<ProjectInsert>({
    name: '',
    description: '',
    priority: 'medium',
    status: 'planning',
    deadline: null
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    }

    if (formData.name.length > 100) {
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
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const { error } = await supabase
        .from('projects')
        .insert([{
          ...formData,
          // Ensure description is null if empty string
          description: formData.description?.trim() || null,
          // Ensure deadline is null if empty string
          deadline: formData.deadline || null
        }])

      if (error) throw error

      // Reset form
      setFormData({
        name: '',
        description: '',
        priority: 'medium',
        status: 'planning',
        deadline: null
      })

      // Show success notification by dispatching custom event
      window.dispatchEvent(new CustomEvent('show-notification', {
        detail: {
          type: 'success',
          message: 'Project created successfully!'
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
      console.error('Error creating project:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create project')
      
      // Show error notification
      window.dispatchEvent(new CustomEvent('show-notification', {
        detail: {
          type: 'error',
          message: 'Failed to create project'
        }
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form
      setFormData({
        name: '',
        description: '',
        priority: 'medium',
        status: 'planning',
        deadline: null
      })
      setErrors({})
      setSubmitError(null)
      onClose()
    }
  }

  // Reset form when modal opens and handle Escape key
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        priority: 'medium',
        status: 'planning',
        deadline: null
      })
      setErrors({})
      setSubmitError(null)

      // Handle Escape key to close modal
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isSubmitting) {
          handleClose()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, isSubmitting])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-background-card border border-slate-800 shadow-2xl transition-all"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <div>
              <h2 id="modal-title" className="text-xl font-semibold text-white">Create New Project</h2>
              <p id="modal-description" className="text-sm text-slate-400 mt-1">Add a new project to your dashboard</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Project Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
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
                className="input-field w-full min-h-[100px] resize-none"
                placeholder="Describe the project goals and requirements..."
                disabled={isSubmitting}
                rows={3}
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-400">{errors.description}</p>
              )}
              <p className="mt-2 text-xs text-slate-500">
                {(formData.description || '').length}/500 characters
              </p>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
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
              <p className="mt-2 text-xs text-slate-500">
                Set a deadline to help prioritize work
              </p>
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{submitError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateProjectModal