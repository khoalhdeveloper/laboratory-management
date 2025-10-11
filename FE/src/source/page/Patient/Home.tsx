import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../Axios/Axios';
import ViewResultsModal from './ViewResults';

function Home() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('personal-record');
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [selectedTestReport, setSelectedTestReport] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to check if user profile is complete
    const isProfileComplete = (userData: any): boolean => {
        const requiredFields = [
            'fullName',
            'dateOfBirth', 
            'age',
            'gender',
            'address',
            'phoneNumber',
            'email',
            'identifyNumber'
        ];

        return requiredFields.every(field => {
            const value = userData[field];
            return value && value.toString().trim() !== '';
        });
    };

    // Check profile completeness on component mount
    useEffect(() => {
        const checkProfile = async () => {
            try {
                setLoading(true);
                const response = await userAPI.getCurrentUser();
                const userData = response.data;
                
                // Store user data for display
                setUserData(userData);
                
                if (!isProfileComplete(userData)) {
                    navigate('/patient/incomplete-profile', { replace: true });
                }
            } catch (error) {
                // If can't check profile, redirect to incomplete profile page to be safe
                navigate('/patient/incomplete-profile', { replace: true });
            } finally {
                setLoading(false);
            }
        };

        checkProfile();
    }, [navigate]);



    // Mock data for test reports
    const testReports = [
        {
            id: 'TR-000123',
            orderId: 'ORD-003456',
            patientId: 'PT-923401',
            patientName: 'Trần Quốc Lâm',
            dateOfBirth: '15-05-2004',
            gender: 'Male',
            phoneNumber: '0123456789',
            testType: 'Complete Blood Count (CBC)',
            department: 'Hematology',
            status: 'Completed',
            resultDate: '2024-01-15',
            priority: 'High',
            doctor: 'Dr. Smith',
            completionTime: '14:30',
            results: {
                wbc: { value: '5.2', unit: '10³/µL', normal: '4.0-11.0', status: 'Normal' },
                rbc: { value: '5.5', unit: '10⁶/µL', normal: '4.5-5.9', status: 'Normal' },
                hemoglobin: { value: '13.7', unit: 'g/dL', normal: '13.5-17.5', status: 'Normal' },
                hematocrit: { value: '40.2', unit: '%', normal: '41.0-50.0', status: 'Normal' },
                platelet: { value: '150', unit: '10³/µL', normal: '150-450', status: 'Normal' },
                mcv: { value: '86', unit: 'fL', normal: '80-100', status: 'Normal' },
                mch: { value: '29', unit: 'pg', normal: '27-33', status: 'Normal' },
                mchc: { value: '33.5', unit: 'g/dL', normal: '32-36', status: 'Normal' }
            }
        },
        {
            id: 'TR-000124',
            orderId: 'ORD-003457',
            patientId: 'PT-923401',
            patientName: 'Trần Quốc Lâm',
            dateOfBirth: '15-05-2004',
            gender: 'Male',
            phoneNumber: '0123456789',
            testType: 'Lipid Panel',
            department: 'Cardiology',
            status: 'Completed',
            resultDate: '2024-01-20',
            priority: 'Medium',
            doctor: 'Dr. Johnson',
            completionTime: '10:15',
            results: {
                totalCholesterol: { value: '185', unit: 'mg/dL', normal: '<200', status: 'Normal' },
                ldlCholesterol: { value: '110', unit: 'mg/dL', normal: '<100', status: 'Borderline' },
                hdlCholesterol: { value: '55', unit: 'mg/dL', normal: '>50', status: 'Normal' },
                triglycerides: { value: '120', unit: 'mg/dL', normal: '<150', status: 'Normal' }
            }
        },
        {
            id: 'TR-000125',
            orderId: 'ORD-003458',
            patientId: 'PT-923401',
            patientName: 'Trần Quốc Lâm',
            dateOfBirth: '15-05-2004',
            gender: 'Male',
            phoneNumber: '0123456789',
            testType: 'Thyroid Function Test',
            department: 'Endocrinology',
            status: 'Completed',
            resultDate: '2024-01-25',
            priority: 'Low',
            doctor: 'Dr. Wilson',
            completionTime: '16:45',
            results: {
                tsh: { value: '2.1', unit: 'mIU/L', normal: '0.4-4.0', status: 'Normal' },
                t4: { value: '8.2', unit: 'µg/dL', normal: '4.5-12.0', status: 'Normal' },
                t3: { value: '120', unit: 'ng/dL', normal: '80-200', status: 'Normal' },
                freeT4: { value: '1.2', unit: 'ng/dL', normal: '0.8-1.8', status: 'Normal' }
            }
        },
        {
            id: 'TR-000126',
            orderId: 'ORD-003459',
            patientId: 'PT-923401',
            patientName: 'Trần Quốc Lâm',
            dateOfBirth: '15-05-2004',
            gender: 'Male',
            phoneNumber: '0123456789',
            testType: 'Liver Function Test',
            department: 'Gastroenterology',
            status: 'Completed',
            resultDate: '2024-02-01',
            priority: 'Medium',
            doctor: 'Dr. Brown',
            completionTime: '09:30',
            results: {
                alt: { value: '25', unit: 'U/L', normal: '7-56', status: 'Normal' },
                ast: { value: '30', unit: 'U/L', normal: '10-40', status: 'Normal' },
                bilirubin: { value: '0.8', unit: 'mg/dL', normal: '0.1-1.2', status: 'Normal' },
                alkalinePhosphatase: { value: '85', unit: 'U/L', normal: '44-147', status: 'Normal' }
            }
        },
        {
            id: 'TR-000127',
            orderId: 'ORD-003460',
            patientId: 'PT-923401',
            patientName: 'Trần Quốc Lâm',
            dateOfBirth: '15-05-2004',
            gender: 'Male',
            phoneNumber: '0123456789',
            testType: 'Kidney Function Test',
            department: 'Nephrology',
            status: 'Completed',
            resultDate: '2024-02-05',
            priority: 'High',
            doctor: 'Dr. Davis',
            completionTime: '11:20',
            results: {
                creatinine: { value: '1.1', unit: 'mg/dL', normal: '0.6-1.2', status: 'Normal' },
                bun: { value: '15', unit: 'mg/dL', normal: '6-24', status: 'Normal' },
                egfr: { value: '85', unit: 'mL/min/1.73m²', normal: '>60', status: 'Normal' }
            }
        },
        {
            id: 'TR-000128',
            orderId: 'ORD-003461',
            patientId: 'PT-923401',
            patientName: 'Trần Quốc Lâm',
            dateOfBirth: '15-05-2004',
            gender: 'Male',
            phoneNumber: '0123456789',
            testType: 'Diabetes Panel',
            department: 'Endocrinology',
            status: 'Completed',
            resultDate: '2024-02-10',
            priority: 'Medium',
            doctor: 'Dr. Wilson',
            completionTime: '13:15',
            results: {
                fastingGlucose: { value: '95', unit: 'mg/dL', normal: '<100', status: 'Normal' },
                hba1c: { value: '5.6', unit: '%', normal: '<5.7', status: 'Normal' },
                insulin: { value: '8.5', unit: 'µU/mL', normal: '2.6-24.9', status: 'Normal' }
            }
        },
        {
            id: 'TR-000129',
            orderId: 'ORD-003462',
            patientId: 'PT-923401',
            patientName: 'Trần Quốc Lâm',
            dateOfBirth: '15-05-2004',
            gender: 'Male',
            phoneNumber: '0123456789',
            testType: 'Vitamin D Test',
            department: 'Internal Medicine',
            status: 'Completed',
            resultDate: '2024-02-15',
            priority: 'Low',
            doctor: 'Dr. Smith',
            completionTime: '15:00',
            results: {
                vitaminD: { value: '32', unit: 'ng/mL', normal: '30-100', status: 'Normal' }
            }
        },
        {
            id: 'TR-000130',
            orderId: 'ORD-003463',
            patientId: 'PT-923401',
            patientName: 'Trần Quốc Lâm',
            dateOfBirth: '15-05-2004',
            gender: 'Male',
            phoneNumber: '0123456789',
            testType: 'Iron Studies',
            department: 'Hematology',
            status: 'Completed',
            resultDate: '2024-02-20',
            priority: 'Medium',
            doctor: 'Dr. Johnson',
            completionTime: '12:45',
            results: {
                ferritin: { value: '45', unit: 'ng/mL', normal: '15-150', status: 'Normal' },
                iron: { value: '85', unit: 'µg/dL', normal: '60-170', status: 'Normal' },
                tibc: { value: '320', unit: 'µg/dL', normal: '240-450', status: 'Normal' }
            }
        },
        {
            id: 'TR-000131',
            orderId: 'ORD-003464',
            patientId: 'PT-923401',
            patientName: 'Trần Quốc Lâm',
            dateOfBirth: '15-05-2004',
            gender: 'Male',
            phoneNumber: '0123456789',
            testType: 'PSA Test',
            department: 'Urology',
            status: 'Completed',
            resultDate: '2024-02-25',
            priority: 'Low',
            doctor: 'Dr. Brown',
            completionTime: '14:30',
            results: {
                psa: { value: '2.1', unit: 'ng/mL', normal: '<4.0', status: 'Normal' },
                freePsa: { value: '0.8', unit: 'ng/mL', normal: '>0.25', status: 'Normal' }
            }
        },
        {
            id: 'TR-000132',
            orderId: 'ORD-003465',
            patientId: 'PT-923401',
            patientName: 'Trần Quốc Lâm',
            dateOfBirth: '15-05-2004',
            gender: 'Male',
            phoneNumber: '0123456789',
            testType: 'Urine Analysis',
            department: 'Nephrology',
            status: 'Completed',
            resultDate: '2024-03-01',
            priority: 'Medium',
            doctor: 'Dr. Davis',
            completionTime: '10:00',
            results: {
                protein: { value: 'Negative', unit: '', normal: 'Negative', status: 'Normal' },
                glucose: { value: 'Negative', unit: '', normal: 'Negative', status: 'Normal' },
                blood: { value: 'Negative', unit: '', normal: 'Negative', status: 'Normal' }
            }
        }
    ];

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

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High':
                return 'bg-red-100 text-red-800'
            case 'Medium':
                return 'bg-orange-100 text-orange-800'
            case 'Low':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(testReports.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTestReports = testReports.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleViewResult = (report: any) => {
        setSelectedTestReport(report);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTestReport(null);
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

    // Show loading state while checking profile
    if (loading) {
        return (
            <div className="flex-1 p-6 bg-gradient-to-br from-sky-100 to-violet-100 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Đang kiểm tra thông tin...</span>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 bg-gradient-to-br from-sky-100 to-violet-100">

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-lg border border-sky-200 mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'personal-record', label: 'Personal Record' },
                            { id: 'test-history', label: 'Test History' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'personal-record' && (
                        <div>
                            {/* Patient Information and Test Information */}
                            {userData && testReports.slice(0, 1).map((report, index) => (
                                <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm">
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
                                                    <span className="font-medium text-gray-900">{userData.fullName || ''}</span>
                                    </div>
                                        <div className="flex justify-between">
                                                    <span className="text-gray-600">Date of Birth:</span>
                                                    <span className="font-medium text-gray-900">{formatDateOfBirthForDisplay(userData.dateOfBirth || '')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                                    <span className="text-gray-600">Gender:</span>
                                                    <span className="font-medium text-gray-900">{userData.gender || ''}</span>
                                        </div>
                                        <div className="flex justify-between">
                                                    <span className="text-gray-600">Phone Number:</span>
                                                    <span className="font-medium text-gray-900">{userData.phoneNumber || ''}</span>
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
                                                    <span className="font-medium text-gray-900">{report.testType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                                    <span className="text-gray-600">Department:</span>
                                                    <span className="font-medium text-gray-900">{report.department}</span>
                                        </div>
                                        <div className="flex justify-between">
                                                    <span className="text-gray-600">Result Date:</span>
                                                    <span className="font-medium text-gray-900">{report.resultDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                                    <span className="text-gray-600">Doctor:</span>
                                                    <span className="font-medium text-gray-900">{report.doctor}</span>
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
                                                    {Object.entries(report.results).map(([key, result], resultIndex) => (
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
                                                    <span className="font-semibold text-green-600">✓ Overall Assessment:</span> All blood parameters are within normal ranges.
                                                </p>
                                                <p className="mb-2">
                                                    <span className="font-semibold text-blue-600">📊 Key Findings:</span> Complete Blood Count shows healthy blood cell counts and morphology.
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
                                                    <span className="font-semibold text-orange-600">👨‍⚕️ Dr. Smith:</span>
                                                </p>
                                                <p className="mb-3 pl-4 border-l-2 border-orange-200">
                                                    "Patient's CBC results are excellent. All parameters are within normal limits, indicating good overall health. No immediate concerns or follow-up required."
                                                </p>
                                                <p className="mb-2">
                                                    <span className="font-semibold text-gray-600">📅 Review Date:</span> {report.resultDate}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-3">
                                                    Reviewed by {report.doctor} • Department of {report.department}
                                                </p>
                                    </div>
                                </div>
                            </div>

                            {/* Export Buttons */}
                            <div className="flex justify-end gap-4 mt-6">
                                <button className="flex items-center gap-2 bg-gradient-to-r from-sky-300 to-violet-400 text-white px-6 py-3 rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all font-medium shadow-sm hover:shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                                    </svg>
                                    Export Excel
                                </button>
                                <button className="flex items-center gap-2 bg-gradient-to-r from-sky-300 to-violet-400 text-white px-6 py-3 rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all font-medium shadow-sm hover:shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                                    </svg>
                                    Export PDF
                                </button>
                            </div>
                        </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'test-history' && (
                        <div>
                            {/* Test Results Table */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-green-50">
                                            <tr>
                                                <th className="text-left py-4 px-6 font-semibold text-green-800">Test Result Code</th>
                                                <th className="text-left py-4 px-6 font-semibold text-green-800">Patient Name</th>
                                                <th className="text-left py-4 px-6 font-semibold text-green-800">Test Type</th>
                                                <th className="text-left py-4 px-6 font-semibold text-green-800">Status</th>
                                                <th className="text-left py-4 px-6 font-semibold text-green-800">Priority</th>
                                                <th className="text-left py-4 px-6 font-semibold text-green-800">Result Date</th>
                                                <th className="text-left py-4 px-6 font-semibold text-green-800">Doctor</th>
                                                <th className="text-left py-4 px-6 font-semibold text-green-800">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentTestReports.map((report, index) => (
                                                <tr key={report.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="py-4 px-6 text-gray-800 font-medium">{report.id}</td>
                                                    <td className="py-4 px-6 text-gray-800">{report.patientName}</td>
                                                    <td className="py-4 px-6 text-gray-600">{report.testType}</td>
                                                    <td className="py-4 px-6">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                                            {report.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                                                            {report.priority}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-600">{report.resultDate}</td>
                                                    <td className="py-4 px-6 text-gray-600">{report.doctor}</td>
                                                    <td className="py-4 px-6">
                                                        <button 
                                                            onClick={() => handleViewResult(report)}
                                                            className="bg-gradient-to-r from-sky-300 to-violet-400 text-white px-4 py-2 rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all text-sm font-medium shadow-sm hover:shadow-md" 
                                                            title="View Results"
                                                        >
                                                            View Result
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                                        <div className="flex items-center text-sm text-gray-700">
                                            <span>
                                                Showing {startIndex + 1} to {Math.min(endIndex, testReports.length)} of {testReports.length} results
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                            {/* Previous Button */}
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                                    currentPage === 1
                                                        ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                                        : 'text-white bg-gradient-to-r from-sky-300 to-violet-400 hover:from-sky-400 hover:to-violet-500 transition-all'
                                                }`}
                                            >
                                                Previous
                                            </button>
                                            
                                            {/* Page Numbers */}
                                            <div className="flex space-x-1">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                                                            currentPage === page
                                                                ? 'bg-gradient-to-r from-sky-300 to-violet-400 text-white'
                                                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                            </div>
                                            
                                            {/* Next Button */}
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                                    currentPage === totalPages
                                                        ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                                        : 'text-white bg-gradient-to-r from-sky-300 to-violet-400 hover:from-sky-400 hover:to-violet-500 transition-all'
                                                }`}
                                            >
                                                Next
                                            </button>
                                        </div>
                        </div>
                    )}
                        </div>
                        </div>
                    )}
                </div>
            </div>

            {/* View Results Modal */}
            <ViewResultsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                testReport={selectedTestReport}
                userData={userData}
            />
        </div>
    );
}

export default Home;
