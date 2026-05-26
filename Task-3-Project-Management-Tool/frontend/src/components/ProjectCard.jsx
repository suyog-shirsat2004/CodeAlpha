import React from 'react';
import { Link } from 'react-router-dom';

const colorMap = {
  '#6366f1': 'linear-gradient(135deg, #6366f1, #4f46e5)',
  '#ef4444': 'linear-gradient(135deg, #ef4444, #dc2626)',
  '#f59e0b': 'linear-gradient(135deg, #f59e0b, #d97706)',
  '#10b981': 'linear-gradient(135deg, #10b981, #059669)',
  '#3b82f6': 'linear-gradient(135deg, #3b82f6, #2563eb)',
  '#8b5cf6': 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  '#ec4899': 'linear-gradient(135deg, #ec4899, #db2777)',
  '#14b8a6': 'linear-gradient(135deg, #14b8a6, #0d9488)',
};

const ProjectCard = ({ project, onDelete, onToggleStatus }) => {
  const gradient = colorMap[project.color] || colorMap['#6366f1'];
  const memberCount = project.members?.length || 1;

  return (
    <div className="card p-3 h-100 fade-in">
      <div className="d-flex align-items-start justify-content-between mb-3">
        <div
          className="d-flex align-items-center justify-content-center rounded text-white fw-bold"
          style={{
            width: '3rem',
            height: '3rem',
            background: gradient,
            fontSize: '1.1rem',
            borderRadius: '.75rem !important',
          }}
        >
          {project.projectName?.charAt(0).toUpperCase()}
        </div>
        <div className="d-flex gap-1">
          <button
            className="btn-danger-ghost p-1 rounded"
            onClick={() => onToggleStatus?.(project._id, project.status)}
            title={project.status === 'completed' ? 'Reopen project' : 'Mark complete'}
          >
            {project.status === 'completed' ? (
              <i className="bi bi-arrow-counterclockwise"></i>
            ) : (
              <i className="bi bi-check-circle"></i>
            )}
          </button>
          <button
            className="btn-danger-ghost p-1 rounded"
            onClick={() => onDelete?.(project._id)}
            title="Delete project"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>

      <Link to={`/project/${project._id}`} className="text-decoration-none">
        <h6 className="fw-semibold text-dark mb-1">{project.projectName}</h6>
      </Link>

      {project.description && (
        <p className="small text-muted mb-3" style={{ lineClamp: 2, WebkitLineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
          {project.description}
        </p>
      )}

      <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top">
        <div className="avatar-group">
          {project.members?.slice(0, 3).map((member) => (
            <div
              key={member._id}
              className="avatar-sm rounded-circle d-flex align-items-center justify-content-center"
              style={{ backgroundColor: '#d1d5db', color: '#4b5563', fontWeight: 700, fontSize: '.6rem' }}
              title={member.name}
            >
              {member.name?.charAt(0).toUpperCase()}
            </div>
          ))}
          {memberCount > 3 && (
            <div
              className="avatar-sm rounded-circle d-flex align-items-center justify-content-center"
              style={{ backgroundColor: '#e5e7eb', color: '#6b7280', fontSize: '.6rem', fontWeight: 500 }}
            >
              +{memberCount - 3}
            </div>
          )}
        </div>
        <span className={`badge ${
          project.status === 'active' ? 'bg-success bg-opacity-10 text-success' :
          project.status === 'completed' ? 'bg-info bg-opacity-10 text-info' :
          'bg-secondary bg-opacity-10 text-secondary'
        }`}>
          {project.status}
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;
