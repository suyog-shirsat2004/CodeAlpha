import React from 'react';
import { format, isPast, isToday } from 'date-fns';

const priorityColors = {
  low: 'badge bg-secondary bg-opacity-10 text-secondary',
  medium: 'badge bg-primary bg-opacity-10 text-primary',
  high: 'badge bg-warning bg-opacity-10 text-warning',
  urgent: 'badge bg-danger bg-opacity-10 text-danger',
};

const TaskCard = ({ task, onDragStart, onClick, onDragEnd }) => {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = dueDate && isToday(dueDate);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, task)}
      onDragEnd={(e) => onDragEnd?.(e)}
      onClick={() => onClick?.(task)}
      className="task-card"
    >
      <div className="d-flex align-items-start justify-content-between mb-2">
        <span className={priorityColors[task.priority] || priorityColors.medium}>
          {task.priority}
        </span>
        {task.assignedTo && (
          <div
            className="avatar-sm rounded-circle d-flex align-items-center justify-content-center text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', fontSize: '.6rem', fontWeight: 700, width: '1.5rem', height: '1.5rem' }}
            title={task.assignedTo.name}
          >
            {task.assignedTo.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <h6 className="small fw-medium text-dark mb-1">{task.title}</h6>

      {task.description && (
        <p className="small text-muted mb-2" style={{ lineClamp: 2, WebkitLineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
          {task.description}
        </p>
      )}

      <div className="d-flex align-items-center justify-content-between mt-2">
        {dueDate && (
          <span className={`small d-flex align-items-center gap-1 ${
            isOverdue ? 'text-danger fw-medium' :
            isDueToday ? 'text-warning fw-medium' :
            'text-muted'
          }`}>
            <i className={`bi ${isOverdue ? 'bi-alarm' : 'bi-calendar'}`}></i>
            {format(dueDate, 'MMM d')}
          </span>
        )}

        {task.commentCount > 0 && (
          <span className="small text-muted"><i className="bi bi-chat me-1"></i>{task.commentCount}</span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
