export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: 'planning' | 'in-progress' | 'review' | 'completed'
          priority: 'low' | 'medium' | 'high' | 'critical'
          created_at: string
          updated_at: string
          deadline: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: 'planning' | 'in-progress' | 'review' | 'completed'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          created_at?: string
          updated_at?: string
          deadline?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: 'planning' | 'in-progress' | 'review' | 'completed'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          created_at?: string
          updated_at?: string
          deadline?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string | null
          title: string
          description: string | null
          status: 'pending' | 'in-progress' | 'completed' | 'failed'
          priority: 'low' | 'medium' | 'high' | 'critical'
          assigned_to: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          title: string
          description?: string | null
          status?: 'pending' | 'in-progress' | 'completed' | 'failed'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          title?: string
          description?: string | null
          status?: 'pending' | 'in-progress' | 'completed' | 'failed'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      subagent_runs: {
        Row: {
          id: string
          project_id: string | null
          task_id: string | null
          name: string
          status: 'idle' | 'active' | 'completed' | 'error' | 'failed'
          task_description: string | null
          progress: number
          started_at: string
          completed_at: string | null
          estimated_completion: string | null
          tokens_used: number
          api_calls: number
          cost: number
          review_status: 'pending' | 'approved' | 'changes_requested' | 'rejected'
          output: string | null
          review_comment: string | null
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          task_id?: string | null
          name: string
          status?: 'idle' | 'active' | 'completed' | 'error' | 'failed'
          task_description?: string | null
          progress?: number
          started_at?: string
          completed_at?: string | null
          estimated_completion?: string | null
          tokens_used?: number
          api_calls?: number
          cost?: number
          review_status?: 'pending' | 'approved' | 'changes_requested' | 'rejected'
          output?: string | null
          review_comment?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          task_id?: string | null
          name?: string
          status?: 'idle' | 'active' | 'completed' | 'error' | 'failed'
          task_description?: string | null
          progress?: number
          started_at?: string
          completed_at?: string | null
          estimated_completion?: string | null
          tokens_used?: number
          api_calls?: number
          cost?: number
          review_status?: 'pending' | 'approved' | 'changes_requested' | 'rejected'
          output?: string | null
          review_comment?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
      }
      activity_log: {
        Row: {
          id: string
          type: 'agent_started' | 'agent_completed' | 'project_created' | 'task_created' | 'task_completed' | 'error' | 'review_approved' | 'review_rejected' | 'review_changes_requested'
          message: string
          project_id: string | null
          task_id: string | null
          subagent_run_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: 'agent_started' | 'agent_completed' | 'project_created' | 'task_created' | 'task_completed' | 'error' | 'review_approved' | 'review_rejected' | 'review_changes_requested'
          message: string
          project_id?: string | null
          task_id?: string | null
          subagent_run_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'agent_started' | 'agent_completed' | 'project_created' | 'task_created' | 'task_completed' | 'error' | 'review_approved' | 'review_rejected' | 'review_changes_requested'
          message?: string
          project_id?: string | null
          task_id?: string | null
          subagent_run_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}