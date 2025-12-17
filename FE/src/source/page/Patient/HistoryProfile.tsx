import { useState, useEffect } from 'react';
import { userAPI } from '../Axios/Axios';
import '../../CSS/Loading.css';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';

interface HistoryProfileProps {
    showNotification: (message: string, type: 'success' | 'error') => void;
}
function HistoryProfile({ showNotification }: HistoryProfileProps) {
    const { isDarkMode } = useGlobalTheme();
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const formatFieldName = (fieldName: string): string => {
        const fieldMap: { [key: string]: string } = {
            'fullName': 'Full Name',
            'phoneNumber': 'Phone Number',
            'email': 'Email',
            'address': 'Address',
            'dateOfBirth': 'Date of Birth',
            'age': 'Age',
            'gender': 'Gender',
            'identifyNumber': 'Identify Number',
            'username': 'Username',
            'role': 'Role',
            'image': 'Profile Image',
            'avatar': 'Avatar'
        };
        
        return fieldMap[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    };

    const formatApiDateTime = (isoDateString: string) => {
        const dateObj = new Date(isoDateString);
        
        const day = dateObj.getUTCDate().toString().padStart(2, '0');
        const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getUTCFullYear();
        
        const hours = dateObj.getUTCHours().toString().padStart(2, '0');
        const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
        const seconds = dateObj.getUTCSeconds().toString().padStart(2, '0');
        
        const formattedDate = `${day}/${month}/${year}`;
        const formattedTime = `${hours}h ${minutes}' ${seconds}''`;
        
        return { formattedDate, formattedTime };
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
                    const result = `${day}-${month}-${year}`;
                    return result;
                }
            }
            else if (dateString.includes('-') && !dateString.includes('T')) {
                const dateParts = dateString.split('-');
                if (dateParts.length === 3) {
                    const [year, month, day] = dateParts;
                    const result = `${day}-${month}-${year}`;
                    return result;
                }
            }
            else if (dateString.includes('/')) {
                const dateParts = dateString.split('/');
                if (dateParts.length === 3) {
                    const [month, day, year] = dateParts;
                    const result = `${day}-${month}-${year}`;
                    return result;
                }
            }
            else {
                const date = new Date(dateString);
                if (!isNaN(date.getTime())) {
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear().toString();
                    const result = `${day}-${month}-${year}`;
                    return result;
                }
            }
        } catch (error) {
        }
        
        return dateString;
    };

    const loadHistoryData = async () => {
        try {
            setHistoryLoading(true);
            
            const userResponse = await userAPI.getCurrentUser();
            
            const userData = userResponse.data;
            
            const userId = userData.userid;
            
            if (!userId) {
                showNotification('User ID not found. Please login again.', 'error');
                return;
            }

            const response = await userAPI.getUserHistory(userId);
            
            const historyResponse = response.data;

            if (Array.isArray(historyResponse)) {
                const allFormattedHistory: any[] = [];
                
                historyResponse.forEach((record: any, recordIndex: number) => {
                    if (record.fieldChanges && Array.isArray(record.fieldChanges)) {
                        
                        const changesWithOldValue = record.fieldChanges.filter((change: any) => {
                            if (change.oldValue && change.oldValue.trim() !== '') return true;
                            if ((change.field === 'image' || change.field === 'avatar') && change.newValue) return true;
                            return false;
                        });
                        
                        const formattedChanges = changesWithOldValue.map((change: any, index: number) => ({
                            id: change._id || `${recordIndex}-${index}`,
                            field: formatFieldName(change.field),
                            oldValue: change.oldValue || (change.field === 'image' || change.field === 'avatar' ? 'https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg' : ''),
                            newValue: change.newValue || '',
                            changedAt: record.createdAt,
                            changedBy: record.performedBy || 'User'
                        }));
                        allFormattedHistory.push(...formattedChanges);
                    }
                });
                
                setHistoryData(allFormattedHistory);
                return;
            }

            if (!historyResponse.fieldChanges || !Array.isArray(historyResponse.fieldChanges)) {
                setHistoryData([]);
                return;
            }

            
            const changesWithOldValue = historyResponse.fieldChanges.filter((change: any) => {
                if (change.oldValue && change.oldValue.trim() !== '') return true;
                if ((change.field === 'image' || change.field === 'avatar') && change.newValue) return true;
                return false;
            });
            
            const formattedHistory = changesWithOldValue.map((change: any, index: number) => ({
                id: change._id || index,
                field: formatFieldName(change.field),
                oldValue: change.oldValue || (change.field === 'image' || change.field === 'avatar' ? 'https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg' : ''),
                newValue: change.newValue || '',
                changedAt: historyResponse.createdAt,
                changedBy: historyResponse.performedBy || 'User'
            }));

            setHistoryData(formattedHistory);
        } catch (error: any) {
            
            if (error.response?.status === 404) {
                setHistoryData([]);
            } else {
                showNotification('Unable to load history data. Please try again.', 'error');
            }
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        loadHistoryData();
    }, []);

    const totalPages = Math.ceil(historyData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentHistoryData = historyData.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-base lg:text-lg font-bold">
                {"Change History".split(' ').map((word, index) => (
                    <span key={index} className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-violet-400">
                        {word}
                        {index < "Change History".split(' ').length - 1 && '\u00A0'}
                    </span>
                ))}
            </h3>
            
            {historyLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="loader" style={{
                        borderColor: isDarkMode ? '#ffffff' : '#000000'
                    }}></div>
                    <span className={`ml-3 text-xs lg:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading history...</span>
                </div>
            ) : historyData.length > 0 ? (
                <div className={`${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'} rounded-lg shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
                    <div className={`${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-800' : 'bg-gradient-to-r from-blue-100 to-purple-100'} px-3 lg:px-6 py-3 lg:py-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <div className="grid grid-cols-12 gap-2 lg:gap-4 text-xs lg:text-sm font-medium">
                            <div className="col-span-4">
                                {"Field".split(' ').map((word, index) => (
                                    <span key={index} className={`text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
                                        {word}
                                        {index < "Field".split(' ').length - 1 && '\u00A0'}
                                    </span>
                                ))}
                            </div>
                            <div className="col-span-3">
                                {"Old Value".split(' ').map((word, index) => (
                                    <span key={index} className={`text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
                                        {word}
                                        {index < "Old Value".split(' ').length - 1 && '\u00A0'}
                                    </span>
                                ))}
                            </div>
                            <div className="col-span-3">
                                {"New Value".split(' ').map((word, index) => (
                                    <span key={index} className={`text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
                                        {word}
                                        {index < "New Value".split(' ').length - 1 && '\u00A0'}
                                    </span>
                                ))}
                            </div>
                            <div className="col-span-2">
                                {"Changed Date".split(' ').map((word, index) => (
                                    <span key={index} className={`text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-blue-300 to-purple-300' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
                                        {word}
                                        {index < "Changed Date".split(' ').length - 1 && '\u00A0'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                        {currentHistoryData.map((item, index) => (
                            <div key={item.id} className={`px-3 lg:px-6 py-3 lg:py-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-100'} transition-colors ${index % 2 === 0 ? (isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50') : (isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-800' : 'bg-gradient-to-r from-blue-100 to-purple-100')}`}>
                                <div className="grid grid-cols-12 gap-2 lg:gap-4 items-center text-xs lg:text-sm">
                                    <div className="col-span-4">
                                        <span className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} whitespace-nowrap`}>{item.field}</span>
                                    </div>

                                    <div className="col-span-3">
                                        {item.field === 'Profile Image' || item.field === 'Avatar' ? (
                                            <img 
                                                src={item.oldValue} 
                                                alt="Old avatar" 
                                                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover border border-gray-300"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="text-red-700 bg-red-50 px-1 lg:px-2 py-1 rounded text-xs border border-red-200 max-w-full" title={item.field === 'Date of Birth' ? formatDateOfBirthForDisplay(item.oldValue) : (item.oldValue || 'Empty')}>
                                                <div className="break-words overflow-hidden">
                                                    {item.field === 'Date of Birth' ? formatDateOfBirthForDisplay(item.oldValue) : (item.oldValue || 'Empty')}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-3">
                                        {item.field === 'Profile Image' || item.field === 'Avatar' ? (
                                            <img 
                                                src={item.newValue} 
                                                alt="New avatar" 
                                                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover border border-gray-300"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="text-green-700 bg-green-50 px-1 lg:px-2 py-1 rounded text-xs border border-green-200 max-w-full" title={item.field === 'Date of Birth' ? formatDateOfBirthForDisplay(item.newValue) : (item.newValue || 'Empty')}>
                                                <div className="break-words overflow-hidden">
                                                    {item.field === 'Date of Birth' ? formatDateOfBirthForDisplay(item.newValue) : (item.newValue || 'Empty')}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-2">
                                        <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                                            <div className="font-medium">
                                                {formatApiDateTime(item.changedAt).formattedDate}
                                            </div>
                                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {formatApiDateTime(item.changedAt).formattedTime}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {totalPages > 1 && (
                        <div className={`flex items-center justify-between px-3 lg:px-6 py-3 lg:py-4 border-t ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                            <div className={`flex items-center text-xs lg:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <span>
                                    Showing {startIndex + 1} to {Math.min(endIndex, historyData.length)} of {historyData.length} results
                                </span>
                            </div>
                            
                            <div className="flex items-center space-x-1 lg:space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-2 lg:px-3 py-1 lg:py-2 text-xs lg:text-sm font-medium rounded-md ${
                                        currentPage === 1
                                            ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                            : 'text-white bg-gradient-to-r from-sky-300 to-violet-400 hover:from-sky-400 hover:to-violet-500 transition-all'
                                    }`}
                                >
                                    Previous
                                </button>
                                
                                <div className="flex space-x-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-2 lg:px-3 py-1 lg:py-2 text-xs lg:text-sm font-medium rounded-md ${
                                                currentPage === page
                                                    ? 'bg-gradient-to-r from-sky-300 to-violet-400 text-white'
                                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-2 lg:px-3 py-1 lg:py-2 text-xs lg:text-sm font-medium rounded-md ${
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
            ) : (
                <div className="text-center py-12">
                    <h3 className={`text-base lg:text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>No Changes Yet</h3>
                    <p className={`text-xs lg:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your profile change history will appear here once you make updates.</p>
                </div>
            )}
        </div>
    );
}

export default HistoryProfile;
