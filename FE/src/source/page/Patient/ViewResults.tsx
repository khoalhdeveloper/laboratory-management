
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
}

interface ViewResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    testReport: TestReport | null;
    userData: any;
}

function ViewResultsModal({ isOpen, onClose, testReport, userData }: ViewResultsModalProps) {
    if (!isOpen || !testReport) return null;

    // Function to get status color
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

    // Format date of birth for display (DD-MM-YYYY)
    const formatDateOfBirthForDisplay = (dateString: string) => {
        if (!dateString) return '';
        
        try {
            // Handle ISO 8601 format (e.g., "2004-05-15T00:00:00.000Z")
            if (dateString.includes('T') && dateString.includes('Z')) {
                const date = new Date(dateString);
                if (!isNaN(date.getTime())) {
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear().toString();
                    return `${day}-${month}-${year}`;
                }
            }
            // Handle YYYY-MM-DD format
            else if (dateString.includes('-') && !dateString.includes('T')) {
                const dateParts = dateString.split('-');
                if (dateParts.length === 3) {
                    const [year, month, day] = dateParts;
                    return `${day}-${month}-${year}`;
                }
            }
            // Handle MM/DD/YYYY format (legacy)
            else if (dateString.includes('/')) {
                const dateParts = dateString.split('/');
                if (dateParts.length === 3) {
                    const [month, day, year] = dateParts;
                    return `${day}-${month}-${year}`;
                }
            }
        } catch (error) {
        }
        
        return dateString; // Return original if can't parse
    };

    return (
        <div 
            className="fixed inset-0 flex items-start justify-center z-50 p-4 pt-20"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-xl border-2 border-gray-400 max-w-6xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Test Results Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                    {/* Patient Information and Test Information */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 border-b border-gray-200">
                            {/* Patient Information */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                    Patient Information
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Name:</span>
                                        <span className="font-medium text-gray-900">{userData?.fullName || ''}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date of Birth:</span>
                                        <span className="font-medium text-gray-900">{formatDateOfBirthForDisplay(userData?.dateOfBirth || '')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Gender:</span>
                                        <span className="font-medium text-gray-900">{userData?.gender || ''}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phone Number:</span>
                                        <span className="font-medium text-gray-900">{userData?.phoneNumber || ''}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Test Information */}
                            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-purple-600">
                                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                        </svg>
                                    </div>
                                    Test Information
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Test Type:</span>
                                        <span className="font-medium text-gray-900">{testReport.testType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Department:</span>
                                        <span className="font-medium text-gray-900">{testReport.department}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Result Date:</span>
                                        <span className="font-medium text-gray-900">{testReport.resultDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Doctor:</span>
                                        <span className="font-medium text-gray-900">{testReport.doctor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results Table */}
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Parameter</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Value</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Reference Range</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Unit</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {Object.entries(testReport.results).map(([key, result]: [string, any], resultIndex) => (
                                            <tr key={key} className={resultIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                    {key === 'wbc' && 'White Blood Cell (WBC)'}
                                                    {key === 'rbc' && 'Red Blood Cell (RBC)'}
                                                    {key === 'hemoglobin' && 'Hemoglobin (HGB)'}
                                                    {key === 'hematocrit' && 'Hematocrit (HCT)'}
                                                    {key === 'platelet' && 'Platelet Count (PLT)'}
                                                    {key === 'mcv' && 'Mean Corpuscular Volume (MCV)'}
                                                    {key === 'mch' && 'Mean Corpuscular Hemoglobin (MCH)'}
                                                    {key === 'mchc' && 'Mean Corpuscular Hemoglobin Concentration (MCHC)'}
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
                                                    {key === 'protein' && 'Protein'}
                                                    {key === 'glucose' && 'Glucose'}
                                                    {key === 'blood' && 'Blood'}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-bold text-gray-900">{result.value}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{result.normal}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{result.unit}</td>
                                                <td className="px-4 py-3 text-sm">
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

                        {/* AI Auto Review and Doctor Comments */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 border-t border-gray-200">
                            {/* AI Auto Review */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                    </div>
                                    AI Auto Review
                                </h3>
                                <div className="text-sm text-gray-700 leading-relaxed">
                                    <p className="mb-2">
                                        <span className="font-semibold text-green-600">✓ Overall Assessment:</span> All parameters are within normal ranges.
                                    </p>
                                    <p className="mb-2">
                                        <span className="font-semibold text-blue-600">📊 Key Findings:</span> Test results show healthy values across all measured parameters.
                                    </p>
                                    <p className="mb-2">
                                        <span className="font-semibold text-purple-600">🔍 Recommendation:</span> Continue current lifestyle and regular monitoring.
                                    </p>
                                    <p className="text-xs text-gray-500 mt-3">
                                        Generated by AI • {new Date().toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Doctor Comments */}
                            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-purple-600">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    </div>
                                    Doctor Comments
                                </h3>
                                <div className="text-sm text-gray-700 leading-relaxed">
                                    <p className="mb-2">
                                        <span className="font-semibold text-orange-600">👨‍⚕️ {testReport.doctor}:</span>
                                    </p>
                                    <p className="mb-3 pl-4 border-l-2 border-orange-200">
                                        "Patient's test results are excellent. All parameters are within normal limits, indicating good overall health. No immediate concerns or follow-up required."
                                    </p>
                                    <p className="mb-2">
                                        <span className="font-semibold text-gray-600">📅 Review Date:</span> {testReport.resultDate}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-3">
                                        Reviewed by {testReport.doctor} • Department of {testReport.department}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        className="flex items-center gap-2 bg-gradient-to-r from-sky-300 to-violet-400 text-white px-6 py-3 rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all font-medium shadow-sm hover:shadow-md"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                        </svg>
                        Export Excel
                    </button>
                    <button
                        className="flex items-center gap-2 bg-gradient-to-r from-sky-300 to-violet-400 text-white px-6 py-3 rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all font-medium shadow-sm hover:shadow-md"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                        </svg>
                        Export PDF
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ViewResultsModal;
