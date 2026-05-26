import React, { useState } from 'react';
import { authAPI, projectAPI } from '../services/api';
import toast from 'react-hot-toast';

const AddMemberModal = ({ isOpen, onClose, project, onMemberAdded }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await authAPI.searchUsers(q);
      const memberIds = project.members?.map((m) => m._id) || [];
      setResults(data.filter((u) => !memberIds.includes(u._id)));
    } catch (err) {
      console.error('Search failed:', err);
      toast.error(err.response?.data?.message || 'Failed to search users');
      setResults([]);
    }
    setSearching(false);
  };

  const handleAdd = async (userId) => {
    try {
      const { data } = await projectAPI.addMember(project._id, userId);
      toast.success('Member added');
      onMemberAdded?.(data);
      setQuery('');
      setResults([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-semibold">Add Team Members</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="position-relative mb-3">
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="form-control ps-5"
                placeholder="Search users by name or email..."
                autoFocus
              />
            </div>

            {searching && (
              <div className="d-flex align-items-center justify-content-center py-4">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Searching...</span>
                </div>
              </div>
            )}

            <div className="d-flex flex-column gap-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {results.length === 0 && query.length >= 2 && !searching && (
                <p className="small text-muted text-center py-3 mb-0">No users found</p>
              )}
              {results.map((user) => (
                <div key={user._id} className="d-flex align-items-center justify-content-between p-2 rounded hover-bg">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="avatar-sm rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: '#fff', fontSize: '.7rem', fontWeight: 700 }}
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="small fw-medium text-dark mb-0">{user.name}</p>
                      <small className="text-muted">{user.email}</small>
                    </div>
                  </div>
                  <button onClick={() => handleAdd(user._id)} className="btn btn-primary btn-sm">
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
