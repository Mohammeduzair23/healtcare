import { useState } from 'react';
import { FileText, Edit, Trash2, TestTube, Pill, Image } from 'lucide-react';

/**
 * Unified Record Card Component
 * Shows first N fields by default, with "Show More" to expand remaining fields
 */

// ============================================
// CONFIGURATION FOR EACH RECORD TYPE
// ============================================
const CARD_CONFIGS = {
  medical: {
    icon: FileText,
    iconColor: 'text-blue-600',
    iconBgColor: 'bg-blue-100',
    dateField: 'record_date',
    titleField: 'record_type',
    //subtitleField: 'doctor_name',
    maxVisibleFields: 2,  // ✅ Show only first 4 fields when collapsed
    files: [
      {
        field: 'softcopy_path',
        label: 'View Report',
        icon: FileText,
        color: 'text-blue-600',
        hoverColor: 'hover:text-blue-700'
      },
      {
        field: 'prescription_path',
        label: 'View Prescription',
        icon: Image,
        color: 'text-green-600',
        hoverColor: 'hover:text-green-700'
      }
    ],
    displayFields: [
      { key: 'hospital', label: 'Hospital Name'},
      { key: 'doctor_name', label: 'Doctor' },
      { key: 'record_type', label: 'Record Type' },
      { key: 'description', label: 'Description' },
      { key: 'details', label: 'Details', className: 'text-sm text-gray-600' }
    ]
  },
  
  prescription: {
    icon: Pill,
    iconColor: 'text-green-600',
    iconBgColor: 'bg-green-100',
    dateField: 'prescription_date',
    titleField: 'medicine_name',
    titleLabel: 'Medicines',
    subtitleField: 'doctor_name',
    statusField: 'status',
    maxVisibleFields: 2,
    files: [],
    displayFields: [
      { key: 'hospital', label: 'Hospital Name', priority: 1},
      { key: 'doctor_name', label: 'Doctor', priority: 5 },
      { key: 'instructions', label: 'Instructions', priority: 2 },
      { key: 'notes', label: 'Notes', priority: 3 },
      { key: 'prescription_image', label: 'View Prescription Image', priority: 4, isFile: true }
    ]
  },
  
  lab: {
    icon: TestTube,
    iconColor: 'text-purple-600',
    iconBgColor: 'bg-purple-100',
    dateField: 'lab_result_date',
    titleField: 'hospital_name',
    //subtitleField: 'doctor_name',
    maxVisibleFields: 2,
    files: [],
    displayFields: [
      { key: 'hospital_name', label: 'Hospital Name', priority: 1 },
      { key: 'doctor_name', label: 'Doctor', priority: 5 },
      { key: 'report', label: 'Report Summary', priority: 2 },
      { key: 'instructions', label: 'Instructions', priority: 3 },
      { key: 'report_path', label: 'View Lab Report', priority: 4, isFile: true }
    ]
  }
};

