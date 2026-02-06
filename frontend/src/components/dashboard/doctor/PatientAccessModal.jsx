import { useState } from 'react';
import { X, Mail, Key, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:8080/api';

/**
 * Patient Access Modal - 2-Step Passkey System
 * Step 1: Doctor enters patient email → System generates 5-char code
 * Step 2: Doctor enters passkey → Views patient records
 */

function PatientAccessModal({ show, doctorId, onClose, onSuccess, onError }) {
  const [step, setStep] = useState(1); // 1 = email, 2 = passkey
  const [loading, setLoading] = useState(false);
  
  // Step 1 data
  const [patientEmail, setPatientEmail] = useState('');
  const [generatedPasskey, setGeneratedPasskey] = useState('');
  const [patientName, setPatientName] = useState('');
  
  // Step 2 data
  const [passkeyInput, setPasskeyInput] = useState('');

  if (!show) return null;

  // ============================================
  // STEP 1: REQUEST ACCESS (Generate Passkey)
  // ============================================
  const handleRequestAccess = async () => {
    if (!patientEmail.trim()) {
      onError('Please enter patient email');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/doctor/${doctorId}/request-patient-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientEmail: patientEmail.trim()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setGeneratedPasskey(result.passkey);
        setPatientName(result.patientName);
        setStep(2);
        onSuccess(`Access code sent to ${result.patientName}.`); // Here the notification come
      } else {
        onError(result.error || 'Failed to request access');
      }
    } catch (err) {
      console.error('❌ Request access error:', err);
      onError('Server error. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // STEP 2: VERIFY PASSKEY
  // ============================================
  const handleVerifyPasskey = async () => {
    if (!passkeyInput.trim()) {
      onError('Please enter the access code');
      return;
    }

    if (passkeyInput.trim().length !== 5) {
      onError('Access code must be 5 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/doctor/${doctorId}/verify-passkey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientEmail: patientEmail.trim(),
          passkey: passkeyInput.trim().toUpperCase()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onSuccess('Access granted! Loading patient records...');
        // Pass patient data to parent component
        handleClose();
        // Trigger patient overview update with result.patient data
        window.dispatchEvent(new CustomEvent('patientAccessGranted', { 
          detail: result.patient 
        }));
      } else {
        onError(result.error || 'Invalid access code');
      }
    } catch (err) {
      console.error('❌ Verify passkey error:', err);
      onError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RESET & CLOSE
  // ============================================
  const handleClose = () => {
    setStep(1);
    setPatientEmail('');
    setGeneratedPasskey('');
    setPatientName('');
    setPasskeyInput('');
    onClose();
  };

  const handleBack = () => {
    setStep(1);
    setPasskeyInput('');
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && !loading && handleClose()}
    >
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center rounded-t-xl">
          <div>
            <h3 className="text-lg font-bold">Patient Access Request</h3>
            <p className="text-sm text-blue-100">
              {step === 1 ? 'Step 1: Enter Patient Email' : 'Step 2: Enter Access Code'}
            </p>
          </div>
          <button 
            onClick={handleClose}
            disabled={loading}
            className="text-white hover:bg-blue-800 rounded-full p-2 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* STEP 1: EMAIL INPUT */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>How it works:</strong>
                  <br/>1. Enter patient's email address
                  <br/>2. System generates 5-character code
                  <br/>3. Patient receives code in their notifications
                  <br/>4. Enter code to view patient records
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Patient Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  disabled={loading}
                  placeholder="patient@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  onKeyPress={(e) => e.key === 'Enter' && handleRequestAccess()}
                />
              </div>

              <button
                onClick={handleRequestAccess}
                disabled={loading || !patientEmail.trim()}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating Code...
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    Generate Access Code
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: PASSKEY INPUT */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Success message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800 mb-1">
                      Access code sent to {patientName}!
                    </p>
                    <p className="text-xs text-green-700">
                      Patient will receive code: {/*<span className="font-mono font-bold text-lg">{generatedPasskey}</span>*/}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expiry warning */}
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <Clock className="w-4 h-4" />
                <span>Code expires in 30 minutes</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Enter 5-Character Access Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value.toUpperCase())}
                  disabled={loading}
                  placeholder="AB12C"
                  maxLength={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center text-2xl font-mono font-bold tracking-widest uppercase"
                  onKeyPress={(e) => e.key === 'Enter' && handleVerifyPasskey()}
                />
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Ask the patient for the code from their notifications
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyPasskey}
                  disabled={loading || passkeyInput.trim().length !== 5}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      View Records
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientAccessModal;