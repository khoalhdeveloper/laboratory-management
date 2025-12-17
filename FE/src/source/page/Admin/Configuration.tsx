import React, { useState, useEffect } from 'react';
import { settingsAPI, type SystemSettings } from '../../page/Axios/Axios';

// Form values type - string version for controlled inputs
type FormValues = {
  sessionTimeoutMinutes: string;
  jwtExpirationHours: string;
  maxFailedLoginAttempts: string;
  inactivityLockDays: string;
};

interface InputFieldConfig {
  key: keyof FormValues;
  label: string;
  description: string;
  placeholder: string;
  unit: string;
  min: number;
  icon: React.ReactNode;
}

const Configuration: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Use string-based state for inputs to avoid conversion issues
  const [formValues, setFormValues] = useState<FormValues>({
    sessionTimeoutMinutes: '15',
    jwtExpirationHours: '8',
    maxFailedLoginAttempts: '5',
    inactivityLockDays: '90'
  });

  // Field configurations
  const sessionFields: InputFieldConfig[] = [
    {
      key: 'sessionTimeoutMinutes',
      label: 'Session Timeout',
      description: 'Maximum inactive time before automatic logout',
      placeholder: '15',
      unit: 'minutes',
      min: 1,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      key: 'jwtExpirationHours',
      label: 'JWT Expiration',
      description: 'Authentication token validity period',
      placeholder: '8',
      unit: 'hours',
      min: 1,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1 1 21 9z" />
        </svg>
      )
    }
  ];

  const securityFields: InputFieldConfig[] = [
    {
      key: 'maxFailedLoginAttempts',
      label: 'Max Failed Attempts',
      description: 'Maximum incorrect login attempts before account lockout',
      placeholder: '5',
      unit: 'attempts',
      min: 1,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    {
      key: 'inactivityLockDays',
      label: 'Inactivity Lock',
      description: 'Days of inactivity before automatic account lockout',
      placeholder: '90',
      unit: 'days',
      min: 1,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettings();
      const fetchedSettings = response.data.settings;
      setSettings(fetchedSettings);
      // Convert numbers to strings for form
      setFormValues({
        sessionTimeoutMinutes: String(fetchedSettings.sessionTimeoutMinutes),
        jwtExpirationHours: String(fetchedSettings.jwtExpirationHours),
        maxFailedLoginAttempts: String(fetchedSettings.maxFailedLoginAttempts),
        inactivityLockDays: String(fetchedSettings.inactivityLockDays)
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Unable to load system configuration' });
    } finally {
      setLoading(false);
    }
  };

  // Convert string form values to numbers for API
  const getNumericValues = (): SystemSettings => {
    return {
      sessionTimeoutMinutes: parseInt(formValues.sessionTimeoutMinutes) || 1,
      jwtExpirationHours: parseInt(formValues.jwtExpirationHours) || 1,
      maxFailedLoginAttempts: parseInt(formValues.maxFailedLoginAttempts) || 1,
      inactivityLockDays: parseInt(formValues.inactivityLockDays) || 1
    };
  };

  // Validate and save
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const numericValues = getNumericValues();

      // Validation
      const validationErrors: string[] = [];
      if (numericValues.sessionTimeoutMinutes < 1) {
        validationErrors.push('Session timeout must be at least 1 minute');
      }
      if (numericValues.jwtExpirationHours < 1) {
        validationErrors.push('JWT expiration must be at least 1 hour');
      }
      if (numericValues.maxFailedLoginAttempts < 1) {
        validationErrors.push('Max failed attempts must be at least 1');
      }
      if (numericValues.inactivityLockDays < 1) {
        validationErrors.push('Inactivity lock must be at least 1 day');
      }

      if (validationErrors.length > 0) {
        setMessage({ type: 'error', text: validationErrors.join('. ') });
        return;
      }

      // Save
      const response = await settingsAPI.updateSettings(numericValues);
      if (response.data) {
        const savedSettings = response.data.settings;
        setSettings(savedSettings);
        setFormValues({
          sessionTimeoutMinutes: String(savedSettings.sessionTimeoutMinutes),
          jwtExpirationHours: String(savedSettings.jwtExpirationHours),
          maxFailedLoginAttempts: String(savedSettings.maxFailedLoginAttempts),
          inactivityLockDays: String(savedSettings.inactivityLockDays)
        });
        setMessage({ type: 'success', text: 'System configuration updated successfully!' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Unable to update configuration';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  // Input Component with local state to prevent re-render issues
  const InputField: React.FC<{ field: InputFieldConfig }> = ({ field }) => {
    // Local state for immediate input feedback
    const [localValue, setLocalValue] = useState(formValues[field.key]);
    const [isFocused, setIsFocused] = useState(false);
    
    // Sync local value when formValues changes from outside (e.g., reset button)
    // BUT only if input is not focused (to avoid overwriting user input)
    useEffect(() => {
      if (!isFocused) {
        setLocalValue(formValues[field.key]);
      }
    }, [formValues[field.key], isFocused]);
    
    const handleFocus = () => {
      setIsFocused(true);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      
      // Allow empty string
      if (rawValue === '') {
        setLocalValue('');
        return;
      }
      
      // Only allow digits - remove any non-digit characters
      const cleanedValue = rawValue.replace(/\D/g, '');
      
      // Update local state immediately for responsive typing
      setLocalValue(cleanedValue);
    };

    const handleBlur = () => {
      setIsFocused(false);
      
      // Get current local value
      const value = localValue;
      
      // If empty or invalid, set to minimum value
      if (value === '' || value === '0') {
        const minStr = String(field.min);
        setLocalValue(minStr);
        setFormValues(prev => ({
          ...prev,
          [field.key]: minStr
        }));
      } else {
        // Update parent state with current value
        setFormValues(prev => ({
          ...prev,
          [field.key]: value
        }));
      }
    };

    return (
      <div className="group mb-5 sm:mb-7 last:mb-0">
        <label className="block text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-3">
          <div className="p-2 sm:p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex-shrink-0">
            {field.icon}
          </div>
          <span className="truncate text-base sm:text-lg">{field.label}</span>
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={localValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            disabled={saving}
            className="w-full px-4 sm:px-5 py-3 sm:py-4 pl-14 sm:pl-16 pr-20 sm:pr-24 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-base sm:text-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-blue-400/30 focus:border-blue-500 transition-all duration-200 group-hover:border-gray-300 dark:group-hover:border-gray-600 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <div className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-300 pointer-events-none">
            {field.unit}
          </div>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
          {field.description}
        </p>
      </div>
    );
  };

  // Replace loading screen with larger, centered hero loader for better UX on mobile and dark mode
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="relative inline-block mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 dark:border-blue-900"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Đang tải cấu hình hệ thống</h2>
          <p className="text-base text-gray-600 dark:text-gray-400">Vui lòng chờ trong giây lát — cấu hình đang được tải.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <div className="mb-6 sm:mb-8 md:mb-12">
          <div className="flex items-center gap-4 sm:gap-6 mb-4">
            <div className="p-3 sm:p-4 md:p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-2xl flex-shrink-0">
              <svg className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                System Configuration
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg md:text-xl mt-1">
                Manage security and session settings with better readability and responsive layout
              </p>
            </div>
          </div>
        </div>

        {/* Message Alert - Responsive */}
        {message && (
          <div className={`mb-4 sm:mb-6 md:mb-8 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-l-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300'
          }`}>
            <div className="flex items-start gap-2 sm:gap-3">
              <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                message.type === 'success' 
                  ? 'bg-green-100 dark:bg-green-800/30' 
                  : 'bg-red-100 dark:bg-red-800/30'
              }`}>
                {message.type === 'success' ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium block text-sm sm:text-base break-words">{message.text}</span>
              </div>
              <button
                onClick={() => setMessage(null)}
                className="flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Configuration Form - Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 text-sm sm:text-base">Configure system security parameters</p>
          </div>
          
          <div className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {/* Session Management Section - Responsive */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-blue-200 dark:border-blue-800/30">
                  <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 sm:mb-6 flex items-center gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate">Session Management</span>
                  </h3>
                  {sessionFields.map(field => (
                    <InputField key={field.key} field={field} />
                  ))}
                </div>
              </div>

              {/* Security Policies Section - Responsive */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-red-200 dark:border-red-800/30">
                  <h3 className="text-base sm:text-lg font-semibold text-red-900 dark:text-red-100 mb-4 sm:mb-6 flex items-center gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate">Security Policies</span>
                  </h3>
                  {securityFields.map(field => (
                    <InputField key={field.key} field={field} />
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons - Responsive */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8 md:mt-10 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={fetchSettings}
                disabled={saving}
                className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reset</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Configuration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Current Settings Display - Responsive */}
        {settings && (
          <div className="mt-6 sm:mt-8 md:mt-10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-blue-900 dark:text-blue-100">
                Current Active Configuration
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-blue-200 dark:border-blue-800/30 hover:shadow-md transition-shadow">
                <div className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 mb-1 sm:mb-2">Session Timeout</div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">{settings.sessionTimeoutMinutes}</div>
                <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-0.5 sm:mt-1">minutes</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-blue-200 dark:border-blue-800/30 hover:shadow-md transition-shadow">
                <div className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 mb-1 sm:mb-2">JWT Expiration</div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">{settings.jwtExpirationHours}</div>
                <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-0.5 sm:mt-1">hours</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-blue-200 dark:border-blue-800/30 hover:shadow-md transition-shadow">
                <div className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 mb-1 sm:mb-2">Max Failed Attempts</div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">{settings.maxFailedLoginAttempts}</div>
                <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-0.5 sm:mt-1">attempts</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-blue-200 dark:border-blue-800/30 hover:shadow-md transition-shadow">
                <div className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 mb-1 sm:mb-2">Inactivity Lock</div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">{settings.inactivityLockDays}</div>
                <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-0.5 sm:mt-1">days</div>
              </div>
            </div>
            {settings.updatedAt && (
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-blue-200 dark:border-blue-800/30 text-xs sm:text-sm text-blue-600 dark:text-blue-400 flex flex-wrap items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="break-all">Last updated: {new Date(settings.updatedAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Configuration;
