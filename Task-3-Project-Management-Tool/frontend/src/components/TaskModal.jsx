import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { taskAPI, commentAPI } from '../services/api';
import toast from 'react-hot-toast';

const TaskModal = ({ task, isOpen, onClose, onUpdate, onDelete, projectMembers }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'todo');
      setPriority(task.priority || 'medium');
      setAssignedTo(task.assignedTo?._id || task.assignedTo || '');
      setDueDate(task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '');
      loadComments();
    }
  }, [task]);

  const loadComments = async () => {
    if (!task) return;
    try {
      const { data } = await commentAPI.getByTask(task._id);
      setComments(data);
    } catch {
      setComments([]);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setLoading(true);
    try {
      const { data } = await taskAPI.update(task._id, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assignedTo: assignedTo || null,
        dueDate: dueDate || null,
      });
      toast.success('Task updated');
      onUpdate?.(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(task._id);
      toast.success('Task deleted');
      onDelete?.(task._id);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const { data } = await commentAPI.create(task._id, newComment.trim());
      setComments((prev) => [data, ...prev]);
      setNewComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-semibold">Edit Task</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-control form-control-lg fw-medium"
                placeholder="Task title"
              />
            </div>

            <div className="mb-3">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-control"
                placeholder="Add a description..."
                rows={3}
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <label className="form-label small fw-medium text-secondary">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select">
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="col-sm-6">
                <label className="form-label small fw-medium text-secondary">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="form-select">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="col-sm-6">
                <label className="form-label small fw-medium text-secondary">Assign To</label>
                <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="form-select">
                  <option value="">Unassigned</option>
                  {projectMembers?.map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-sm-6">
                <label className="form-label small fw-medium text-secondary">Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="form-control" />
              </div>
            </div>

            <div className="d-flex gap-2">
              <button onClick={handleSave} disabled={loading} className="btn btn-primary">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={handleDelete} className="btn btn-outline-danger d-flex align-items-center gap-1">
                <i className="bi bi-trash"></i> Delete
              </button>
            </div>

            <hr />

            <h6 className="fw-semibold text-dark mb-3">Comments ({comments.length})</h6>

            <div className="d-flex flex-column gap-3 mb-3" style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {comments.length === 0 && (
                <small className="text-muted">No comments yet.</small>
              )}
              {comments.map((comment) => (
                <div key={comment._id} className="d-flex gap-2">
                  <div
                    className="avatar-sm rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: '#fff', fontSize: '.6rem', fontWeight: 700 }}
                  >
                    {comment.user?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <div className="d-flex align-items-center gap-2">
                      <span className="small fw-semibold text-dark">{comment.user?.name}</span>
                      <span className="small text-muted">{format(new Date(comment.createdAt), 'MMM d, h:mm a')}</span>
                    </div>
                    <p className="small text-secondary mt-1 mb-0">{comment.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="input-group">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="form-control"
                placeholder="Write a comment..."
              />
              <button onClick={handleAddComment} className="btn btn-primary" disabled={!newComment.trim()}>
                <i className="bi bi-send"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
