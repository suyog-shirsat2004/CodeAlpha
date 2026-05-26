import React, { useState, useEffect } from 'react';
import { projectAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ projectName: '', description: '', color: '#6366f1' });

  const colors = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const { data } = await projectAPI.getAll();
      setProjects(data);
    } catch {
      toast.error('Failed to load projects');
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newProject.projectName.trim()) {
      toast.error('Project name is required');
      return;
    }
    try {
      const { data } = await projectAPI.create(newProject);
      setProjects((prev) => [data, ...prev]);
      setShowCreate(false);
      setNewProject({ projectName: '', description: '', color: '#6366f1' });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'active' : 'completed';
    try {
      const { data } = await projectAPI.update(id, { status: newStatus });
      setProjects((prev) => prev.map((p) => (p._id === id ? data : p)));
      toast.success(newStatus === 'completed' ? 'Project completed!' : 'Project reopened');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await projectAPI.delete(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    completed: projects.filter((p) => p.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4" style={{ maxWidth: '1280px' }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h3 fw-bold text-dark">Dashboard</h1>
          <p className="text-muted small mb-0">Manage your projects and track progress</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i>
          New Project
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="card text-center p-4">
            <div className="h2 fw-bold text-primary mb-1">{stats.total}</div>
            <div className="small text-muted">Total Projects</div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card text-center p-4">
            <div className="h2 fw-bold text-success mb-1">{stats.active}</div>
            <div className="small text-muted">Active</div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card text-center p-4">
            <div className="h2 fw-bold text-info mb-1">{stats.completed}</div>
            <div className="small text-muted">Completed</div>
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-5 fade-in">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light p-4 mb-3">
            <i className="bi bi-folder-plus text-muted" style={{ fontSize: '2rem' }}></i>
          </div>
          <h5 className="fw-semibold text-dark mb-1">No projects yet</h5>
          <p className="text-muted small mb-3">Create your first project to get started</p>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary">
            Create Project
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {projects.map((project) => (
            <div key={project._id} className="col-sm-6 col-lg-4 fade-in">
              <ProjectCard project={project} onDelete={handleDelete} onToggleStatus={handleToggleStatus} />
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-semibold">Create New Project</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreate(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-medium text-secondary">Project Name</label>
                  <input
                    type="text"
                    value={newProject.projectName}
                    onChange={(e) => setNewProject((p) => ({ ...p, projectName: e.target.value }))}
                    className="form-control"
                    placeholder="My Awesome Project"
                    autoFocus
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-medium text-secondary">Description (optional)</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))}
                    className="form-control"
                    placeholder="What's this project about?"
                    rows={3}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-medium text-secondary mb-2">Color</label>
                  <div className="d-flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewProject((p) => ({ ...p, color }))}
                        className="btn p-0 rounded-circle"
                        style={{
                          width: '2rem',
                          height: '2rem',
                          backgroundColor: color,
                          outline: newProject.color === color ? '3px solid var(--primary)' : 'none',
                          outlineOffset: '2px',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowCreate(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleCreate} className="btn btn-primary">Create Project</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
