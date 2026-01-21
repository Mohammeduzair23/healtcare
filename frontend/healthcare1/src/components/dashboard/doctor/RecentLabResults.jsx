import { ChevronRight, FileText, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

function RecentLabResults({ results, loading }) {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'normal':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-50',
          label: 'Normal'
        };
      case 'high':
      case 'elevated':
        return {
          icon: AlertTriangle,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          label: status
        };
      case 'low':
      case 'critical':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          label: status
        };
      default:
        return {
          icon: FileText,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          label: 'Pending'
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Lab Results</h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Lab Results</h2>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          See All
        </button>
      </div>
      
      {results.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No lab results available</p>
      ) : (
        <div className="space-y-3">
          {results.map((result, index) => {
            const config = getStatusConfig(result.status);
            const StatusIcon = config.icon;
            
            return (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <FileText className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {result.testName}
                    </div>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg} flex-shrink-0`}>
                  <StatusIcon className={`w-3.5 h-3.5 ${config.color}`} />
                  <span className={`text-xs font-medium ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              </div>
            );
          })}
          <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 pt-2">
            See All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default RecentLabResults;