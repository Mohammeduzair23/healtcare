import { useState, useEffect } from 'react';
import { X, FileUp, Image, AlertCircle } from 'lucide-react';

/**
 * Professional Unified Modal for Medical Records Management
 * Handles Medical Records, Prescriptions, and Lab Results with Add/Edit modes
 */

// ============================================
// CONFIGURATION CONSTANTS
// ============================================
const API_BASE_URL = 'http://localhost:8080/api';

const RECORD_TYPES = {
  MEDICAL: 'medical',
  PRESCRIPTION: 'prescription',
  LAB: 'lab'
};

const MODES = {
  ADD: 'add',
  EDIT: 'edit'
};

const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_DOCS: '.pdf,.doc,.docx',
  ACCEPTED_IMAGES: 'image/*',
  ACCEPTED_ALL: '.pdf,.doc,.docx,image/*'
};

// ============================================
// FORM FIELD CONFIGURATIONS
// ============================================
const FORM_CONFIGS = {
  [RECORD_TYPES.MEDICAL]: {
    title: 'Medical Record',
    fields: {
      hospitalName: {label: 'Hospital Name', required: true, type: 'text', placeholder: "Enter hospital name"},
      doctorName: { label: 'Doctor Name', required: true, type: 'text', placeholder: "Enter doctor's name" },
      recordType: { label: 'Record Type', required: true, type: 'text', placeholder: 'e.g., General Checkup, Blood Test' },
      description: { label: 'Description', required: false, type: 'text', placeholder: 'Brief description' },
      details: { label: 'Details', required: false, type: 'textarea', placeholder: 'Detailed information', rows: 3 },
      recordDate: { label: 'Date', required: true, type: 'date', hideOnEdit: true }
    },
    files: {
      softcopyFile: { label: 'Medical Report (PDF/Document)', accept: FILE_LIMITS.ACCEPTED_DOCS, icon: 'document' },
      prescriptionImage: { label: 'Prescription Image', accept: FILE_LIMITS.ACCEPTED_IMAGES, icon: 'image' }
    },
    dbMapping: {
      hospitalName: 'hospital',
      doctorName: 'doctorName',
      recordType: 'recordType',
      description: 'description',
      details: 'details',
      recordDate: 'recordDate'
    }
  },
  
  [RECORD_TYPES.PRESCRIPTION]: {
    title: 'Prescription',
    fields: {
      hospitalName: {label: 'Hospital Name', required: true, type: 'text', placeholder: "Enter hospital name"},
      doctorName: { label: 'Doctor Name', required: true, type: 'text', placeholder: "Enter doctor's name" },
      medicineName: { label: 'Medicine Name', required: true, type: 'text', placeholder: 'e.g., Amoxicillin' },
      instructions: { label: 'Instructions', required: false, type: 'textarea', placeholder: 'e.g., Take with food, twice daily', rows: 2 },
      notes: { label: 'Notes', required: false, type: 'textarea', placeholder: 'Additional notes', rows: 2 },
      prescriptionDate: { label: 'Prescription Date', required: true, type: 'date', hideOnEdit: true },
      status: { label: 'Status', required: false, type: 'select', options: ['Active', 'Completed', 'Expired'], default: 'Active' }
    },
    files: {
      prescriptionImage: { label: 'Prescription Image/PDF', accept: `${FILE_LIMITS.ACCEPTED_IMAGES},.pdf`, icon: 'image', requiredOnAdd: true }
    },
    dbMapping: {
      hospitalName: 'hospital',
      doctorName: 'doctorName',
      medicineName: 'medicineName',
      instructions: 'instructions',
      notes: 'notes',
      prescriptionDate: 'prescriptionDate',
      status: 'status'
    }
  },
  
  [RECORD_TYPES.LAB]: {
    title: 'Lab Result',
    fields: {
      hospitalName: { label: 'Hospital Name', required: true, type: 'text', placeholder: 'e.g., City Medical Center' },
      doctorName: { label: 'Doctor Name', required: true, type: 'text', placeholder: "Enter doctor's name" },
      instructions: { label: 'Instructions', required: false, type: 'textarea', placeholder: 'Test instructions', rows: 3 },
      report: { label: 'Report Summary', required: false, type: 'text', placeholder: 'Brief report summary' },
      labResultDate: { label: 'Lab Result Date', required: true, type: 'date', hideOnEdit: true }
    },
    files: {
      softcopyFile: { label: 'Lab Report', accept: FILE_LIMITS.ACCEPTED_ALL, icon: 'document', requiredOnAdd: true }
    },
    dbMapping: {
      hospitalName: 'hospitalName',
      doctorName: 'doctorName',
      instructions: 'instructions',
      report: 'report',
      labResultDate: 'labResultDate'
    }
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const getInitialFormData = (type, existingData = null, mode = MODES.ADD) => {
  const config = FORM_CONFIGS[type];
  if (!config) return {};

  const formData = {};
  
  // Initialize all fields including hidden ones (needed for edit mode validation)
  Object.keys(config.fields).forEach(fieldName => {
    const field = config.fields[fieldName];
    
    if (mode === MODES.EDIT && existingData) {
      const dbField = config.dbMapping[fieldName];
      formData[fieldName] = existingData[dbField] || (field.default || '');
    } else {
      formData[fieldName] = field.default || '';
    }
  });

  // Initialize file fields
  Object.keys(config.files).forEach(fileName => {
    formData[fileName] = null;
  });

  return formData;
};

const validateForm = (type, formData, mode) => {
  const config = FORM_CONFIGS[type];
  if (!config) return { valid: false, message: 'Invalid record type' };

  // Check required text fields (skip hidden date fields in edit mode)
  for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
    if (mode === MODES.EDIT && fieldConfig.hideOnEdit) continue;
    
    if (fieldConfig.required) {
      if (!formData[fieldName] || formData[fieldName].toString().trim() === '') {
        return { valid: false, message: `${fieldConfig.label} is required` };
      }
    }
  }

  // Check required files (only in add mode)
  if (mode === MODES.ADD) {
    for (const [fileName, fileConfig] of Object.entries(config.files)) {
      if (fileConfig.requiredOnAdd && !formData[fileName]) {
        return { valid: false, message: `${fileConfig.label} is required` };
      }
    }
  }

  return { valid: true };
};

const buildApiUrl = (type, mode, patientId, recordId) => {
  if (mode === MODES.EDIT) {
    return `${API_BASE_URL}/${type}/records/${recordId}`;
  }
  return `${API_BASE_URL}/patient/${patientId}/${type}/records`;
};

const buildFormDataForSubmit = (type, formData, mode) => {
  const config = FORM_CONFIGS[type];
  const submitData = new FormData();

  // Add all field data (including date fields for backend validation)
  Object.keys(config.fields).forEach(fieldName => {
    const value = formData[fieldName];
    if (value !== null && value !== undefined) {
      submitData.append(fieldName, value);
    }
  });

  // Add files only if they are new File objects
  Object.keys(config.files).forEach(fileName => {
    if (formData[fileName] instanceof File) {
      submitData.append(fileName, formData[fileName]);
    }
  });

  return submitData;
};

// ============================================
// REUSABLE COMPONENTS
// ============================================
const FormField = ({ config, name, value, onChange, disabled, error }) => {
  const { label, required, type, placeholder, rows, options } = config;

  const inputClasses = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}
    ${error ? 'border-red-500' : ''}`;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          className={inputClasses}
          rows={rows || 3}
          placeholder={placeholder}
        />
      ) : type === 'select' ? (
        <select
          name={name}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          className={inputClasses}
        >
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          className={inputClasses}
          placeholder={placeholder}
        />
      )}
      
      {error && (
        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};

const FileUpload = ({ config, name, file, onChange, mode, existingFilePath }) => {
  const { label, accept, icon, requiredOnAdd } = config;
  const Icon = icon === 'image' ? Image : FileUp;
  const isRequired = requiredOnAdd && mode === MODES.ADD;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {isRequired && <span className="text-red-500">*</span>}
        {mode === MODES.EDIT && <span className="text-xs text-gray-500 ml-2">(Optional - leave empty to keep existing)</span>}
      </label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
        <Icon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        
        <input
          type="file"
          accept={accept}
          onChange={onChange}
          className="hidden"
          id={`${name}-upload`}
        />
        
        <label 
          htmlFor={`${name}-upload`} 
          className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
        >
          Click to upload {label.toLowerCase()}
        </label>
        
        <p className="text-xs text-gray-500 mt-1">
          {accept.includes('image') && 'JPG, PNG'}
          {accept.includes('pdf') && ', PDF'}
          {accept.includes('doc') && ', DOC, DOCX'}
          {' (Max 10MB)'}
        </p>
        
        {file && (
          <div className="mt-2 p-2 bg-green-50 rounded">
            <p className="text-sm text-green-600 flex items-center justify-center gap-2">
              <span className="text-green-500">✓</span>
              {file.name}
            </p>
          </div>
        )}
        
        {!file && mode === MODES.EDIT && existingFilePath && (
          <div className="mt-2 p-2 bg-blue-50 rounded">
            <p className="text-sm text-blue-600">
              Current file will be kept if no new file is uploaded
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
function UnifiedRecordModal({ 
  show, 
  mode = MODES.ADD, 
  type, 
  patientId = null,
  recordId = null,
  existingData = null,
  onClose, 
  onSuccess, 
  onError 
}) {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Initialize form data
  useEffect(() => {
    if (show && type) {
      const initialData = getInitialFormData(type, existingData, mode);
      //console.log('🔧 Initializing form with data:', initialData);
      console.log('📝 Mode:', mode, 'Type:', type);
      console.log('📦 Existing Data:', existingData);
      setFormData(initialData);
      setFieldErrors({});
    }
  }, [show, type, mode, existingData]);

  if (!show) return null;

  const config = FORM_CONFIGS[type];
  if (!config) {
    console.error('Invalid record type:', type);
    return null;
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > FILE_LIMITS.MAX_SIZE) {
        onError(`File size must be less than 10MB`);
        e.target.value = '';
        return;
      }
      
      setFormData(prev => ({ ...prev, [fieldName]: file }));
      
      if (fieldErrors[fieldName]) {
        setFieldErrors(prev => ({ ...prev, [fieldName]: null }));
      }
    }
  };

  const handleSubmit = async () => {
    console.log('🚀 Submit started - Mode:', mode, 'Type:', type);
    console.log('📦 Current formData:', formData);
    
    // Validate form
    const validation = validateForm(type, formData, mode);
    if (!validation.valid) {
      console.log('❌ Validation failed:', validation.message);
      onError(validation.message);
      return;
    }

    if (mode === MODES.ADD && !patientId) {
      onError('Patient ID is required');
      return;
    }

    if (mode === MODES.EDIT && !recordId) {
      onError('Record ID is required for editing');
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = buildApiUrl(type, mode, patientId, recordId);
      const submitData = buildFormDataForSubmit(type, formData, mode);

      console.log('🌐 API Endpoint:', endpoint);
      console.log('📤 Submitting data...');
      
      // Log FormData contents
      for (let pair of submitData.entries()) {
        console.log(`  ${pair[0]}:`, pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
      }

      const response = await fetch(endpoint, {
        method: mode === MODES.EDIT ? 'PUT' : 'POST',
        body: submitData
      });

      const result = await response.json();
      console.log('📥 Server response:', result);

      if (response.ok && result.success) {
        const action = mode === MODES.EDIT ? 'updated' : 'added';
        console.log(`✅ ${config.title} ${action} successfully!`);
        onSuccess(`${config.title} ${action} successfully!`);
        onClose();
      } else {
        console.log('❌ Server error:', result.error);
        onError(result.error || `Failed to ${mode} ${config.title.toLowerCase()}`);
      }
    } catch (err) {
      console.error('❌ Submit error:', err);
      onError('Server error. Please check if backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setFormData({});
    setFieldErrors({});
    onClose();
  };

  // Get existing file path for display
  const getExistingFilePath = (fileName) => {
    if (mode === MODES.EDIT && existingData) {
      if (fileName === 'softcopyFile') return existingData.softcopyPath;
      if (fileName === 'prescriptionImage') return existingData.prescriptionPath || existingData.prescriptionImage;
    }
    return null;
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">
              {mode === MODES.EDIT ? 'Edit' : 'Add'} {config.title}
            </h3>
            <p className="text-sm text-blue-100 mt-1">
              {mode === MODES.EDIT ? 'Update existing record' : 'Create new record'}
            </p>
          </div>
          <button 
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-white hover:bg-blue-800 rounded-full p-2 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-4">
            {/* Render Form Fields */}
            {Object.entries(config.fields).map(([fieldName, fieldConfig]) => {
              if (mode === MODES.EDIT && fieldConfig.hideOnEdit) {
                return null;
              }
              
              return (
                <FormField
                  key={fieldName}
                  config={fieldConfig}
                  name={fieldName}
                  value={formData[fieldName]}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  error={fieldErrors[fieldName]}
                />
              );
            })}

            {/* Render File Upload Fields */}
            {Object.entries(config.files).map(([fileName, fileConfig]) => (
              <FileUpload
                key={fileName}
                config={fileConfig}
                name={fileName}
                file={formData[fileName]}
                onChange={(e) => handleFileChange(e, fileName)}
                mode={mode}
                existingFilePath={getExistingFilePath(fileName)}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              mode === MODES.EDIT ? 'Update Record' : 'Save Record'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UnifiedRecordModal;
export { RECORD_TYPES, MODES };