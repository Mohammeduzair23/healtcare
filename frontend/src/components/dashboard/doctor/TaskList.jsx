import { ChevronRight } from 'lucide-react';

function TaskList({ tasks, loading, onTaskComplete }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Task List</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Task List</h2>
      
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No pending tasks</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-start gap-3 py-2">
              <input
                type="checkbox"
                checked={task.completed || false}
                onChange={() => onTaskComplete?.(task.id)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {task.title}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {task.dueDate}
                </div>
              </div>
            </div>
          ))}
          <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 pt-2">
            View More <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default TaskList;