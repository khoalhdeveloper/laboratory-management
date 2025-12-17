import React, { useState } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { aiReviewAPI } from '../Axios/Axios';

// =========================================================
//  AI Auto Review Component
//  Component to call AI review API with token and order_code
// =========================================================
interface AIAutoReviewProps {
    orderCode: string;
    onSuccess?: (result: any) => void;
    onError?: (error: any) => void;
    disabled?: boolean;
    className?: string;
}

const AIAutoReview: React.FC<AIAutoReviewProps> = ({
    orderCode,
    onSuccess,
    onError,
    disabled = false,
    className = ""
}) => {
    const [isLoading, setIsLoading] = useState(false);

    // =========================================================
    //  AI Review API Call Function
    //  Send request to backend to analyze test results
    // =========================================================
    const handleAIAnalysis = async () => {
        if (!orderCode) {
            toast.error('Order code not found');
            return;
        }

        setIsLoading(true);
        
        try {
            // Call AI review API with order_code
            const response = await aiReviewAPI.analyzeWithAI(orderCode);
            
            if (response.data.success) {
                // Show success notification
                toast.success('AI analysis completed!');

                // Call success callback if provided
                if (onSuccess) {
                    onSuccess(response.data.data);
                }
            } else {
                throw new Error(response.data.message || 'Unknown error');
            }
            
        } catch (error: any) {
            let errorMessage = 'Error occurred during AI analysis';
            
            if (error.response?.status === 500) {
                errorMessage = 'Server error: AI analysis service is not available. Please check server configuration.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            // Show error notification
            toast.error(errorMessage);

            // Call error callback if provided
            if (onError) {
                onError(error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleAIAnalysis}
            disabled={disabled || isLoading || !orderCode}
            className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                transition-all duration-200 ease-in-out
                ${disabled || isLoading || !orderCode
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
                }
                ${className}
            `}
            title={!orderCode ? 'No order code' : 'AI Auto Review'}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                </>
            ) : (
                <>
                    <MessageSquare className="w-4 h-4" />
                    <span>AI Auto Review</span>
                </>
            )}
        </button>
    );
};

// =========================================================
//  AI Auto Review Example Component
//  Demo component to show how to use AIAutoReview
// =========================================================
export const AIAutoReviewExample: React.FC = () => {
    const [orderCode, setOrderCode] = useState('ORD-1');
    const [aiResult, setAiResult] = useState<any>(null);

    // =========================================================
    //  Handle AI analysis success
    //  Save AI result and show notification
    // =========================================================
    const handleAISuccess = (result: any) => {
        setAiResult(result);
        
        // Show AI result in toast
        toast.info(`AI Result: ${result.ai_description}`);
    };

    // =========================================================
    //  Handle AI analysis error
    //  Log error and show error notification
    // =========================================================
    const handleAIError = () => {
        setAiResult(null);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                AI Auto Review - Demo
            </h2>
            
            {/* Input Order Code */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Code:
                </label>
                <input
                    type="text"
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter order code (e.g. ORD-1)"
                />
            </div>

            {/* AI Auto Review Button */}
            <div className="mb-6">
                <AIAutoReview
                    orderCode={orderCode}
                    onSuccess={handleAISuccess}
                    onError={handleAIError}
                    className="shadow-md hover:shadow-lg"
                />
            </div>

            {/* AI Result Display */}
            {aiResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                        AI Analysis Result:
                    </h3>
                    <div className="space-y-2">
                        <p><strong>Order Code:</strong> {aiResult.order_code}</p>
                        <p><strong>AI Model:</strong> {aiResult.model}</p>
                        <div className="bg-white p-3 rounded border">
                            <p className="text-gray-700">
                                <strong>AI Description:</strong> {aiResult.ai_description}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Usage Instructions */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    Usage Instructions:
                </h3>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                    <li>Enter a valid order code (e.g. ORD-1)</li>
                    <li>Click "AI Auto Review" button to start analysis</li>
                    <li>System will call API with token authentication</li>
                    <li>AI results will be displayed after completion</li>
                    <li>Notifications will show status</li>
                </ul>
            </div>
        </div>
    );
};

export default AIAutoReview;
