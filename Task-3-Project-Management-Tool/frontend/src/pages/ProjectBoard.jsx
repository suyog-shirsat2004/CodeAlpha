import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI, taskAPI } from '../services/api';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import AddMemberModal from '../components/AddMemberModal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineArrowLeft, HiOutlineUserAdd, HiOutlineDotsHorizontal } from 'react-icons/hi';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100 dark:bg-gray-800/50' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'review', title: 'Review', color: 'bg-amber-50 dark:bg-amber-900/20' },
  { id: 'done', title: 'Done', color: 'bg-green-50 dark:bg-green-900/20' },
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
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <HiOutlineArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{project?.projectName}</h1>
                {project?.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{project.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 mr-2">
                {project?.members?.slice(0, 4).map((member) => (
                  <div
                    key={member._id}
                    className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300"
                    title={member.name}
                  >
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowMemberModal(true)}
                className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1"
              >
                <HiOutlineUserAdd className="w-4 h-4" /> Add Member
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex gap-6 h-full" style={{ minWidth: '700px' }}>
          {COLUMNS.map((column) => {
            const columnTasks = getColumnTasks(column.id);
            return (
              <div
                key={column.id}
                className={`flex-1 flex flex-col rounded-xl ${column.color} p-4 min-w-[250px]`}
                onDrop={(e) => handleDrop(e, column.id)}
                onDragOver={handleDragOver}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{column.title}</h3>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-2 py-0.5 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setNewTask((t) => ({ ...t, column: column.id }));
                      setShowAddModal(true);
                    }}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 rounded hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <HiOutlinePlus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
                  {columnTasks.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-400 dark:text-gray-500">No tasks</p>
                    </div>
                  )}
                  {columnTasks.map((task) => (
                    <div key={task._id}>
                      <TaskCard
                        task={task}
                        onDragStart={handleDragStart}
                        onClick={setSelectedTask}
                        onDragEnd={handleDragEnd}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md z-10 mx-4 p-6">
            <h2 className="text-lg font-semibold dark:text-gray-100 mb-4">
              Add Task to {COLUMNS.find((c) => c.id === newTask.column)?.title}
            </h2>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask((t) => ({ ...t, title: e.target.value }))}
              className="input-field mb-4"
              placeholder="What needs to be done?"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
            />
            <div className="flex gap-3">
              <button onClick={handleCreateTask} className="btn-primary flex-1">Add Task</button>
              <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">Cancel</button>
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
