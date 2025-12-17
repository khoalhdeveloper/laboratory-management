import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, testResultsAPI } from '../Axios/Axios';
import ViewResultsModal from './ViewResults';
import HistoryTest from './HistoryTest';
import { exportTestResultsToPDFHTML } from '../../../utils/exportUtils';
import { toast } from '../../../utils/toast';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import '../../../source/CSS/Loading.css';

function Home() {
    const navigate = useNavigate();
    const { isDarkMode: _isDarkMode } = useGlobalTheme();
    const [activeTab, setActiveTab] = useState('personal-record');
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [testReports, setTestReports] = useState<any[]>([]);
    const [testReportsLoading, setTestReportsLoading] = useState(false);
    const [testReportsError, setTestReportsError] = useState<string | null>(null);
    const [selectedTestReport, setSelectedTestReport] = useState<any>(null);

    useEffect(() => {
        const checkProfile = async () => {
            try {
                setLoading(true);
                   const response = await userAPI.getCurrentUser();
                   const userData = response.data;
                   
                   let actualUserData;
                   if (userData.data) {
                       actualUserData = userData.data;
                   } else {
                       actualUserData = userData;
                   }
                
                setUserData(actualUserData);
                
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
                
                   const fieldStatus = requiredFields.map(field => {
                       const value = actualUserData[field];
                       return value && value.toString().trim() !== '';
                   });
                   
                   const isComplete = fieldStatus.every(status => status);
                   
                   if (!isComplete) {
                       navigate('/patient/incomplete-profile', { replace: true });
                   }
            } catch (error) {
                navigate('/patient/incomplete-profile', { replace: true });
            } finally {
                setLoading(false);
            }
        };

        checkProfile();
    }, [navigate]);

    // Function to format API results into display format (similar to Nurse ViewResults)
    const formatApiResults = (resultsData: any, testType: string) => {
        if (!resultsData) return null;
        
        // Helper function to determine status based on value and normal range
        const getStatus = (value: number, min: number, max: number) => {
            if (value < min || value > max) return 'Abnormal';
            return 'Normal';
        };
        
        // Helper function to check if value is numeric (not Negative/Positive text)
        const isNumeric = (val: any) => {
            if (val === null || val === undefined || val === 'N/A' || val === '') return false;
            const strVal = String(val).trim().toLowerCase();
            if (strVal === 'negative' || strVal === 'positive') return false;
            const numVal = parseFloat(strVal);
            return !isNaN(numVal) && isFinite(numVal);
        };
        
        // Check if this is URINALYSIS
        if (testType === 'Urinalysis') {
            return {
                leukocytes: {
                    value: resultsData.leu_value || 'N/A',
                    unit: isNumeric(resultsData.leu_value) ? 'Leu/UL' : '',
                    normal: 'Negative',
                    status: (resultsData.leu_value === 'Negative' || String(resultsData.leu_value).toLowerCase() === 'negative') ? 'Normal' : 'Abnormal'
                },
                nitrite: {
                    value: resultsData.nit_value || 'N/A',
                    unit: '',
                    normal: 'Negative',
                    status: (resultsData.nit_value === 'Negative' || String(resultsData.nit_value).toLowerCase() === 'negative') ? 'Normal' : 'Abnormal'
                },
                protein: {
                    value: resultsData.pro_value?.toString() || 'N/A',
                    unit: isNumeric(resultsData.pro_value) ? 'mg/dL' : '',
                    normal: 'Negative',
                    status: (resultsData.pro_value === 'Negative' || String(resultsData.pro_value).toLowerCase() === 'negative' || resultsData.pro_value === 0 || resultsData.pro_value === '0') ? 'Normal' : 'Abnormal'
                },
                pH: {
                    value: resultsData.ph_value?.toString() || 'N/A',
                    unit: '',
                    normal: '5.0-8.0',
                    status: (resultsData.ph_value >= 5.0 && resultsData.ph_value <= 8.0) ? 'Normal' : 'Abnormal'
                },
                blood: {
                    value: resultsData.bld_value || 'N/A',
                    unit: isNumeric(resultsData.bld_value) ? 'mg/dL' : '',
                    normal: 'Negative',
                    status: (resultsData.bld_value === 'Negative' || String(resultsData.bld_value).toLowerCase() === 'negative') ? 'Normal' : 'Abnormal'
                },
                specificGravity: {
                    value: resultsData.sg_value?.toString() || 'N/A',
                    unit: '',
                    normal: '1.005-1.030',
                    status: (resultsData.sg_value >= 1.005 && resultsData.sg_value <= 1.030) ? 'Normal' : 'Abnormal'
                },
                ketone: {
                    value: resultsData.ket_value || 'N/A',
                    unit: isNumeric(resultsData.ket_value) ? 'mg/dL' : '',
                    normal: 'Negative',
                    status: (resultsData.ket_value === 'Negative' || String(resultsData.ket_value).toLowerCase() === 'negative') ? 'Normal' : 'Abnormal'
                },
                glucose: {
                    value: resultsData.glu_value || 'N/A',
                    unit: isNumeric(resultsData.glu_value) ? 'mg/dL' : '',
                    normal: 'Negative',
                    status: (resultsData.glu_value === 'Negative' || String(resultsData.glu_value).toLowerCase() === 'negative') ? 'Normal' : 'Abnormal'
                }
            };
        }
        
        // Check if this is FECAL ANALYSIS
        if (testType === 'Fecal Analysis') {
            try {
                const details = JSON.parse(resultsData.result_details || '{}');
                if (details.results) {
                    const formatted: any = {};
                    Object.entries(details.results).forEach(([key, value]: [string, any]) => {
                        formatted[key] = {
                            value: value.value,
                            unit: value.unit || '',
                            normal: value.normalRange,
                            status: value.status === 'normal' ? 'Normal' : 'Abnormal'
                        };
                    });
                    return formatted;
                }
            } catch (err) {
                // Silent error - fallback to blood test format
            }
        }
        
        // Default: Blood Test parameters
        return {
            wbc: { 
                value: resultsData.wbc_value?.toString() || 'N/A', 
                unit: '10³/µL', 
                normal: '4.0-11.0', 
                status: resultsData.wbc_value ? getStatus(resultsData.wbc_value, 4, 11) : 'Normal'
            },
            rbc: { 
                value: resultsData.rbc_value?.toString() || 'N/A', 
                unit: '10⁶/µL', 
                normal: '4.5-5.9', 
                status: resultsData.rbc_value ? getStatus(resultsData.rbc_value, 4.5, 5.9) : 'Normal'
            },
            hemoglobin: { 
                value: resultsData.hgb_value?.toString() || 'N/A', 
                unit: 'g/dL', 
                normal: '13.5-17.5', 
                status: resultsData.hgb_value ? getStatus(resultsData.hgb_value, 13.5, 17.5) : 'Normal'
            },
            hematocrit: { 
                value: resultsData.hct_value?.toString() || 'N/A', 
                unit: '%', 
                normal: '41.0-50.0', 
                status: resultsData.hct_value ? getStatus(resultsData.hct_value, 41, 50) : 'Normal'
            },
            platelet: { 
                value: resultsData.plt_value?.toString() || 'N/A', 
                unit: '10³/µL', 
                normal: '150-450', 
                status: resultsData.plt_value ? getStatus(resultsData.plt_value, 150, 450) : 'Normal'
            },
            mcv: { 
                value: resultsData.mcv_value?.toString() || 'N/A', 
                unit: 'fL', 
                normal: '80-100', 
                status: resultsData.mcv_value ? getStatus(resultsData.mcv_value, 80, 100) : 'Normal'
            },
            mch: { 
                value: resultsData.mch_value?.toString() || 'N/A', 
                unit: 'pg', 
                normal: '27-33', 
                status: resultsData.mch_value ? getStatus(resultsData.mch_value, 27, 33) : 'Normal'
            },
            mchc: { 
                value: resultsData.mchc_value?.toString() || 'N/A', 
                unit: 'g/dL', 
                normal: '32-36', 
                status: resultsData.mchc_value ? getStatus(resultsData.mchc_value, 32, 36) : 'Normal'
            }
        };
    };

    // Load test results from API
    useEffect(() => {
        const loadTestResults = async () => {
            try {
                setTestReportsLoading(true);
                setTestReportsError(null);
                
                const response = await testResultsAPI.getMyTestResults();
                
                if (response.data && response.data.data) {
                    const apiData = response.data.data;
                    
                    const formattedReports = apiData.map((item: any) => {
                        const testOrder = item.testOrder || {};
                        const testResult = item.testResult || {};
                        const testType = testOrder.test_type || 'N/A';
                        
                        // Use formatApiResults to format results based on test type
                        const formattedResults = formatApiResults(testResult, testType);
                        
                        return {
                            id: testResult._id || testOrder._id || 'N/A',
                            orderId: testOrder.order_code || 'N/A',
                            patientId: testOrder.userid || 'N/A',
                            patientName: testOrder.patient_name || 'N/A',
                            dateOfBirth: testOrder.date_of_birth || 'N/A',
                            gender: testOrder.gender || 'N/A',
                            phoneNumber: testOrder.phone_number || userData?.phoneNumber || 'N/A',
                            testType: testType,
                            department: 'Laboratory',
                            status: testResult.status || testOrder.status || 'Completed',
                            resultDate: (testResult.createdAt || testResult.created_at || testResult.date) ? (() => {
                                const date = new Date(testResult.createdAt || testResult.created_at || testResult.date);
                                const day = String(date.getDate()).padStart(2, '0');
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const year = date.getFullYear();
                                return `${day}-${month}-${year}`;
                            })() : 'N/A',
                            priority: 'Medium',
                            doctor: testResult.doctor_name || 'N/A',
                            completionTime: testResult.createdAt ? new Date(testResult.createdAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : 'N/A',
                            results: formattedResults || {},
                            resultSummary: testResult.result_summary || 'N/A',
                            resultDetails: testResult.result_details || 'N/A',
                            instrumentId: testResult.instrument_id || 'N/A',
                            instrumentName: testResult.instrument_name || 'N/A',
                            originalCreatedAt: testResult.createdAt,
                            aiDescription: testResult.ai_description || 'N/A',
                            doctorComments: testResult.comments || []
                        };
                    });
                    
                    // Sort by creation date to get the latest first
                    const sortedReports = formattedReports.sort((a: any, b: any) => {
                        // Use original createdAt from API for accurate sorting
                        const dateA = new Date(a.originalCreatedAt || a.resultDate);
                        const dateB = new Date(b.originalCreatedAt || b.resultDate);
                        return dateB.getTime() - dateA.getTime(); // Latest first
                    });
                    
                    setTestReports(sortedReports);
                } else {
                    setTestReports([]);
                }
            } catch (error: any) {
                setTestReportsError(error.response?.data?.message || error.message || 'Failed to load test results');
                setTestReports([]);
            } finally {
                setTestReportsLoading(false);
            }
        };

        if (userData) {
            loadTestResults();
        }
    }, [userData]);


    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Normal':
                return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            case 'Abnormal':
                return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
            case 'Borderline':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
            case 'Completed':
                return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            case 'No Data':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }
    };

    const handleViewResult = async (report: any) => {
        try {
            setTestReportsError(null);
            
            // Load detailed test result data
            const response = await testResultsAPI.getTestResults(report.orderId);
            
            if (response.data && response.data.data) {
                const apiData = response.data.data;
                const testOrder = apiData.testOrder || {};
                const testResult = apiData.testResult || {};
                const testType = testOrder.test_type || 'N/A';
                
                // Use formatApiResults to format results based on test type
                const formattedResults = formatApiResults(testResult, testType);
                
                const detailedReport = {
                    id: testResult._id || testOrder._id || 'N/A',
                    orderId: testOrder.order_code || 'N/A',
                    patientId: testOrder.userid || 'N/A',
                    patientName: testOrder.patient_name || 'N/A',
                    dateOfBirth: testOrder.date_of_birth || 'N/A',
                    gender: testOrder.gender || 'N/A',
                    phoneNumber: testOrder.phone_number || testOrder.phoneNumber || testOrder.phone || userData?.phoneNumber || 'N/A',
                    testType: testType,
                    department: 'Laboratory',
                    status: testResult.status || testOrder.status || 'Completed',
                    resultDate: (testResult.createdAt || testResult.created_at || testResult.date) ? (() => {
                        const date = new Date(testResult.createdAt || testResult.created_at || testResult.date);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = date.getFullYear();
                        return `${day}-${month}-${year}`;
                    })() : 'N/A',
                    priority: 'Medium',
                    doctor: testResult.doctor_name || 'N/A',
                    completionTime: testResult.createdAt ? new Date(testResult.createdAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : 'N/A',
                    results: formattedResults || {},
                    instrumentName: testResult.instrument_name || 'N/A',
                    aiDescription: testResult.ai_description || 'N/A',
                    doctorComments: testResult.comments || []
                };
                
                setSelectedTestReport(detailedReport);
                setIsModalOpen(true);
            } else {
                setTestReportsError('No test result found for this order code');
            }
        } catch (error: any) {
            setTestReportsError(error.response?.data?.message || error.message || 'Failed to load test result');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTestReport(null);
    };

    const handleExportPersonalRecord = async () => {
        try {
            if (!userData || !testReports[0]) {
                toast.error('No data available to export');
                return;
            }

            const result = await exportTestResultsToPDFHTML(testReports[0], userData);
            if (result.success) {
                toast.success('Personal record exported to PDF successfully!');
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to export personal record');
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

    if (loading) {
        return (
            <div className="flex-1 p-6 bg-gradient-to-br from-sky-100 to-violet-100 flex flex-col justify-center items-center">
                <div className="loader" style={{
                    borderColor: '#000000'
                }}></div>
                <span className="mt-4 text-gray-600">Checking information...</span>
            </div>
        );
    }

    return (
        <div className="flex-1 p-3 lg:p-6 bg-gradient-to-br from-sky-100 to-violet-100 dark:from-gray-800 dark:to-gray-900 min-h-screen">

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-lg shadow-lg border border-sky-200 dark:border-gray-600 mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-4 lg:space-x-8 px-3 lg:px-6 overflow-x-auto">
                        {[
                            { id: 'personal-record', label: 'Personal Record' },
                            { id: 'test-history', label: 'Test History' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-3 lg:py-4 px-2 lg:px-1 border-b-2 font-medium text-xs lg:text-sm whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text text-transparent'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                {tab.label.split(' ').map((word, index) => (
                                    <span key={index} className={activeTab === tab.id ? 'text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text' : ''}>
                                        {word}
                                        {index < tab.label.split(' ').length - 1 && '\u00A0'}
                                    </span>
                                ))}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-3 lg:p-6">
                    {activeTab === 'personal-record' && (
                        <div>
                            
                            {testReportsLoading && (
                                <div className="flex justify-center items-center py-8">
                                    <div className="loader" style={{ borderColor: '#000000' }}></div>
                                    <span className="ml-4 text-gray-600">Loading test results...</span>
                                </div>
                            )}
                            
                            {testReportsError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-red-800">{testReportsError}</span>
                                    </div>
                                </div>
                            )}
                            
                            {!testReportsLoading && !testReportsError && testReports.length === 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                                    <svg className="w-12 h-12 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-yellow-800 mb-2">No Test Results Found</h3>
                                    <p className="text-yellow-700">You don't have any test results available yet. Please contact your healthcare provider.</p>
                                </div>
                            )}
                            

                            {/* Show test results if available - Display the first (newest) report */}
                            {!testReportsLoading && !testReportsError && testReports.length > 0 && testReports.slice(0, 1).map((report, index) => (
                                <div key={index} className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 border-b border-gray-200 dark:border-gray-600">
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
                                                    <span className="text-sm lg:text-base text-gray-600 dark:text-black">Name:</span>
                                                    <span className="font-medium text-sm lg:text-base text-gray-900 dark:text-black">{report.patientName || userData?.fullName || 'N/A'}</span>
                                    </div>
                                        <div className="flex justify-between">
                                                    <span className="text-sm lg:text-base text-gray-600 dark:text-black">Date of Birth:</span>
                                                    <span className="font-medium text-sm lg:text-base text-gray-900 dark:text-black">{formatDateOfBirthForDisplay(report.dateOfBirth || userData?.dateOfBirth || '')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                                    <span className="text-sm lg:text-base text-gray-600 dark:text-black">Gender:</span>
                                                    <span className="font-medium text-sm lg:text-base text-gray-900 dark:text-black">{report.gender || userData?.gender || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                                    <span className="text-sm lg:text-base text-gray-600 dark:text-black">Phone Number:</span>
                                                    <span className="font-medium text-sm lg:text-base text-gray-900 dark:text-black">{report.phoneNumber || userData?.phoneNumber || 'N/A'}</span>
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
                                                    <span className="text-sm lg:text-base text-gray-600 dark:text-black">Test Type:</span>
                                                    <span className="font-medium text-sm lg:text-base text-gray-900 dark:text-black">{report.testType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                                    <span className="text-sm lg:text-base text-gray-600 dark:text-black">Result Date:</span>
                                                    <span className="font-medium text-sm lg:text-base text-gray-900 dark:text-black">{report.resultDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                                    <span className="text-sm lg:text-base text-gray-600 dark:text-black">Instrument:</span>
                                                    <span className="font-medium text-sm lg:text-base text-gray-900 dark:text-black">{report.instrumentName || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                                    <span className="text-sm lg:text-base text-gray-600 dark:text-black">Doctor:</span>
                                                    <span className="font-medium text-sm lg:text-base text-gray-900 dark:text-black">{report.doctor}</span>
                                                </div>
                                        </div>
                                    </div>
                                </div>

                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Test Results</h3>
                                        <div className="overflow-x-auto">
                                            <div className="overflow-x-auto">
                                                <table className="w-full min-w-[600px]">
                                                <thead className="bg-gray-200 dark:bg-gray-600">
                                                    <tr>
                                                        <th className="px-2 py-2 lg:px-4 lg:py-3 text-left text-sm lg:text-base font-semibold text-gray-900 dark:text-white">Parameter</th>
                                                        <th className="px-2 py-2 lg:px-4 lg:py-3 text-left text-sm lg:text-base font-semibold text-gray-900 dark:text-white">Value</th>
                                                        <th className="px-2 py-2 lg:px-4 lg:py-3 text-left text-sm lg:text-base font-semibold text-gray-900 dark:text-white">Reference Range</th>
                                                        <th className="px-2 py-2 lg:px-4 lg:py-3 text-left text-sm lg:text-base font-semibold text-gray-900 dark:text-white">Unit</th>
                                                        <th className="px-2 py-2 lg:px-4 lg:py-3 text-left text-sm lg:text-base font-semibold text-gray-900 dark:text-white">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {Object.entries(report.results).map(([key, result]: [string, any]) => (
                                                        <tr key={key} className="bg-gray-100 dark:bg-gray-700">
                                                            <td className="px-2 py-2 lg:px-4 lg:py-3 text-sm lg:text-base text-gray-900 dark:text-white font-medium">
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
                                                                
                                                                {/* Fallback: format camelCase to Title Case */}
                                                                {!['wbc', 'rbc', 'hemoglobin', 'hematocrit', 'platelet', 'mcv', 'mch', 'mchc',
                                                                    'leukocytes', 'nitrite', 'protein', 'pH', 'blood', 'specificGravity', 'ketone', 'glucose',
                                                                    'ph_value', 'fobt_value', 'wbcs_value', 'fecal_fat', 'O_and_P', 'rs_value', 'fc_value', 'color'].includes(key) &&
                                                                    key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                            </td>
                                                            <td className="px-2 py-2 lg:px-4 lg:py-3 text-sm lg:text-base font-bold text-gray-900 dark:text-white">{result.value}</td>
                                                            <td className="px-2 py-2 lg:px-4 lg:py-3 text-sm lg:text-base text-gray-600 dark:text-white">{result.normal}</td>
                                                            <td className="px-2 py-2 lg:px-4 lg:py-3 text-sm lg:text-base text-gray-600 dark:text-white">{result.unit}</td>
                                                            <td className="px-2 py-2 lg:px-4 lg:py-3 text-sm lg:text-base">
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
                                </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 p-3 lg:p-6 border-t border-gray-200 dark:border-gray-600">
                                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200 shadow-lg">
                                            <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-700 mb-4 flex items-center">
                                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                            </svg>
                                        </div>
                                                🤖 AI Auto Review
                                            </h3>
                                            <div className="text-sm lg:text-base text-gray-700 leading-relaxed">
                                                {report.aiDescription && report.aiDescription !== 'N/A' ? (
                                                    <div className="bg-gradient-to-br from-white to-emerald-50 p-3 lg:p-5 rounded-xl border-2 border-emerald-300 shadow-md">
                                                        <p className="text-emerald-800 dark:text-emerald-700 leading-relaxed font-medium text-sm lg:text-base">
                                                            🤖 {report.aiDescription}
                                                        </p>
                                                    </div>
                                                ) : null}
                                    </div>
                                                </div>

                                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200 shadow-lg">
                                            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-700 mb-4 flex items-center">
                                                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                            </div>
                                                👨‍⚕️ Doctor Comments
                                            </h3>
                                            <div className="text-sm lg:text-base text-gray-700 leading-relaxed">
                                                {report.doctorComments && report.doctorComments.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {report.doctorComments.map((comment: string, index: number) => (
                                                            <div key={index} className="bg-gradient-to-br from-white to-amber-50 p-3 lg:p-5 rounded-xl border-2 border-amber-300 shadow-md">
                                                                <p className="text-sm lg:text-base text-amber-800 dark:text-amber-700 font-medium">
                                                                    <span className="font-bold text-amber-600">👨‍⚕️</span> {comment}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-6">
                                <button 
                                    onClick={handleExportPersonalRecord}
                                    className="flex items-center gap-2 bg-gradient-to-r from-sky-300 to-violet-400 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all font-medium shadow-sm hover:shadow-md text-sm lg:text-base"
                                >
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
                        <HistoryTest 
                            testReports={testReports}
                            userData={userData}
                            onViewResult={handleViewResult}
                        />
                    )}
                </div>
            </div>

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



