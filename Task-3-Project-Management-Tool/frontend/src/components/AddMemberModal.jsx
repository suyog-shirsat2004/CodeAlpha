import React, { useState } from 'react';
import { HiOutlineX, HiOutlineSearch } from 'react-icons/hi';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md z-10 mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-gray-100">Add Team Members</h2>
          <button onClick={onClose} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="input-field pl-10"
              placeholder="Search users by name or email..."
              autoFocus
            />
          </div>

          {searching && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}

          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {results.length === 0 && query.length >= 2 && !searching && (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No users found</p>
            )}
            {results.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <button onClick={() => handleAdd(user._id)} className="btn-primary text-sm py-1.5 px-3">
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