// Status colors for prescriptions
const STATUS_COLORS = {
  'Active': 'bg-green-100 text-green-800',
  'Completed': 'bg-blue-100 text-blue-800',
  'Expired': 'bg-gray-100 text-gray-800'
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format date for display
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Get fields to display based on expanded state
 */
const getVisibleFields = (config, record, expanded) => {
  // Filter out fields that don't have values
  const fieldsWithData = config.displayFields.filter(field => {
    const value = record[field.key];
    return value !== null && value !== undefined && value !== '';
  });

  // If collapsed, show only first N fields
  if (!expanded && config.maxVisibleFields) {
    return fieldsWithData.slice(0, config.maxVisibleFields);
  }

  // If expanded, show all fields
  return fieldsWithData;
};

/**
 * Check if there are more fields to show
 */
const hasMoreFields = (config, record) => {
  const fieldsWithData = config.displayFields.filter(field => {
    const value = record[field.key];
    return value !== null && value !== undefined && value !== '';
  });

  return fieldsWithData.length > config.maxVisibleFields;
};

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * Card Header with Icon, Title, Date, and Actions
 */
const CardHeader = ({ config, record, onEdit, onDelete }) => {
  const Icon = config.icon;
  const title = record[config.titleField];
  const subtitle = record[config.subtitleField];
  const date = record[config.dateField];
  const status = config.statusField ? record[config.statusField] : null;

  return (
    <>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start space-x-2 flex-1 min-w-0">
          <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            {config.titleLabel ? (
              <h4 className="font-semibold text-gray-800">
                <span className="font-medium">{config.titleLabel}:</span> {title}
              </h4>
            ) : (
              <h4 className="font-semibold text-gray-800 break-words">{title}</h4>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {formatDate(date)}
          </span>
          <button
            onClick={() => onEdit(record)}
            className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition"
            title="Edit record"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(record.id)}
            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
            title="Delete record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Status badge below header (for prescriptions) */}
      {status && (
        <div className="mb-4">
          <span className={`px-6 py-1 rounded-full text-xs font-medium ${
            STATUS_COLORS[status] || 'bg-black-100 text-gray-800'
          }`}>
            {status}
          </span>
        </div>
      )}
    </>
  );
};

/**
 * Display Fields Section
 */
const DisplayFields = ({ config, record, expanded }) => {
  const visibleFields = getVisibleFields(config, record, expanded);

  if (visibleFields.length === 0) return null;

  return (
    <div className="space-y-2 mb-3">
      {visibleFields.map(field => {
        const value = record[field.key];
        if (!value) return null;

        // Skip status field as it's shown in header
        if (field.isStatus) {
          return null;
        }

        // Special handling for file links
        if (field.isFile && value) {
          return (
            <div key={field.key}>
              <a
                href={`http://localhost:5000/${value}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <FileText className="w-4 h-4" />
                <span>{field.label}</span>
              </a>
            </div>
          );
        }

        // Regular field display
        return (
          <p key={field.key} className="text-gray-700">
            <span className="font-medium">{field.label}:</span> {value}
          </p>
        );
      })}
    </div>
  );
};

/**
 * File Links Section
 */
const FileLinks = ({ config, record }) => {
  // This component is no longer needed as files are now part of displayFields
  return null;
};

/**
 * Expand/Collapse Button
 */
const ExpandButton = ({ expanded, onClick, hiddenFieldsCount }) => (
  <div className="mt-3">
    <button
      onClick={onClick}
      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
    >
      {expanded ? 'Show less' : `Show more...`}
    </button>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
function UnifiedRecordCard({ type, record, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  // Get configuration for this record type
  const config = CARD_CONFIGS[type];
  
  if (!config) {
    console.error('Invalid record type:', type);
    return null;
  }

  // Check if card has more fields than visible limit
  const showExpandButton = hasMoreFields(config, record);
  
  // Calculate hidden fields count
  const totalFields = config.displayFields.filter(field => {
    const value = record[field.key];
    return value !== null && value !== undefined && value !== '';
  }).length;
  const hiddenFieldsCount = Math.max(0, totalFields - config.maxVisibleFields);

  // Handle delete with confirmation
  const handleDelete = (recordId) => {
    const recordTypeName = type === 'medical' ? 'medical record' :
                          type === 'prescription' ? 'prescription' :
                          'lab result';
    
    if (window.confirm(`Are you sure you want to delete this ${recordTypeName}?`)) {
      onDelete(recordId);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      {/* Header */}
      <CardHeader 
        config={config}
        record={record}
        onEdit={onEdit}
        onDelete={handleDelete}
      />

      {/* Doctor Name (if not in header) */}
      {config.subtitleField && record[config.subtitleField] && !config.titleLabel && (
        <p className="text-gray-600 text-sm mb-2">
          {record[config.subtitleField]}
        </p>
      )}

      {/* Display Fields */}
      <DisplayFields
        config={config}
        record={record}
        expanded={expanded}
      />

      {/* Expand/Collapse Button */}
      {showExpandButton && (
        <ExpandButton 
          expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          hiddenFieldsCount={hiddenFieldsCount}
        />
      )}
    </div>
  );
}

export default UnifiedRecordCard;