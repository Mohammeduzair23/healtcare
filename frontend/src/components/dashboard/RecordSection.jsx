import { FileText, Upload, ImageIcon } from 'lucide-react';

function RecordSection({ 
  title, 
  loading, 
  records, 
  onAdd, 
  onBack,
  emptyIcon: EmptyIcon,
  emptyMessage,
  renderRecord
}) {
  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 text-blue-600 hover:text-blue-700 font-medium"
      >
        <span className="mt-2">← Back to Dashboard</span>
      </button>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>{title === 'My Appointments' ? 'Book Appointment' : `Add ${title}`}</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {title.toLowerCase()}...</p>
        </div>
      ) : records.length > 0 ? (
        <div className="space-y-4">
          {records.map((record) => renderRecord(record))}
        </div>
      ) : (
        <div className="text-center py-12">
          <EmptyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
          <p className="text-gray-400 text-sm mt-2">Click "Add {title}" to upload your first record</p>
        </div>
      )}
        {/* Old back to dashboard button*/}
    </div>
    </div>
  );
}

export default RecordSection;