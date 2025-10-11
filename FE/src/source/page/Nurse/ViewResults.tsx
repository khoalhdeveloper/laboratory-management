import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../Admin/ui/button'
import { ArrowLeft, X, CheckCircle, Download, FileText, MessageSquare, Edit2, Trash2, Save, X as XIcon } from 'lucide-react'
import { exportToExcel, exportToPDF } from '../../../utils/exportUtils'
import { toast } from '../../../utils/toast'

function ViewResults() {
  const navigate = useNavigate()
  const { resultId } = useParams()
  const [showDetails, setShowDetails] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState([
    {
      id: 1,
      text: "Results reviewed and verified. All parameters within normal range.",
      author: "Dr. Smith",
      date: "2023-01-15 14:30",
      isEditable: true
    },
    {
      id: 2,
      text: "Consider retesting due to slightly elevated WBC count.",
      author: "Dr. Johnson", 
      date: "2023-01-15 15:45",
      isEditable: false
    }
  ])
  const [isReviewed, setIsReviewed] = useState(false)
  const [editingComment, setEditingComment] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [randomResults, setRandomResults] = useState<any>(null)

  // Generate random results when component mounts
  useEffect(() => {
    const generateRandomResults = () => ({
      wbc: { 
        value: (Math.random() * 7 + 4).toFixed(1), 
        unit: '10³/µL', 
        normal: '4.0-11.0', 
        status: Math.random() > 0.7 ? 'Abnormal' : 'Normal' 
      },
      rbc: { 
        value: (Math.random() * 1.4 + 4.5).toFixed(1), 
        unit: '10⁶/µL', 
        normal: '4.5-5.9', 
        status: Math.random() > 0.8 ? 'Abnormal' : 'Normal' 
      },
      hemoglobin: { 
        value: (Math.random() * 4 + 13.5).toFixed(1), 
        unit: 'g/dL', 
        normal: '13.5-17.5', 
        status: Math.random() > 0.75 ? 'Abnormal' : 'Normal' 
      },
      hematocrit: { 
        value: (Math.random() * 9 + 41).toFixed(1), 
        unit: '%', 
        normal: '41.0-50.0', 
        status: Math.random() > 0.8 ? 'Abnormal' : 'Normal' 
      },
      platelet: { 
        value: Math.floor(Math.random() * 200 + 150).toString(), 
        unit: '10³/µL', 
        normal: '150-450', 
        status: Math.random() > 0.85 ? 'Abnormal' : 'Normal' 
      },
      mcv: { 
        value: Math.floor(Math.random() * 20 + 80).toString(), 
        unit: 'fL', 
        normal: '80-100', 
        status: Math.random() > 0.9 ? 'Abnormal' : 'Normal' 
      },
      mch: { 
        value: (Math.random() * 6 + 27).toFixed(0), 
        unit: 'pg', 
        normal: '27-33', 
        status: Math.random() > 0.9 ? 'Abnormal' : 'Normal' 
      },
      mchc: { 
        value: (Math.random() * 4 + 32).toFixed(1), 
        unit: 'g/dL', 
        normal: '32-36', 
        status: Math.random() > 0.9 ? 'Abnormal' : 'Normal' 
      }
    })
    
    setRandomResults(generateRandomResults())
  }, [])

  // Sample result data (in real app, this would be fetched based on resultId)
  const resultData = {
    id: 'TR-000123',
    orderId: 'ORD-003456',
    patientId: 'PT-923401',
    patientName: 'Maria Johnson',
    dateOfBirth: 'March 5, 1985',
    gender: 'Female',
    testType: 'Complete Blood Count (CBC)',
    department: 'Hematology',
    status: 'Completed',
    resultDate: '2023-01-15',
    priority: 'High',
    doctor: 'Dr. Smith',
    completionTime: '14:30',
    details: {
      patientInfo: {
        patientId: 'P-001234',
        age: 35,
        gender: 'Female',
        phone: '+1 (555) 123-4567',
        email: 'maria.johnson@email.com',
        address: '123 Main St, New York, NY 10001',
        medicalHistory: 'Hypertension, Diabetes Type 2',
        allergies: 'Penicillin, Shellfish'
      },
      testDetails: {
        testCode: 'CBC-001',
        testName: 'Complete Blood Count',
        specimenType: 'Whole Blood',
        collectionDate: '2023-01-15',
        collectionTime: '09:30 AM',
        fastingRequired: true,
        specialInstructions: 'Patient should fast for 8 hours before test',
        expectedResults: 'Within 24 hours'
      },
      orderInfo: {
        orderedBy: 'Dr. Smith',
        department: 'Internal Medicine',
        diagnosis: 'Routine health check',
        notes: 'Patient complains of fatigue and weakness'
      },
      results: randomResults || {
        wbc: { value: '5.2', unit: '10³/µL', normal: '4.0-11.0', status: 'Normal' },
        rbc: { value: '5.5', unit: '10⁶/µL', normal: '4.5-5.9', status: 'Normal' },
        hemoglobin: { value: '13.7', unit: 'g/dL', normal: '13.5-17.5', status: 'Normal' },
        hematocrit: { value: '40.2', unit: '%', normal: '41.0-50.0', status: 'Normal' },
        platelet: { value: '150', unit: '10³/µL', normal: '150-450', status: 'Normal' },
        mcv: { value: '86', unit: 'fL', normal: '80-100', status: 'Normal' },
        mch: { value: '29', unit: 'pg', normal: '27-33', status: 'Normal' },
        mchc: { value: '33.5', unit: 'g/dL', normal: '32-36', status: 'Normal' }
      }
    }
  }

  const handleBackToResults = () => {
    navigate('/nurse/results')
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
        author: "Dr. Current User",
        date: new Date().toLocaleString('en-US'),
        isEditable: true
      }
      setComments([comment, ...comments])
      setNewComment('')
    }
  }

  const handleEditComment = (commentId: number) => {
    const comment = comments.find(c => c.id === commentId)
    if (comment) {
      setEditingComment(commentId)
      setEditText(comment.text)
    }
  }

  const handleSaveEdit = (commentId: number) => {
    if (editText.trim()) {
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, text: editText, date: new Date().toLocaleString('en-US') }
          : comment
      ))
      setEditingComment(null)
      setEditText('')
    }
  }

  const handleCancelEdit = () => {
    setEditingComment(null)
    setEditText('')
  }

  const handleDeleteComment = (commentId: number) => {
    setComments(comments.filter(comment => comment.id !== commentId))
  }

  const handleMarkAsReviewed = () => {
    setIsReviewed(true)
    // TODO: Implement API call to mark as reviewed
  }

  const handleAIAutoReview = () => {
    // TODO: Implement AI Auto Review functionality
    console.log('AI Auto Review triggered')
  }

  const handleExportExcel = async () => {
    try {
      // Prepare data for Excel export
      const excelData = Object.entries(resultData.details.results).map(([key, result]) => ({
        'Test Name': key === 'wbc' ? 'White Blood Cell (WBC)' :
                    key === 'rbc' ? 'Red Blood Cell (RBC)' :
                    key === 'hemoglobin' ? 'Hemoglobin (HGB)' :
                    key === 'hematocrit' ? 'Hematocrit (HCT)' :
                    key === 'platelet' ? 'Platelet Count (PLT)' :
                    key === 'mcv' ? 'Mean Corpuscular Volume (MCV)' :
                    key === 'mch' ? 'Mean Corpuscular Hemoglobin (MCH)' :
                    key === 'mchc' ? 'Mean Corpuscular Hemoglobin Concentration (MCHC)' : key,
        'Result Value': result.value,
        'Reference Range': result.normal,
        'Units': result.unit,
        'Status': result.status
      }))

      // Add patient info
      const patientInfo = [
        { 'Field': 'Patient Name', 'Value': resultData.patientName },
        { 'Field': 'Patient ID', 'Value': resultData.patientId },
        { 'Field': 'Order ID', 'Value': resultData.orderId },
        { 'Field': 'Test Type', 'Value': resultData.testType },
        { 'Field': 'Date of Birth', 'Value': resultData.dateOfBirth },
        { 'Field': 'Gender', 'Value': resultData.gender },
        { 'Field': 'Department', 'Value': resultData.department },
        { 'Field': 'Result Date', 'Value': resultData.resultDate },
        { 'Field': 'Doctor', 'Value': resultData.doctor }
      ]

      const result = exportToExcel(excelData, `test_result_${resultData.orderId}`, 'Test Results')
      if (result.success) {
        toast.success('Test results exported to Excel successfully!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to export test results to Excel')
      console.error('Export error:', error)
    }
  }

  const handleExportPDF = async () => {
    try {
      // Prepare data for PDF export
      const pdfData = Object.entries(resultData.details.results).map(([key, result]) => ({
        testName: key === 'wbc' ? 'White Blood Cell (WBC)' :
                 key === 'rbc' ? 'Red Blood Cell (RBC)' :
                 key === 'hemoglobin' ? 'Hemoglobin (HGB)' :
                 key === 'hematocrit' ? 'Hematocrit (HCT)' :
                 key === 'platelet' ? 'Platelet Count (PLT)' :
                 key === 'mcv' ? 'Mean Corpuscular Volume (MCV)' :
                 key === 'mch' ? 'Mean Corpuscular Hemoglobin (MCH)' :
                 key === 'mchc' ? 'Mean Corpuscular Hemoglobin Concentration (MCHC)' : key,
        resultValue: result.value,
        referenceRange: result.normal,
        units: result.unit,
        status: result.status
      }))

      const columns = [
        { header: 'Test Name', dataKey: 'testName' },
        { header: 'Result Value', dataKey: 'resultValue' },
        { header: 'Reference Range', dataKey: 'referenceRange' },
        { header: 'Units', dataKey: 'units' },
        { header: 'Status', dataKey: 'status' }
      ]

      const result = exportToPDF(
        pdfData, 
        columns, 
        `test_result_${resultData.orderId}`, 
        `Test Results - ${resultData.patientName} (${resultData.orderId})`
      )
      
      if (result.success) {
        toast.success('Test results exported to PDF successfully!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to export test results to PDF')
      console.error('Export error:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal':
        return 'bg-green-100 text-green-800'
      case 'Abnormal':
        return 'bg-red-100 text-red-800'
      case 'Borderline':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressWidth = (value: string, normal: string) => {
    const [min, max] = normal.split('-').map(Number)
    const val = parseFloat(value)
    const percentage = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100))
    return `${percentage}%`
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-100 bg-opacity-80">
        {/* Modal */}
        <div className="relative w-full max-w-6xl h-[95vh] bg-white rounded-xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Test Result Details</h2>
                  <p className="text-sm text-gray-600">Order ID: {resultData.orderId} | Patient ID: {resultData.patientId}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isReviewed && (
                <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Reviewed</span>
                </div>
              )}
              <Button
                onClick={handleMarkAsReviewed}
                disabled={isReviewed}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark as Reviewed</span>
              </Button>
              <Button
                onClick={handleAIAutoReview}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>AI Auto Review</span>
              </Button>
              <Button
                onClick={handleBackToResults}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {/* Patient Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  Patient Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{resultData.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date of Birth:</span>
                    <span className="font-medium text-gray-900">{resultData.dateOfBirth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium text-gray-900">{resultData.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Patient ID:</span>
                    <span className="font-medium text-gray-900">{resultData.patientId}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="w-4 h-4 text-green-600" />
                  </div>
                  Test Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Test Type:</span>
                    <span className="font-medium text-gray-900">{resultData.testType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium text-gray-900">{resultData.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date Collected:</span>
                    <span className="font-medium text-gray-900">{resultData.doctor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Parameter</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Value</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Reference Range</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(resultData.details.results).map(([key, result], index) => (
                      <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {key === 'wbc' && 'White Blood Cell (WBC)'}
                          {key === 'rbc' && 'Red Blood Cell (RBC)'}
                          {key === 'hemoglobin' && 'Hemoglobin (HGB)'}
                          {key === 'hematocrit' && 'Hematocrit (HCT)'}
                          {key === 'platelet' && 'Platelet Count (PLT)'}
                          {key === 'mcv' && 'Mean Corpuscular Volume (MCV)'}
                          {key === 'mch' && 'Mean Corpuscular Hemoglobin (MCH)'}
                          {key === 'mchc' && 'Mean Corpuscular Hemoglobin Concentration (MCHC)'}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{result.value}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{result.normal}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{result.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
                  Doctor Comments
                </h3>
              </div>
              <div className="p-6">
                {/* Add Comment */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add New Comment</label>
                  <div className="flex space-x-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Enter your comment here..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <Button
                      onClick={handleAddComment}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 self-start"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Add Comment</span>
                    </Button>
                  </div>
                </div>

                {/* Existing Comments */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {editingComment === comment.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={3}
                              />
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => handleSaveEdit(comment.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                                >
                                  <Save className="w-4 h-4" />
                                  <span>Save</span>
                                </Button>
                                <Button
                                  onClick={handleCancelEdit}
                                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                                >
                                  <XIcon className="w-4 h-4" />
                                  <span>Cancel</span>
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-gray-900 mb-2">{comment.text}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="font-medium">{comment.author}</span>
                                <span>{comment.date}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {editingComment !== comment.id && (
                          <div className="flex items-center space-x-2 ml-4">
                            {comment.isEditable && (
                              <Button
                                onClick={() => handleEditComment(comment.id)}
                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <Button
              onClick={handleBackToResults}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Results</span>
            </Button>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleExportExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Excel</span>
              </Button>
              <Button
                onClick={handleExportPDF}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Export PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ViewResults
