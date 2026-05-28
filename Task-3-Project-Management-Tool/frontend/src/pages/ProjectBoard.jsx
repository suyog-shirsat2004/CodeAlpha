import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI, taskAPI } from '../services/api';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import AddMemberModal from '../components/AddMemberModal';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'todo', title: 'To Do', cls: 'kanban-column-todo' },
  { id: 'in-progress', title: 'In Progress', cls: 'kanban-column-progress' },
  { id: 'review', title: 'Review', cls: 'kanban-column-review' },
  { id: 'done', title: 'Done', cls: 'kanban-column-done' },
];

const ProjectBoard = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', column: 'todo' });
  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    loadProject();
    loadTasks();
  }, [id]);

  const loadProject = async () => {
    try {
      const { data } = await projectAPI.getOne(id);
      setProject(data);
    } catch {
      toast.error('Failed to load project');
    }
  };

  const loadTasks = async () => {
    try {
      const { data } = await taskAPI.getByProject(id);
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks');
    }
    setLoading(false);
  };

  const getColumnTasks = useCallback((columnId) => {
    return tasks.filter((t) => t.status === columnId).sort((a, b) => a.order - b.order);
  }, [tasks]);

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    try {
      const { data } = await taskAPI.create(id, {
        title: newTask.title.trim(),
        status: newTask.column,
      });
      setTasks((prev) => [...prev, data]);
      setShowAddModal(false);
      setNewTask({ title: '', column: 'todo' });
      toast.success('Task created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleTaskUpdate = (updated) => {
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
  };

  const handleTaskDelete = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('task-card-dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('task-card-dragging');
    setDraggedTask(null);
  };

  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.status === columnId) return;

    const targetTasks = getColumnTasks(columnId);
    const updated = {
      ...draggedTask,
      status: columnId,
      order: targetTasks.length,
    };

    setTasks((prev) =>
      prev.map((t) => (t._id === draggedTask._id ? { ...t, status: columnId } : t))
    );

    try {
      await taskAPI.update(draggedTask._id, { status: columnId, order: targetTasks.length });
      toast.success(`Moved to ${COLUMNS.find((c) => c.id === columnId)?.title}`);
    } catch {
      loadTasks();
      toast.error('Failed to move task');
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleMemberAdded = (updatedProject) => {
    setProject(updatedProject);
    setShowMemberModal(false);
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
    <div className="d-flex flex-column" style={{ height: 'calc(100vh - 56px)' }}>
      <div className="project-header px-4 py-3">
        <div className="d-flex align-items-center justify-content-between" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="btn-ghost p-2 rounded">
              <i className="bi bi-arrow-left fs-5"></i>
            </Link>
            <div>
              <h1 className="h5 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>{project?.projectName}</h1>
              {project?.description && (
                <small className="text-secondary">{project.description}</small>
              )}
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="avatar-group">
              {project?.members?.slice(0, 4).map((member) => (
                <div
                  key={member._id}
                  className="avatar-sm rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ background: 'linear-gradient(135deg, #A78BFA, #6C5CE7)', fontWeight: 700, fontSize: '.65rem' }}
                  title={member.name}
                >
                  {member.name?.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>

            <button onClick={() => setShowMemberModal(true)} className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
              <i className="bi bi-person-plus"></i> Add Member
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow-1 overflow-auto px-4 py-3">
        <div className="d-flex gap-3 h-100" style={{ minWidth: '700px', maxWidth: '1280px', margin: '0 auto' }}>
          {COLUMNS.map((column) => {
            const columnTasks = getColumnTasks(column.id);
            return (
              <div
                key={column.id}
                className={`kanban-column ${column.cls} d-flex flex-column`}
                onDrop={(e) => handleDrop(e, column.id)}
                onDragOver={handleDragOver}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="fw-semibold mb-0 small" style={{ color: 'var(--text-primary)' }}>{column.title}</h6>
                    <span className="badge" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>{columnTasks.length}</span>
                  </div>
                  <button
                    onClick={() => {
                      setNewTask((t) => ({ ...t, column: column.id }));
                      setShowAddModal(true);
                    }}
                    className="btn-ghost p-1 rounded text-muted"
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>

                <div className="flex-grow-1 overflow-auto d-flex flex-column gap-2" style={{ minHeight: '100px' }}>
                  {columnTasks.length === 0 && (
                    <div className="text-center py-4">
                      <small style={{ color: 'var(--text-muted)' }}>No tasks</small>
                    </div>
                  )}
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onDragStart={handleDragStart}
                      onClick={setSelectedTask}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAddModal && (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-semibold">Add Task to {COLUMNS.find((c) => c.id === newTask.column)?.title}</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask((t) => ({ ...t, title: e.target.value }))}
                  className="form-control"
                  placeholder="What needs to be done?"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
                />
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={handleCreateTask} className="btn btn-primary">Add Task</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TaskModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
        projectMembers={project?.members}
      />

      <AddMemberModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        project={project}
        onMemberAdded={handleMemberAdded}
      />
    </div>
  );
};

export default ProjectBoard;
