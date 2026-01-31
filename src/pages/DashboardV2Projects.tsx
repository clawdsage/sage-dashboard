import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { Plus, Edit2, Trash2, Users, Calendar, ChevronDown, ChevronRight } from 'lucide-react';

type Project = Database['public']['Tables']['projects']['Row'];
type SubagentRun = Database['public']['Tables']['subagent_runs']['Row'];

interface ProjectWithAgents extends Project {
  agentCount: number;
  totalCost: number;
  expanded?: boolean;
  agents?: SubagentRun[];
}

const statusColors = {
  planning: 'text-yellow-400 bg-yellow-500/20',
  'in-progress': 'text-blue-400 bg-blue-500/20',
  review: 'text-purple-400 bg-purple-500/20',
  completed: 'text-green-400 bg-green-500/20',
};

const priorityColors = {
  low: 'text-slate-400 bg-slate-500/20',
  medium: 'text-orange-400 bg-orange-500/20',
  high: 'text-red-400 bg-red-500/20',
  critical: 'text-red-600 bg-red-600/20',
};

const DashboardV2Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectWithAgents[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithAgents | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning' as Project['status'],
    priority: 'medium' as Project['priority'],
    deadline: '',
  });

  const loadProjects = async () => {
    try {
      setLoading(true);

      // Load projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Load agent counts and costs for each project
      const projectsWithStats: ProjectWithAgents[] = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: agents, error: agentsError } = await supabase
            .from('subagent_runs')
            .select('*')
            .eq('project_id', project.id);

          if (agentsError) {
            console.error('Error loading agents for project:', agentsError);
            return { ...project, agentCount: 0, totalCost: 0, expanded: false };
          }

          const agentCount = agents?.length || 0;
          const totalCost = agents?.reduce((sum, agent) => sum + (agent.cost || 0), 0) || 0;

          return {
            ...project,
            agentCount,
            totalCost,
            expanded: false,
            agents: agents || [],
          };
        })
      );

      setProjects(projectsWithStats);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();

    // Subscribe to real-time updates
    const projectsChannel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        () => {
          loadProjects();
        }
      )
      .subscribe();

    const agentsChannel = supabase
      .channel('project-agents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subagent_runs'
        },
        () => {
          loadProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(agentsChannel);
    };
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('projects')
        .insert([{
          name: formData.name,
          description: formData.description || null,
          status: formData.status,
          priority: formData.priority,
          deadline: formData.deadline || null,
        }]);

      if (error) throw error;

      setShowCreateModal(false);
      resetForm();
      loadProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: formData.name,
          description: formData.description || null,
          status: formData.status,
          priority: formData.priority,
          deadline: formData.deadline || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingProject.id);

      if (error) throw error;

      setEditingProject(null);
      resetForm();
      loadProjects();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      deadline: '',
    });
  };

  const openEditModal = (project: ProjectWithAgents) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      deadline: project.deadline || '',
    });
  };

  const toggleExpanded = (projectId: string) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId ? { ...project, expanded: !project.expanded } : project
    ));
  };

  // Add loading state for agent operations
  const [loadingAgents, setLoadingAgents] = useState<Set<string>>(new Set());

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-100">Projects</h1>
            <p className="text-slate-400 mt-2">Manage your AI projects and track associated agents</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </header>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-400">Loading projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">No projects found</div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                {/* Project Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-100 mb-2">{project.name}</h3>
                      <p className="text-slate-400 text-sm line-clamp-2">{project.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status and Priority */}
                  <div className="flex gap-2 mb-4">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                      {project.status.replace('-', ' ')}
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors[project.priority]}`}>
                      {project.priority}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-lg font-semibold text-slate-100">{project.agentCount}</div>
                        <div className="text-xs text-slate-500">Agents</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-semibold text-slate-100">${project.totalCost.toFixed(2)}</div>
                      <div className="text-xs text-slate-500">Total Cost</div>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-4 h-4" />
                    Created {formatDate(project.created_at)}
                  </div>

                  {/* Expand Button */}
                  {project.agentCount > 0 && (
                    <button
                      onClick={() => toggleExpanded(project.id)}
                      className="flex items-center gap-2 mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {project.expanded ? (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Hide Agents
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-4 h-4" />
                          Show Agents ({project.agentCount})
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Expanded Agents List */}
                {project.expanded && project.agents && project.agents.length > 0 && (
                  <div className="border-t border-slate-800 bg-slate-900/50">
                    <div className="p-4">
                      <h4 className="font-medium text-slate-100 mb-3">Associated Agents</h4>
                      <div className="space-y-2 max-h-64 overflow-auto">
                        {project.agents.map((agent) => (
                          <div key={agent.id} className="bg-slate-800/50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-slate-100 text-sm">{agent.name}</div>
                                <div className="text-xs text-slate-400">{agent.model}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-slate-100">${agent.cost?.toFixed(2)}</div>
                                <div className="text-xs text-slate-500">
                                  {new Date(agent.started_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editingProject) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h2>

              <form onSubmit={editingProject ? handleEditProject : handleCreateProject}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-100 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Project name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-100 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                      placeholder="Project description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-100 mb-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Project['status'] }))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="planning">Planning</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-100 mb-1">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Project['priority'] }))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-100 mb-1">Deadline (Optional)</label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingProject(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-slate-700 text-slate-100 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingProject ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardV2Projects;