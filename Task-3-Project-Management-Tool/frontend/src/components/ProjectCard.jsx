import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineCheckCircle, HiOutlineRefresh, HiOutlineTrash } from 'react-icons/hi';

const colorMap = {
  '#6366f1': 'from-indigo-500 to-indigo-600',
  '#ef4444': 'from-red-500 to-red-600',
  '#f59e0b': 'from-amber-500 to-amber-600',
  '#10b981': 'from-emerald-500 to-emerald-600',
  '#3b82f6': 'from-blue-500 to-blue-600',
  '#8b5cf6': 'from-violet-500 to-violet-600',
  '#ec4899': 'from-pink-500 to-pink-600',
  '#14b8a6': 'from-teal-500 to-teal-600',
};

const ProjectCard = ({ project, onDelete, onToggleStatus }) => {
  const gradient = colorMap[project.color] || 'from-indigo-500 to-indigo-600';
  const memberCount = project.members?.length || 1;

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg`}>
          {project.projectName?.charAt(0).toUpperCase()}
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            onClick={() => onToggleStatus?.(project._id, project.status)}
            title={project.status === 'completed' ? 'Reopen project' : 'Mark complete'}
          >
            {project.status === 'completed' ? (
              <HiOutlineRefresh className="w-4 h-4" />
            ) : (
              <HiOutlineCheckCircle className="w-4 h-4" />
            )}
          </button>
          <button
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            onClick={() => onDelete?.(project._id)}
            title="Delete project"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Link to={`/project/${project._id}`}>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
          {project.projectName}
        </h3>
      </Link>

      {project.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{project.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {project.members?.slice(0, 3).map((member) => (
              <div
                key={member._id}
                className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300"
                title={member.name}
              >
                {member.name?.charAt(0).toUpperCase()}
              </div>
            ))}
            {memberCount > 3 && (
              <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                +{memberCount - 3}
              </div>
            )}
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          project.status === 'active' ? 'bg-green-100 text-green-700' :
          project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {project.status}
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;
