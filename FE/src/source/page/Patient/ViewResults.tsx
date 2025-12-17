
interface TestReport {
    id: string;
    orderId: string;
    patientId: string;
    patientName: string;
    dateOfBirth: string;
    gender: string;
    phoneNumber: string;
    testType: string;
    department: string;
    status: string;
    resultDate: string;
    priority: string;
    doctor: string;
    completionTime: string;
    results: any;
    instrumentName: string;
    aiDescription?: string;
    doctorComments?: string[];
}

import { useState, useEffect } from 'react';
import { exportTestResultsToPDFHTML } from '../../../utils/exportUtils';
import { toast } from '../../../utils/toast';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';

interface ViewResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    testReport: TestReport | null;
    userData: any;
}

function ViewResultsModal({ isOpen, onClose, testReport: propTestReport, userData }: ViewResultsModalProps) {
    const { isDarkMode: _isDarkMode } = useGlobalTheme();
    const [testReport, setTestReport] = useState<TestReport | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Set test report from props
    useEffect(() => {
        if (isOpen && propTestReport) {
            setTestReport(propTestReport);
            setError(null);
        } else if (!isOpen) {
            setTestReport(null);
            setError(null);
        }
    }, [isOpen, propTestReport]);

    if (!isOpen) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Normal':
                return 'bg-green-100 text-green-800'
            case 'Abnormal':
                return 'bg-red-100 text-red-800'
            case 'Borderline':
                return 'bg-yellow-100 text-yellow-800'
            case 'Completed':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    };

    const formatDateOfBirthForDisplay = (dateString: string) => {
        if (!dateString) return '';
        
        try {
            if (dateString.includes('T') && dateString.includes('Z')) {
                const date = new Date(dateString);
                if (!isNaN(date.getTime())) {
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear().toString();
                    return `${day}-${month}-${year}`;
                }
            }
            else if (dateString.includes('-') && !dateString.includes('T')) {
                const dateParts = dateString.split('-');
                if (dateParts.length === 3) {
                    const [year, month, day] = dateParts;
                    return `${day}-${month}-${year}`;
                }
            }
            else if (dateString.includes('/')) {
                const dateParts = dateString.split('/');
                if (dateParts.length === 3) {
                    const [month, day, year] = dateParts;
                    return `${day}-${month}-${year}`;
                }
            }
        } catch (error) {
        }
        
        return dateString;
    };

    const handleExportPDF = async () => {
        try {
            if (!testReport || !userData) {
                toast.error('No data available to export');
                return;
            }

            const result = await exportTestResultsToPDFHTML(testReport, userData);
            if (result.success) {
                toast.success('Test results exported to PDF successfully!');
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to export test results');
        }
    };

    return (
        <div 
            className="fixed inset-0 flex items-start justify-center z-50 p-4 pt-20"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-gray-400 dark:border-gray-600 max-w-6xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Test Results Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-red-800">{error}</span>
                            </div>
                        </div>
                    )}
                    
                    {!error && testReport && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm mb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 border-b border-gray-300 dark:border-gray-600">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-black mb-3 flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                    Patient Information
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-xs lg:text-sm text-gray-600 dark:text-black">Name:</span>
                                        <span className="font-medium text-xs lg:text-sm text-gray-900 dark:text-black">{testReport.patientName || userData?.fullName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs lg:text-sm text-gray-600 dark:text-black">Date of Birth:</span>
                                        <span className="font-medium text-xs lg:text-sm text-gray-900 dark:text-black">{formatDateOfBirthForDisplay(testReport.dateOfBirth || userData?.dateOfBirth || '')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs lg:text-sm text-gray-600 dark:text-black">Gender:</span>
                                        <span className="font-medium text-xs lg:text-sm text-gray-900 dark:text-black">{testReport.gender || userData?.gender || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs lg:text-sm text-gray-600 dark:text-black">Phone Number:</span>
                                        <span className="font-medium text-xs lg:text-sm text-gray-900 dark:text-black">{testReport.phoneNumber || userData?.phoneNumber || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border-2 border-purple-200 shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-black mb-3 flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                        </svg>
                                    </div>
                                    Test Information
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-xs lg:text-sm text-gray-600 dark:text-black">Test Type:</span>
                                        <span className="font-medium text-xs lg:text-sm text-gray-900 dark:text-black">{testReport.testType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs lg:text-sm text-gray-600 dark:text-black">Result Date:</span>
                                        <span className="font-medium text-xs lg:text-sm text-gray-900 dark:text-black">{testReport.resultDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs lg:text-sm text-gray-600 dark:text-black">Instrument:</span>
                                        <span className="font-medium text-xs lg:text-sm text-gray-900 dark:text-black">{testReport.instrumentName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs lg:text-sm text-gray-600 dark:text-black">Doctor:</span>
                                        <span className="font-medium text-xs lg:text-sm text-gray-900 dark:text-black">{testReport.doctor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Test Results</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px]">
                                    <thead className="bg-green-100 dark:bg-gray-600">
                                        <tr>
                                            <th className="px-2 py-2 lg:px-4 lg:py-3 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-white">Parameter</th>
                                            <th className="px-2 py-2 lg:px-4 lg:py-3 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-white">Value</th>
                                            <th className="px-2 py-2 lg:px-4 lg:py-3 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-white">Reference Range</th>
                                            <th className="px-2 py-2 lg:px-4 lg:py-3 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-white">Unit</th>
                                            <th className="px-2 py-2 lg:px-4 lg:py-3 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {Object.entries(testReport.results).map(([key, result]: [string, any]) => (
                                            <tr key={key} className="bg-white dark:!bg-gray-700">
                                                <td className="px-2 py-2 lg:px-4 lg:py-3 text-xs lg:text-sm text-gray-900 dark:text-white font-medium">
                                                    {/* Blood Test Parameters */}
                                                    {key === 'wbc' && 'White Blood Cell (WBC)'}
                                                    {key === 'rbc' && 'Red Blood Cell (RBC)'}
                                                    {key === 'hemoglobin' && 'Hemoglobin (HGB)'}
                                                    {key === 'hematocrit' && 'Hematocrit (HCT)'}
                                                    {key === 'platelet' && 'Platelet Count (PLT)'}
                                                    {key === 'mcv' && 'Mean Corpuscular Volume (MCV)'}
                                                    {key === 'mch' && 'Mean Corpuscular Hemoglobin (MCH)'}
                                                    {key === 'mchc' && 'Mean Corpuscular Hemoglobin Concentration (MCHC)'}
                                                    
                                                    {/* Urine Test Parameters (Urinalysis) */}
                                                    {key === 'leukocytes' && 'Leukocytes (LEU)'}
                                                    {key === 'nitrite' && 'Nitrite (NIT)'}
                                                    {key === 'protein' && 'Protein (PRO)'}
                                                    {key === 'pH' && 'pH'}
                                                    {key === 'blood' && 'Blood (BLD)'}
                                                    {key === 'specificGravity' && 'Specific Gravity (SG)'}
                                                    {key === 'ketone' && 'Ketone (KET)'}
                                                    {key === 'glucose' && 'Glucose (GLU)'}
                                                    
                                                    {/* Fecal Analysis Parameters */}
                                                    {key === 'ph_value' && 'pH Value'}
                                                    {key === 'fobt_value' && 'Fecal Occult Blood (FOBT)'}
                                                    {key === 'wbcs_value' && 'White Blood Cells (WBCs)'}
                                                    {key === 'fecal_fat' && 'Fecal Fat'}
                                                    {key === 'O_and_P' && 'Ova and Parasites (O and P)'}
                                                    {key === 'rs_value' && 'Reducing Substances (RS)'}
                                                    {key === 'fc_value' && 'Fecal Calprotectin (FC)'}
                                                    {key === 'color' && 'Color / Consistency'}
                                                    
                                                    {/* Other Test Parameters */}
                                                    {key === 'totalCholesterol' && 'Total Cholesterol'}
                                                    {key === 'ldlCholesterol' && 'LDL Cholesterol'}
                                                    {key === 'hdlCholesterol' && 'HDL Cholesterol'}
                                                    {key === 'triglycerides' && 'Triglycerides'}
                                                    {key === 'tsh' && 'Thyroid Stimulating Hormone (TSH)'}
                                                    {key === 't4' && 'Thyroxine (T4)'}
                                                    {key === 't3' && 'Triiodothyronine (T3)'}
                                                    {key === 'freeT4' && 'Free T4'}
                                                    {key === 'alt' && 'Alanine Aminotransferase (ALT)'}
                                                    {key === 'ast' && 'Aspartate Aminotransferase (AST)'}
                                                    {key === 'bilirubin' && 'Bilirubin'}
                                                    {key === 'alkalinePhosphatase' && 'Alkaline Phosphatase'}
                                                    {key === 'creatinine' && 'Creatinine'}
                                                    {key === 'bun' && 'Blood Urea Nitrogen (BUN)'}
                                                    {key === 'egfr' && 'Estimated GFR'}
                                                    {key === 'fastingGlucose' && 'Fasting Glucose'}
                                                    {key === 'hba1c' && 'Hemoglobin A1c'}
                                                    {key === 'insulin' && 'Insulin'}
                                                    {key === 'vitaminD' && 'Vitamin D'}
                                                    {key === 'ferritin' && 'Ferritin'}
                                                    {key === 'iron' && 'Iron'}
                                                    {key === 'tibc' && 'Total Iron Binding Capacity (TIBC)'}
                                                    {key === 'psa' && 'Prostate Specific Antigen (PSA)'}
                                                    {key === 'freePsa' && 'Free PSA'}
                                                    
                                                    {/* Fallback: format camelCase to Title Case */}
                                                    {!['wbc', 'rbc', 'hemoglobin', 'hematocrit', 'platelet', 'mcv', 'mch', 'mchc',
                                                        'leukocytes', 'nitrite', 'protein', 'pH', 'blood', 'specificGravity', 'ketone', 'glucose',
                                                        'ph_value', 'fobt_value', 'wbcs_value', 'fecal_fat', 'O_and_P', 'rs_value', 'fc_value', 'color',
                                                        'totalCholesterol', 'ldlCholesterol', 'hdlCholesterol', 'triglycerides',
                                                        'tsh', 't4', 't3', 'freeT4', 'alt', 'ast', 'bilirubin', 'alkalinePhosphatase',
                                                        'creatinine', 'bun', 'egfr', 'fastingGlucose', 'hba1c', 'insulin', 'vitaminD',
                                                        'ferritin', 'iron', 'tibc', 'psa', 'freePsa'].includes(key) &&
                                                        key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                </td>
                                                <td className="px-2 py-2 lg:px-4 lg:py-3 text-xs lg:text-sm font-bold text-gray-900 dark:text-white">{result.value}</td>
                                                <td className="px-2 py-2 lg:px-4 lg:py-3 text-xs lg:text-sm text-gray-600 dark:text-white">{result.normal}</td>
                                                <td className="px-2 py-2 lg:px-4 lg:py-3 text-xs lg:text-sm text-gray-600 dark:text-white">{result.unit}</td>
                                                <td className="px-2 py-2 lg:px-4 lg:py-3 text-xs lg:text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                                                        {result.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 border-t border-gray-200">
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border-2 border-emerald-200 shadow-md">
                                <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-700 mb-3 flex items-center">
                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                    </div>
                                    🤖 AI Auto Review
                                </h3>
                                <div className="text-xs lg:text-sm text-gray-700 leading-relaxed">
                                    {testReport.aiDescription && testReport.aiDescription !== 'N/A' ? (
                                        <div className="bg-gradient-to-br from-white to-emerald-50 p-2 lg:p-3 rounded-lg border-2 border-emerald-300 shadow-sm">
                                            <p className="text-emerald-800 dark:text-emerald-700 leading-relaxed font-medium text-xs lg:text-sm">
                                                🤖 {testReport.aiDescription}
                                            </p>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border-2 border-amber-200 shadow-md">
                                <h3 className="text-lg font-bold text-amber-800 dark:text-amber-700 mb-3 flex items-center">
                                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    </div>
                                    👨‍⚕️ Doctor Comments
                                </h3>
                                <div className="text-xs lg:text-sm text-gray-700 leading-relaxed">
                                    {testReport.doctorComments && testReport.doctorComments.length > 0 ? (
                                        <div className="space-y-2">
                                            {testReport.doctorComments.map((comment: string, index: number) => (
                                                <div key={index} className="bg-gradient-to-br from-white to-amber-50 p-2 lg:p-3 rounded-lg border-2 border-amber-300 shadow-sm">
                                                    <p className="text-xs lg:text-sm text-amber-800 dark:text-amber-700 font-medium">
                                                        <span className="font-bold text-amber-600">👨‍⚕️</span> {comment}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                    )}
                </div>

                {!error && testReport && (
                    <div className="flex justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 bg-gradient-to-r from-sky-300 to-violet-400 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all text-xs lg:text-base font-medium shadow-sm hover:shadow-md"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                        </svg>
                        Export PDF
                    </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ViewResultsModal;
