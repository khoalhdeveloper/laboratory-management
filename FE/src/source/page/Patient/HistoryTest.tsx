import { useState, useEffect } from 'react';
import ViewResultsModal from './ViewResults';
import { testResultsAPI } from '../Axios/Axios';
import '../../../source/CSS/Loading.css';

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
    createdAt?: string; // 🕒 thêm để lưu gốc thời gian
    results: any;
}

interface HistoryTestProps {
    testReports?: TestReport[];
    userData: any;
    onViewResult?: (report: any) => void;
}

function HistoryTest({ testReports: propTestReports, userData, onViewResult }: HistoryTestProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [selectedTestReport, setSelectedTestReport] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [testReports, setTestReports] = useState<TestReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingViewResult, setLoadingViewResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Filter state - only Test Type
    const [filterTestType, setFilterTestType] = useState('all');

    const getStatusColor = (_status: string) => {
        return 'bg-green-100 text-green-800';
    };

    // Track loading state
    useEffect(() => {
        setIsLoading(loadingViewResult !== null);
    }, [loadingViewResult]);


    useEffect(() => {
        const loadTestResults = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await testResultsAPI.getMyTestResults();
                
                if (response.data && response.data.data) {
                    const dataArray = response.data.data;
                    const apiTestReports = dataArray.map((item: any) => {
                        const testOrder = item.testOrder || {};
                        const testResult = item.testResult || {};
                        const createdAt = testResult.createdAt || testResult.created_at || testResult.date;

                        return {
                            id: testOrder.order_code || `TR-${Date.now()}`,
                            orderId: testOrder.order_code || 'N/A',
                            patientId: testOrder.userid || 'N/A',
                            patientName: testOrder.patient_name || 'N/A',
                            dateOfBirth: testOrder.date_of_birth || 'N/A',
                            gender: testOrder.gender || 'N/A',
                            phoneNumber: testOrder.phone_number || 'N/A',
                            testType: testOrder.test_type || 'N/A',
                            department: 'Laboratory',
                            status: testOrder.status === 'completed' ? 'Completed' : (testOrder.status || 'Pending'),
                            priority: testOrder.priority || 'Medium',
                            resultDate: createdAt ? (() => {
                                const date = new Date(createdAt);
                                const day = String(date.getDate()).padStart(2, '0');
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const year = date.getFullYear();
                                return `${day}-${month}-${year}`;
                            })() : 'N/A',
                            doctor: testResult.doctor_name || 'N/A',
                            completionTime: createdAt ? new Date(createdAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : 'N/A',
                            createdAt: createdAt,
                            results: testResult || {}
                        };
                    });
                    
                    setTestReports(apiTestReports);
                } else {
                    setTestReports([]);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load test results');
                setTestReports([]);
            } finally {
                setLoading(false);
            }
        };

        loadTestResults();
    }, [propTestReports]);

    // Get unique test types from reports
    const uniqueTestTypes = Array.from(new Set(testReports.map(report => report.testType).filter(type => type !== 'N/A'))).sort();

    // Filter handler for Test Type
    const handleTestTypeChange = (value: string) => {
        setFilterTestType(value);
    };

    // Filter test reports by Test Type
    const filteredReports = testReports.filter(report => {
        if (filterTestType === 'all') {
            return true;
        }
        return report.testType === filterTestType;
    });

    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTestReports = filteredReports.slice(startIndex, endIndex);
    
    // Reset to first page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterTestType]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleViewResult = async (report: any) => {
        setLoadingViewResult(report.orderId);
        setError(null);
        
        // Force a re-render to show loading state
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
            // Load detailed test result data
            const response = await testResultsAPI.getTestResults(report.orderId);
            
            if (response.data && response.data.data) {
                const apiData = response.data.data;
                const testOrder = apiData.testOrder || {};
                const testResult = apiData.testResult || {};
                
                // Helper function to determine status based on value and normal range
                const getStatus = (value: number, min: number, max: number) => {
                    if (value < min || value > max) return 'Abnormal'
                    return 'Normal'
                }
                
                const detailedReport = {
                    id: testResult._id || testOrder._id || 'N/A',
                    orderId: testOrder.order_code || 'N/A',
                    patientId: testOrder.userid || 'N/A',
                    patientName: testOrder.patient_name || 'N/A',
                    dateOfBirth: testOrder.date_of_birth || 'N/A',
                    gender: testOrder.gender || 'N/A',
                    phoneNumber: testOrder.phone_number || testOrder.phoneNumber || testOrder.phone || userData?.phoneNumber || 'N/A',
                    testType: testOrder.test_type || 'N/A',
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
                    results: {
                        wbc: { 
                            value: testResult.wbc_value?.toString() || 'N/A', 
                            unit: '10³/µL', 
                            normal: '4.0-11.0', 
                            status: testResult.wbc_value ? getStatus(testResult.wbc_value, 4, 11) : 'Normal'
                        },
                        rbc: { 
                            value: testResult.rbc_value?.toString() || 'N/A', 
                            unit: '10⁶/µL', 
                            normal: '4.5-5.9', 
                            status: testResult.rbc_value ? getStatus(testResult.rbc_value, 4.5, 5.9) : 'Normal'
                        },
                        hemoglobin: { 
                            value: testResult.hgb_value?.toString() || 'N/A', 
                            unit: 'g/dL', 
                            normal: '13.5-17.5', 
                            status: testResult.hgb_value ? getStatus(testResult.hgb_value, 13.5, 17.5) : 'Normal'
                        },
                        hematocrit: { 
                            value: testResult.hct_value?.toString() || 'N/A', 
                            unit: '%', 
                            normal: '41.0-50.0', 
                            status: testResult.hct_value ? getStatus(testResult.hct_value, 41, 50) : 'Normal'
                        },
                        platelet: { 
                            value: testResult.plt_value?.toString() || 'N/A', 
                            unit: '10³/µL', 
                            normal: '150-450', 
                            status: testResult.plt_value ? getStatus(testResult.plt_value, 150, 450) : 'Normal'
                        },
                        mcv: { 
                            value: testResult.mcv_value?.toString() || 'N/A', 
                            unit: 'fL', 
                            normal: '80-100', 
                            status: testResult.mcv_value ? getStatus(testResult.mcv_value, 80, 100) : 'Normal'
                        },
                        mch: { 
                            value: testResult.mch_value?.toString() || 'N/A', 
                            unit: 'pg', 
                            normal: '27-33', 
                            status: testResult.mch_value ? getStatus(testResult.mch_value, 27, 33) : 'Normal'
                        },
                        mchc: { 
                            value: testResult.mchc_value?.toString() || 'N/A', 
                            unit: 'g/dL', 
                            normal: '32-36', 
                            status: testResult.mchc_value ? getStatus(testResult.mchc_value, 32, 36) : 'Normal'
                        }
                    },
                    instrumentName: testResult.instrument_name || 'N/A',
                    aiDescription: testResult.ai_description || 'N/A',
                    doctorComments: testResult.comments || []
                };
                
                setSelectedTestReport(detailedReport);
                setIsModalOpen(true);
            } else {
                setError('No test result found for this order code');
            }
        } catch (error: any) {
            setError(error.response?.data?.message || error.message || 'Failed to load test result');
        } finally {
            setLoadingViewResult(null);
        }
        
        // Call onViewResult if provided (for parent component handling)
        if (onViewResult) {
            onViewResult(report);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTestReport(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="loader" style={{ borderColor: '#000000' }}></div>
                <span className="ml-4 text-gray-600">Loading test results...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                    <div className="text-red-600 mr-2">⚠️</div>
                    <p className="text-red-800">{error}</p>
                </div>
            </div>
        );
    }

    if (testReports.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <div className="text-gray-500 text-lg mb-2">📋</div>
                <p className="text-gray-600">No test results found</p>
                <p className="text-gray-500 text-sm">Your test history will appear here once you have completed tests.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Filter - Test Type Only */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm p-4 mb-4">
                <div className="max-w-md">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Test Type
                    </label>
                    <select
                        value={filterTestType}
                        onChange={(e) => handleTestTypeChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm appearance-none bg-white dark:bg-gray-700"
                    >
                        <option value="all">All Test Types</option>
                        {uniqueTestTypes.map((testType) => (
                            <option key={testType} value={testType}>
                                {testType}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm relative">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/40 backdrop-blur-[1px]">
                        <div className="flex flex-col items-center gap-3">
                            <div className="loader" style={{ borderColor: '#000000' }}></div>
                            <span className="text-gray-800 dark:text-gray-200 text-sm">Loading results...</span>
                        </div>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-200 dark:bg-gray-600">
                            <tr>
                                <th className="text-left py-3 px-3 lg:py-4 lg:px-6 font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Test Result Code</th>
                                <th className="text-left py-3 px-3 lg:py-4 lg:px-6 font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Patient Name</th>
                                <th className="text-left py-3 px-3 lg:py-4 lg:px-6 font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Test Type</th>
                                <th className="text-left py-3 px-3 lg:py-4 lg:px-6 font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Status</th>
                                <th className="text-left py-3 px-3 lg:py-4 lg:px-6 font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Result Date</th>
                                <th className="text-left py-3 px-3 lg:py-4 lg:px-6 font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Doctor</th>
                                <th className="text-left py-3 px-3 lg:py-4 lg:px-6 font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTestReports.map((report) => (
                                <tr key={report.id} className="bg-gray-100 dark:bg-gray-700">
                                    <td className="py-3 px-3 lg:py-4 lg:px-6 text-gray-800 dark:text-white font-medium text-sm lg:text-base">{report.id}</td>
                                    <td className="py-3 px-3 lg:py-4 lg:px-6 text-gray-800 dark:text-white text-sm lg:text-base">{report.patientName}</td>
                                    <td className="py-3 px-3 lg:py-4 lg:px-6 text-gray-600 dark:text-white text-sm lg:text-base">{report.testType}</td>
                                    <td className="py-3 px-3 lg:py-4 lg:px-6">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 lg:py-4 lg:px-6 text-gray-600 dark:text-white text-sm lg:text-base">{report.resultDate}</td>
                                    <td className="py-3 px-3 lg:py-4 lg:px-6 text-gray-600 dark:text-white text-sm lg:text-base">{report.doctor}</td>
                                    <td className="py-3 px-3 lg:py-4 lg:px-6">
                                        <button 
                                            onClick={() => handleViewResult(report)}
                                            disabled={loadingViewResult === report.orderId || isLoading}
                                            className={`px-2 py-1 lg:px-4 lg:py-2 rounded-lg transition-all text-xs lg:text-sm font-medium shadow-sm hover:shadow-md whitespace-nowrap ${
                                                (loadingViewResult === report.orderId || isLoading)
                                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-sky-300 to-violet-400 text-white hover:from-sky-400 hover:to-violet-500'
                                            }`}
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
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <span>
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredReports.length)} of {filteredReports.length} results
                            </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    currentPage === 1
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500'
                                }`}
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                        currentPage === page
                                            ? 'bg-gradient-to-r from-sky-300 to-violet-400 text-white shadow-sm'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    currentPage === totalPages
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {!onViewResult && (
                <ViewResultsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    testReport={selectedTestReport}
                    userData={userData}
                />
            )}
        </div>
    );
}

export default HistoryTest;
