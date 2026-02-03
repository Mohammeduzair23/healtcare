import { useState } from 'react';
import { FileText, Edit, Trash2, TestTube, Pill, Image } from 'lucide-react';

/**
 * FINAL FIXED VERSION - Displays data from backend correctly with URL validation
 */

// ============================================
// CONFIGURATION FOR EACH RECORD TYPE
// ============================================
const CARD_CONFIGS = {
  medical: {
    icon: FileText,
    iconColor: 'text-blue-600',
    iconBgColor: 'bg-blue-100',
    dateField: 'recordDate',
    titleField: 'recordType',
    maxVisibleFields: 4,
    files: [],
    displayFields: [
      { key: 'hospital', label: 'Hospital Name'},
      { key: 'doctorName', label: 'Doctor' },
      { key: 'recordType', label: 'Record Type' },
      { key: 'description', label: 'Description' },
      { key: 'details', label: 'Details' },
      { key: 'softcopyPath', label: 'View Medical Report', isFile: true, hoverColor: 'hover:text-green-700' },
      { key: 'prescriptionPath', label: 'View Prescription', isFile: true }
    ]
  },
  
  prescription: {
    icon: Pill,
    iconColor: 'text-green-600',
    iconBgColor: 'bg-green-100',
    dateField: 'prescriptionDate',
    titleField: 'medicineName',
    titleLabel: 'Medicines',
    subtitleField: 'doctorName',
    statusField: 'status',
    maxVisibleFields: 4,
    files: [],
    displayFields: [
      { key: 'hospital', label: 'Hospital Name', priority: 1},
      { key: 'doctorName', label: 'Doctor', priority: 5 },
      { key: 'instructions', label: 'Instructions', priority: 2 },
      { key: 'notes', label: 'Notes', priority: 3 },
      { key: 'prescriptionImage', label: 'View Prescription Image', priority: 4, isFile: true }
    ]
  },
  
  lab: {
    icon: TestTube,
    iconColor: 'text-purple-600',
    iconBgColor: 'bg-purple-100',
    dateField: 'labResultDate',
    titleField: 'hospitalName',
    maxVisibleFields: 4,
    files: [],
    displayFields: [
      { key: 'hospitalName', label: 'Hospital Name', priority: 1 },
      { key: 'doctorName', label: 'Doctor', priority: 5 },
      { key: 'report', label: 'Report Summary', priority: 2 },
      { key: 'instructions', label: 'Instructions', priority: 3 },
      { key: 'reportPath', label: 'View Lab Report', priority: 4, isFile: true }
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
 * Fix malformed Cloudinary URLs
 */
const fixCloudinaryUrl = (url) => {
  if (!url) return null;
  
  // Fix missing slash after https:
  if (url.startsWith('https:/') && !url.startsWith('https://')) {
    url = url.replace('https:/', 'https://');
  }
  
  // Fix missing slash after http:
  if (url.startsWith('http:/') && !url.startsWith('http://')) {
    url = url.replace('http:/', 'http://');
  }
  
  return url;
};

/**
 * Format date for display
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    let dateObj;
    if (Array.isArray(dateString)) {
      const [year, month, day] = dateString;
      dateObj = new Date(year, month - 1, day);
    } else {
      dateObj = new Date(dateString);
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
};

/**
 * Get fields to display based on expanded state
 */
const getVisibleFields = (config, record, expanded) => {
  const fieldsWithData = config.displayFields.filter(field => {
    const value = record[field.key];
    return value !== null && value !== undefined && value !== '';
  });

  if (!expanded && config.maxVisibleFields) {
    return fieldsWithData.slice(0, config.maxVisibleFields);
  }

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
          const fixedUrl = fixCloudinaryUrl(value);  // ✅ FIX: Validate and fix URL
          
          return (
            <div key={field.key}>
              <a
                href={fixedUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  // ✅ FIX: Prevent default and manually open in new tab
                  e.preventDefault();
                  window.open(fixedUrl, '_blank', 'noopener,noreferrer');
                }}
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
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
 * Expand/Collapse Button
 */
const ExpandButton = ({ expanded, onClick, hiddenFieldsCount }) => (
  <div className="mt-3">
    <button
      onClick={onClick}
      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
    >
      {expanded ? 'Show less' : `Show more (${hiddenFieldsCount} more field${hiddenFieldsCount !== 1 ? 's' : ''})`}
    </button>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
function UnifiedRecordCard({ type, record, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const config = CARD_CONFIGS[type];
  
  if (!config) {
    console.error('Invalid record type:', type);
    return null;
  }

  const showExpandButton = hasMoreFields(config, record);
  
  const totalFields = config.displayFields.filter(field => {
    const value = record[field.key];
    return value !== null && value !== undefined && value !== '';
  }).length;
  const hiddenFieldsCount = Math.max(0, totalFields - config.maxVisibleFields);

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