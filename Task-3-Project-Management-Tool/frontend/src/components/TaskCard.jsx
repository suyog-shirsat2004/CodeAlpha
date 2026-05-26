import React from 'react';
import { format, isPast, isToday } from 'date-fns';

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
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
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow duration-200 group"
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[task.priority] || priorityColors.medium}`}>
          {task.priority}
        </span>
        {task.assignedTo && (
          <div
            className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0"
            title={task.assignedTo.name}
          >
            {task.assignedTo.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{task.title}</h4>

      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        {dueDate && (
          <span className={`text-xs flex items-center gap-1 ${
            isOverdue ? 'text-red-600 font-medium' :
            isDueToday ? 'text-amber-600 font-medium' :
            'text-gray-400 dark:text-gray-500'
          }`}>
            {isOverdue ? '⏰ ' : isDueToday ? '📅 ' : '📅 '}
            {format(dueDate, 'MMM d')}
          </span>
        )}

        <div className="flex gap-1 ml-auto">
          {task.commentCount > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">💬 {task.commentCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
