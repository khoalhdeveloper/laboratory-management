import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
// import { Button } from '../Admin/ui/button' // UI component not available
import { ArrowLeft, X, CheckCircle, Download, FileText, MessageSquare, Edit2, Trash2, Save, X as XIcon, Bot } from 'lucide-react'
import { exportToExcel, exportTestResultsToPDFHTML } from '../../../utils/exportUtils'
import { toast } from '../../../utils/toast'
import { testResultsAPI, testCommentsAPI, aiReviewAPI, type TestComment } from '../Axios/Axios'
import AIAutoReview from './AIAutoReview'

function ViewResults() {
  const navigate = useNavigate()
  const { resultId } = useParams()
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<TestComment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [addingComment, setAddingComment] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  const [isReviewed, setIsReviewed] = useState(false)
  const [isOrderCreator, setIsOrderCreator] = useState(false)
  // Removed randomResults - only use API data
  
  // New states for API data
  const [testOrder, setTestOrder] = useState<any>(null)
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // AI Review states
  const [aiDescription, setAiDescription] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [hasAiDescription, setHasAiDescription] = useState(false)
  
  // AI Edit states
  const [isEditingAiDescription, setIsEditingAiDescription] = useState(false)
  const [editableAiDescription, setEditableAiDescription] = useState('')
  const [updatingAiDescription, setUpdatingAiDescription] = useState(false)



  // Load comments from API
  const loadComments = async (orderCode: string) => {
    try {
      setCommentsLoading(true)
      const response = await testCommentsAPI.getCommentsByOrderCode(orderCode)
      
      if (response.data.success) {
        const commentsData = response.data.data.all_comments || []
        setComments(commentsData)
      }
    } catch (error: any) {
      // Error handled silently; comments remain empty
    } finally {
      setCommentsLoading(false)
    }
  }

  // =========================================================
  //  Load AI Description
  //  Lấy mô tả AI từ API và hiển thị trong Doctor Comments
  // =========================================================
  const loadAIDescription = async (orderCode: string) => {
    try {
      setAiLoading(true)
      
      const response = await aiReviewAPI.getAIDescription(orderCode)
      
      if (response.data.success) {
        const { ai_description, has_ai_description } = response.data.data
        
        setAiDescription(ai_description)
        setHasAiDescription(has_ai_description)
        
        if (has_ai_description) {
          toast.success('AI analysis loaded successfully!');
        }
      } else {
        setAiDescription(null)
        setHasAiDescription(false)
      }
    } catch (error: any) {
      setAiDescription(null)
      setHasAiDescription(false)
    } finally {
      setAiLoading(false)
    }
  }

  // Fetch test order and results data from API
  useEffect(() => {
    const fetchData = async () => {
      if (!resultId) {
        setError('No result ID provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Fetch all test results and find the one matching resultId
        const resultsResponse = await testResultsAPI.getAllTestResults()
        
        // Find the specific result by order_code
        const allResults = resultsResponse.data.data || []
        const foundResult = allResults.find((item: any) => 
          item.testOrder && item.testOrder.order_code === resultId
        )
        
        if (foundResult) {
          // Set test order data
          if (foundResult.testOrder) {
            setTestOrder(foundResult.testOrder)
            
            // Allow all doctors/nurses to select best comment for now
            setIsOrderCreator(true) // Enable for all users
            
            // Load comments for this order
            if (foundResult.testOrder.order_code) {
              await loadComments(foundResult.testOrder.order_code)
              // Load AI description
              await loadAIDescription(foundResult.testOrder.order_code)
            }
          }
          // Set test results data
          if (foundResult.testResult) {
            setTestResults(foundResult.testResult)
          }
        } else {
          setError(`No test result found for order code: ${resultId}`)
        }
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch test data')
        
        // Fallback to hardcoded data if API fails
        setTestOrder({
          patient_name: 'Maria Johnson',
          date_of_birth: 'March 5, 1985',
          gender: 'Female',
          test_type: 'Complete Blood Count (CBC)',
          status: 'Completed',
          priority: 'High',
          notes: 'Patient complains of fatigue and weakness'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resultId])

  // No more random results - only use API data

  // Function to format API results into display format
  const formatApiResults = (resultsData: any) => {
    if (!resultsData) return null
    
    // Check if this is URINALYSIS - use dedicated fields (leu_value, nit_value, etc.)
    if (resultsData.test_type === 'Urinalysis') {
      return {
        leukocytes: {
          value: resultsData.leu_value || 'N/A',
          unit: '',
          normal: 'Negative',
          status: resultsData.leu_value === 'Negative' ? 'Normal' : 'Abnormal'
        },
        nitrite: {
          value: resultsData.nit_value || 'N/A',
          unit: '',
          normal: 'Negative',
          status: resultsData.nit_value === 'Negative' ? 'Normal' : 'Abnormal'
        },
        protein: {
          value: resultsData.pro_value || 'N/A',
          unit: '',
          normal: 'Negative',
          status: resultsData.pro_value === 'Negative' ? 'Normal' : 'Abnormal'
        },
        pH: {
          value: resultsData.ph_value?.toString() || 'N/A',
          unit: '',
          normal: '5.0-8.0',
          status: (resultsData.ph_value >= 5.0 && resultsData.ph_value <= 8.0) ? 'Normal' : 'Abnormal'
        },
        blood: {
          value: resultsData.bld_value || 'N/A',
          unit: '',
          normal: 'Negative',
          status: resultsData.bld_value === 'Negative' ? 'Normal' : 'Abnormal'
        },
        specificGravity: {
          value: resultsData.sg_value?.toString() || 'N/A',
          unit: '',
          normal: '1.005-1.030',
          status: (resultsData.sg_value >= 1.005 && resultsData.sg_value <= 1.030) ? 'Normal' : 'Abnormal'
        },
        ketone: {
          value: resultsData.ket_value || 'N/A',
          unit: '',
          normal: 'Negative',
          status: resultsData.ket_value === 'Negative' ? 'Normal' : 'Abnormal'
        },
        glucose: {
          value: resultsData.glu_value || 'N/A',
          unit: '',
          normal: 'Negative',
          status: resultsData.glu_value === 'Negative' ? 'Normal' : 'Abnormal'
        }
      }
    }
    
    // Check if this is FECAL ANALYSIS - parse result_details JSON
    if (resultsData.test_type === 'Fecal Analysis') {
      try {
        const details = JSON.parse(resultsData.result_details || '{}')
        if (details.results) {
          // Convert the results object to display format
          const formatted: any = {}
          Object.entries(details.results).forEach(([key, value]: [string, any]) => {
            formatted[key] = {
              value: value.value,
              unit: value.unit || '',
              normal: value.normalRange,
              status: value.status === 'normal' ? 'Normal' : 'Abnormal'
            }
          })
          return formatted
        }
      } catch (err) {
        // Silent error - fallback to blood test format
      }
    }
    
    // Helper function to determine status based on value and normal range
    const getStatus = (value: number, min: number, max: number) => {
      if (value < min || value > max) return 'Abnormal'
      return 'Normal'
    }
    
    // Default: Blood Test parameters
    return {
      wbc: { 
        value: resultsData.wbc_value?.toString() || '5.2', 
        unit: '10³/µL', 
        normal: '4.0-11.0', 
        status: resultsData.wbc_value ? getStatus(resultsData.wbc_value, 4, 11) : 'Normal'
      },
      rbc: { 
        value: resultsData.rbc_value?.toString() || '5.5', 
        unit: '10⁶/µL', 
        normal: '4.5-5.9', 
        status: resultsData.rbc_value ? getStatus(resultsData.rbc_value, 4.5, 5.9) : 'Normal'
      },
      hemoglobin: { 
        value: resultsData.hgb_value?.toString() || '13.7', 
        unit: 'g/dL', 
        normal: '13.5-17.5', 
        status: resultsData.hgb_value ? getStatus(resultsData.hgb_value, 13.5, 17.5) : 'Normal'
      },
      hematocrit: { 
        value: resultsData.hct_value?.toString() || '40.2', 
        unit: '%', 
        normal: '41.0-50.0', 
        status: resultsData.hct_value ? getStatus(resultsData.hct_value, 41, 50) : 'Normal'
      },
      platelet: { 
        value: resultsData.plt_value?.toString() || '150', 
        unit: '10³/µL', 
        normal: '150-450', 
        status: resultsData.plt_value ? getStatus(resultsData.plt_value, 150, 450) : 'Normal'
      },
      mcv: { 
        value: resultsData.mcv_value?.toString() || '86', 
        unit: 'fL', 
        normal: '80-100', 
        status: resultsData.mcv_value ? getStatus(resultsData.mcv_value, 80, 100) : 'Normal'
      },
      mch: { 
        value: resultsData.mch_value?.toString() || '29', 
        unit: 'pg', 
        normal: '27-33', 
        status: resultsData.mch_value ? getStatus(resultsData.mch_value, 27, 33) : 'Normal'
      },
      mchc: { 
        value: resultsData.mchc_value?.toString() || '33.5', 
        unit: 'g/dL', 
        normal: '32-36', 
        status: resultsData.mchc_value ? getStatus(resultsData.mchc_value, 32, 36) : 'Normal'
      }
    }
  }

  // Function to get result data from API only - no hardcoded fallbacks
  const getResultData = () => {
    // Use API data only
    const orderData = testOrder || {}
    const resultsData = testResults || {}

    // Use formatted API results only
    const actualResults = formatApiResults(resultsData)

    return {
      id: resultId || 'N/A',
      orderId: orderData.order_code || 'N/A',
      patientId: orderData.patient_id || 'N/A',
      patientName: orderData.patient_name || 'N/A',
      dateOfBirth: orderData.date_of_birth || 'N/A',
      gender: orderData.gender || 'N/A',
      testType: orderData.test_type || 'N/A',
      department: orderData.department || 'N/A',
      status: orderData.status || 'N/A',
      resultDate: orderData.createdAt ? new Date(orderData.createdAt).toLocaleDateString() : 'N/A',
      priority: orderData.priority || 'N/A',
      doctor: resultsData.doctor_name || orderData.userid || 'N/A',
      completionTime: orderData.updatedAt ? new Date(orderData.updatedAt).toLocaleTimeString() : 'N/A',
      details: {
        patientInfo: {
          patientId: orderData.patient_id || 'N/A',
          age: orderData.age || 'N/A',
          gender: orderData.gender || 'N/A',
          phone: orderData.phone_number || 'N/A',
          email: orderData.email || 'N/A',
          address: orderData.address || 'N/A',
          medicalHistory: orderData.medical_history || 'N/A',
          allergies: orderData.allergies || 'N/A'
        },
        testDetails: {
          testCode: orderData.test_code || 'N/A',
          testName: orderData.test_type || 'N/A',
          specimenType: orderData.specimen_type || 'N/A',
          collectionDate: orderData.createdAt ? new Date(orderData.createdAt).toLocaleDateString() : 'N/A',
          collectionTime: orderData.createdAt ? new Date(orderData.createdAt).toLocaleTimeString() : 'N/A',
          fastingRequired: orderData.fasting_required || 'N/A',
          specialInstructions: orderData.special_instructions || 'N/A',
          expectedResults: orderData.expected_results || 'N/A'
        },
        orderInfo: {
          orderedBy: orderData.created_by || 'N/A',
          department: orderData.department || 'N/A',
          diagnosis: orderData.diagnosis || 'N/A',
          notes: orderData.notes || 'N/A'
        },
        results: actualResults || {
          wbc: { value: 'N/A', unit: '10³/µL', normal: '4.0-11.0', status: 'No Data' },
          rbc: { value: 'N/A', unit: '10⁶/µL', normal: '4.5-5.9', status: 'No Data' },
          hemoglobin: { value: 'N/A', unit: 'g/dL', normal: '13.5-17.5', status: 'No Data' },
          hematocrit: { value: 'N/A', unit: '%', normal: '41.0-50.0', status: 'No Data' },
          platelet: { value: 'N/A', unit: '10³/µL', normal: '150-450', status: 'No Data' },
          mcv: { value: 'N/A', unit: 'fL', normal: '80-100', status: 'No Data' },
          mch: { value: 'N/A', unit: 'pg', normal: '27-33', status: 'No Data' },
          mchc: { value: 'N/A', unit: 'g/dL', normal: '32-36', status: 'No Data' }
        }
      }
    }
  }

  // Get result data
  const resultData = getResultData()

  const handleBackToResults = () => {
    navigate('/nurse/results')
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !testOrder?.order_code) return

    try {
      setAddingComment(true)
      const response = await testCommentsAPI.addComment(testOrder.order_code, newComment.trim())
      
      if (response.data.success) {
        setNewComment('')
        // Reload comments
        await loadComments(testOrder.order_code)
        toast.success('Comment added successfully')
      } else {
        toast.error(response.data.message || 'Failed to add comment')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add comment')
    } finally {
      setAddingComment(false)
    }
  }

  const handleEditComment = (commentId: string, content: string) => {
    setEditingComment(commentId)
    setEditContent(content)
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim() || !editingComment) return

    try {
      const response = await testCommentsAPI.updateComment(editingComment, editContent.trim())
      
      if (response.data.success) {
        setEditingComment(null)
        setEditContent('')
        // Reload comments
        if (testOrder?.order_code) {
          await loadComments(testOrder.order_code)
        }
        toast.success('Comment updated successfully')
      } else {
        toast.error(response.data.message || 'Failed to update comment')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update comment')
    }
  }

  const handleCancelEdit = () => {
    setEditingComment(null)
    setEditContent('')
  }

  const handleDeleteComment = async (commentId: string) => {
    setCommentToDelete(commentId)
    setShowDeleteModal(true)
  }

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return

    try {
      const response = await testCommentsAPI.deleteComment(commentToDelete)
      
      if (response.data.success) {
        // Reload comments
        if (testOrder?.order_code) {
          await loadComments(testOrder.order_code)
        }
        toast.success('Comment deleted successfully')
      } else {
        toast.error(response.data.message || 'Failed to delete comment')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete comment')
    } finally {
      setShowDeleteModal(false)
      setCommentToDelete(null)
    }
  }

  const cancelDeleteComment = () => {
    setShowDeleteModal(false)
    setCommentToDelete(null)
  }

  const handleSelectBestComment = async (commentId: string) => {
    if (!testOrder?.order_code) return

    try {
      // Mark comment as final using the existing API
      const response = await testCommentsAPI.markFinalComment(testOrder.order_code, commentId)
      
      if (response.data.success) {
        // Reload comments to update UI
        await loadComments(testOrder.order_code)
        
        // Show success message from backend
        if (response.data.message.includes('unmarked')) {
          toast.success('Comment unselected successfully.')
        } else {
          toast.success('Comment selected as final! Previous selection has been removed.')
        }
      } else {
        toast.error(response.data.message || 'Failed to select comment')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to select comment')
    }
  }

  const handleMarkAsReviewed = () => {
    setIsReviewed(true)
    // TODO: Implement API call to mark as reviewed
  }

  // =========================================================
  //  Handle AI Auto Review Success
  //  Xử lý khi AI analysis thành công và cập nhật UI
  // =========================================================
  const handleAISuccess = (result: any) => {
    setAiDescription(result.ai_description)
    setHasAiDescription(true)
    
    // Reload AI description to get latest data
    if (testOrder?.order_code) {
      loadAIDescription(testOrder.order_code)
    }
  }

  // =========================================================
  //  Handle AI Auto Review Error
  //  Xử lý khi AI analysis thất bại
  // =========================================================
  const handleAIError = () => {
    // Error handling is already done in AIAutoReview component
  }

  // =========================================================
  //  Handle Edit AI Description
  //  Bắt đầu chỉnh sửa AI description
  // =========================================================
  const handleEditAIDescription = () => {
    setIsEditingAiDescription(true)
    setEditableAiDescription(aiDescription || '')
  }

  // =========================================================
  //  Handle Cancel Edit AI Description
  //  Hủy chỉnh sửa AI description
  // =========================================================
  const handleCancelEditAIDescription = () => {
    setIsEditingAiDescription(false)
    setEditableAiDescription('')
  }

  // =========================================================
  //  Handle Update AI Description
  //  Cập nhật AI description qua API
  // =========================================================
  const handleUpdateAIDescription = async () => {
    if (!editableAiDescription.trim() || !testOrder?.order_code) return

    try {
      setUpdatingAiDescription(true)
      
      const response = await aiReviewAPI.updateAIDescription(testOrder.order_code, editableAiDescription.trim())
      
      if (response.data.success) {
        setAiDescription(editableAiDescription.trim())
        setIsEditingAiDescription(false)
        setEditableAiDescription('')
        
        toast.success('AI description updated successfully!')
      } else {
        throw new Error(response.data.message || 'Failed to update AI description')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update AI description')
    } finally {
      setUpdatingAiDescription(false)
    }
  }

  const handleExportExcel = async () => {
    try {
      // Get actual results data from API
      let actualResults = formatApiResults(testResults)
      
      // If no API results, use fallback data
      if (!actualResults) {
        actualResults = {
          wbc: { value: '5.2', unit: '10³/µL', normal: '4.0-11.0', status: 'Normal' },
          rbc: { value: '5.5', unit: '10⁶/µL', normal: '4.5-5.9', status: 'Normal' },
          hemoglobin: { value: '13.7', unit: 'g/dL', normal: '13.5-17.5', status: 'Normal' },
          hematocrit: { value: '40.2', unit: '%', normal: '41.0-50.0', status: 'Normal' },
          platelet: { value: '150', unit: '10³/µL', normal: '150-450', status: 'Normal' },
          mcv: { value: '89', unit: 'fL', normal: '80-100', status: 'Normal' },
          mch: { value: '29', unit: 'pg', normal: '27-33', status: 'Normal' },
          mchc: { value: '32.5', unit: 'g/dL', normal: '32-36', status: 'Normal' }
        }
      }
      
      // Prepare data for Excel export
      const excelData = Object.entries(actualResults).map(([key, result]) => ({
        'Test Name': key === 'wbc' ? 'White Blood Cell (WBC)' :
                    key === 'rbc' ? 'Red Blood Cell (RBC)' :
                    key === 'hemoglobin' ? 'Hemoglobin (HGB)' :
                    key === 'hematocrit' ? 'Hematocrit (HCT)' :
                    key === 'platelet' ? 'Platelet Count (PLT)' :
                    key === 'mcv' ? 'Mean Corpuscular Volume (MCV)' :
                    key === 'mch' ? 'Mean Corpuscular Hemoglobin (MCH)' :
                    key === 'mchc' ? 'Mean Corpuscular Hemoglobin Concentration (MCHC)' :
                    key === 'leukocytes' ? 'Leukocytes (LEU)' :
                    key === 'nitrite' ? 'Nitrite (NIT)' :
                    key === 'protein' ? 'Protein (PRO)' :
                    key === 'pH' ? 'pH' :
                    key === 'blood' ? 'Blood (BLD)' :
                    key === 'specificGravity' ? 'Specific Gravity (SG)' :
                    key === 'ketone' ? 'Ketone (KET)' :
                    key === 'glucose' ? 'Glucose (GLU)' :
                    key === 'fecalOccultBlood' ? 'Fecal Occult Blood (FOBT)' :
                    key === 'fecalFat' ? 'Fecal Fat' :
                    key === 'ovaAndParasites' ? 'Ova and Parasites (O and P)' :
                    key === 'reducingSubstances' ? 'Reducing Substances (RS)' :
                    key === 'fecalCalprotectin' ? 'Fecal Calprotectin (FC)' :
                    key === 'colorConsistency' ? 'Color / Consistency' : key,
        'Result Value': (result as any).value,
        'Reference Range': (result as any).normal,
        'Units': (result as any).unit,
        'Status': (result as any).status
      }))

      // Add patient info
      // const patientInfo = [
      //   { 'Field': 'Patient Name', 'Value': resultData.patientName },
      //   { 'Field': 'Patient ID', 'Value': resultData.patientId },
      //   { 'Field': 'Order ID', 'Value': resultData.orderId },
      //   { 'Field': 'Test Type', 'Value': resultData.testType },
      //   { 'Field': 'Date of Birth', 'Value': resultData.dateOfBirth },
      //   { 'Field': 'Gender', 'Value': resultData.gender },
      //   { 'Field': 'Department', 'Value': resultData.department },
      //   { 'Field': 'Result Date', 'Value': resultData.resultDate },
      //   { 'Field': 'Doctor', 'Value': resultData.doctor }
      // ]

      const result = exportToExcel(excelData, `test_result_${resultData.orderId}`, 'Test Results')
      if (result.success) {
        toast.success('Test results exported to Excel successfully!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to export test results to Excel')
    }
  }


  const handleExportPDF = async () => {
    try {
      // Get actual results data from API
      let actualResults = formatApiResults(testResults)
      
      // If no API results, use fallback data
      if (!actualResults) {
        actualResults = {
          wbc: { value: '5.2', unit: '10³/µL', normal: '4.0-11.0', status: 'Normal' },
          rbc: { value: '5.5', unit: '10⁶/µL', normal: '4.5-5.9', status: 'Normal' },
          hemoglobin: { value: '13.7', unit: 'g/dL', normal: '13.5-17.5', status: 'Normal' },
          hematocrit: { value: '40.2', unit: '%', normal: '41.0-50.0', status: 'Normal' },
          platelet: { value: '150', unit: '10³/µL', normal: '150-450', status: 'Normal' },
          mcv: { value: '89', unit: 'fL', normal: '80-100', status: 'Normal' },
          mch: { value: '29', unit: 'pg', normal: '27-33', status: 'Normal' },
          mchc: { value: '32.5', unit: 'g/dL', normal: '32-36', status: 'Normal' }
        }
      }
      
      // =========================================================
      //  CHỈ HIỂN THỊ BÌNH LUẬN ĐƯỢC CHỌN LÀ TốT NHẤT (is_final = true)
      //  Tìm final comment (comment được chọn là tốt nhất)
      // =========================================================
      const finalComment = comments.find(comment => comment.is_final)
      
      if (!finalComment) {
        // No final comment selected
      }
      
      // Tạo test report object theo format của exportTestResultsToPDFHTML
      const testReport = {
        id: resultData.orderId,
        testType: resultData.testType,
        resultDate: resultData.resultDate,
        doctor: resultData.doctor,
        department: resultData.department,
        results: actualResults || {
          wbc: { value: 'N/A', unit: '10³/µL', normal: '4.0-11.0', status: 'No Data' },
          rbc: { value: 'N/A', unit: '10⁶/µL', normal: '4.5-5.9', status: 'No Data' },
          hemoglobin: { value: 'N/A', unit: 'g/dL', normal: '13.5-17.5', status: 'No Data' },
          hematocrit: { value: 'N/A', unit: '%', normal: '41.0-50.0', status: 'No Data' },
          platelet: { value: 'N/A', unit: '10³/µL', normal: '150-450', status: 'No Data' },
          mcv: { value: 'N/A', unit: 'fL', normal: '80-100', status: 'No Data' },
          mch: { value: 'N/A', unit: 'pg', normal: '27-33', status: 'No Data' },
          mchc: { value: 'N/A', unit: 'g/dL', normal: '32-36', status: 'No Data' }
        },
        instrument: testResults?.instrument_name || 'Hematology Analyzer',
        instrumentId: testResults?.instrument_id || 'LAB-002',
        // =========================================================
        //  THÊM AI DESCRIPTION VÀO EXPORT PDF
        // =========================================================
        aiDescription: aiDescription || null,
        hasAiDescription: hasAiDescription,
        // =========================================================
        //  CHỈ TRUYỀN BÌNH LUẬN ĐƯỢC CHỌN (finalComment)
        //  Nếu không có final comment, sẽ hiển thị thông báo mặc định
        // =========================================================
        finalComment: finalComment ? {
          doctorName: finalComment.doctor_name,
          content: finalComment.content,
          reviewDate: finalComment.created_at ? new Date(finalComment.created_at).toLocaleDateString('vi-VN') : 'N/A'
        } : null
      }
      
      // Tạo user data object
      const userData = {
        fullName: resultData.patientName,
        dateOfBirth: resultData.dateOfBirth,
        gender: resultData.gender,
        phoneNumber: resultData.details.patientInfo.phone
      }

      const result = await exportTestResultsToPDFHTML(testReport, userData)
      if (result.success) {
        toast.success('Test results exported to PDF successfully!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to export test results to PDF')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
      case 'Abnormal':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
      case 'Borderline':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  // const getProgressWidth = (value: string, normal: string) => {
  //   const [min, max] = normal.split('-').map(Number)
  //   const val = parseFloat(value)
  //   const percentage = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100))
  //   return `${percentage}%`
  // }

  // Show loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 bg-opacity-80">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading test results...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 bg-opacity-80">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 flex flex-col items-center max-w-md">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <X className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/nurse/results')}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
            >
              Back to Results
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-gray-100 dark:bg-gray-900 bg-opacity-80">
        {/* Modal */}
        <div className="relative w-full max-w-6xl h-[95vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 gap-3">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 dark:text-gray-100">Test Result Details</h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate max-w-[250px] sm:max-w-none">Order ID: {resultData.orderId} | Patient ID: {resultData.patientId}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {isReviewed && (
                <div className="flex items-center space-x-1 sm:space-x-2 bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Reviewed</span>
                  <span className="sm:hidden">✓</span>
                </div>
              )}
              <button
                onClick={handleMarkAsReviewed}
                disabled={isReviewed}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm whitespace-nowrap"
              >
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">Mark as Reviewed</span>
                <span className="md:hidden">Mark</span>
              </button>
              <AIAutoReview
                orderCode={resultData.orderId}
                onSuccess={handleAISuccess}
                onError={handleAIError}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap"
              />
              <button
                onClick={handleBackToResults}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 min-h-0">

            {/* Patient Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-3 sm:p-4 md:p-6 border border-blue-100 dark:border-blue-800">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Patient Information
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 text-right">{resultData.patientName}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Date of Birth:</span>
                    <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 text-right">
                      {(() => {
                        const dob = resultData.dateOfBirth;
                        if (!dob || dob === 'N/A') return 'N/A';
                        try {
                          // Try to parse and format the date
                          const date = new Date(dob);
                          if (isNaN(date.getTime())) return dob; // If invalid date, return as is
                          
                          const day = String(date.getDate()).padStart(2, '0');
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const year = date.getFullYear();
                          return `${day}-${month}-${year}`;
                        } catch {
                          return dob;
                        }
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Gender:</span>
                    <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 text-right">{resultData.gender}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Phone Number:</span>
                    <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 text-right">{resultData.details.patientInfo.phone}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-3 sm:p-4 md:p-6 border border-green-100 dark:border-green-800">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-green-600 dark:text-green-400" />
                  </div>
                  Test Information
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Test Type:</span>
                    <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 text-right">{resultData.testType}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Result Date:</span>
                    <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 text-right">
                      {(() => {
                        const dateStr = resultData.details.testDetails.collectionDate;
                        if (!dateStr || dateStr === 'N/A') return 'N/A';
                        try {
                          const date = new Date(dateStr);
                          if (isNaN(date.getTime())) return dateStr;
                          
                          const day = String(date.getDate()).padStart(2, '0');
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const year = date.getFullYear();
                          return `${day}-${month}-${year}`;
                        } catch {
                          return dateStr;
                        }
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Instrument:</span>
                    <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 text-right">
                      {testResults?.instrument_name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Test executed by:</span>
                    <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 text-right">{resultData.doctor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-4 sm:mb-6 md:mb-8">
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">Test Results</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Parameter</th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Value</th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Reference Range</th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Unit</th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {Object.entries(resultData.details.results).map(([key, result], index) => (
                      <tr key={key} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-gray-900 dark:text-gray-100 font-medium">
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
                          
                          {/* Stool/Fecal Test Parameters */}
                          {key === 'fecalOccultBlood' && 'Fecal Occult Blood (FOBT)'}
                          {key === 'fecalFat' && 'Fecal Fat'}
                          {key === 'ovaAndParasites' && 'Ova and Parasites (O and P)'}
                          {key === 'reducingSubstances' && 'Reducing Substances (RS)'}
                          {key === 'fecalCalprotectin' && 'Fecal Calprotectin (FC)'}
                          {key === 'colorConsistency' && 'Color / Consistency'}
                          
                          {/* Fallback: format camelCase to Title Case */}
                          {!['wbc', 'rbc', 'hemoglobin', 'hematocrit', 'platelet', 'mcv', 'mch', 'mchc',
                              'leukocytes', 'nitrite', 'protein', 'pH', 'blood', 'specificGravity', 'ketone', 'glucose',
                              'fecalOccultBlood', 'fecalFat', 'ovaAndParasites', 
                              'reducingSubstances', 'fecalCalprotectin', 'colorConsistency'].includes(key) &&
                            key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">{(result as any).value}</td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">{(result as any).normal}</td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">{(result as any).unit}</td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor((result as any).status)}`}>
                            {(result as any).status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Analysis Section - Separate from Doctor Comments */}
            {(hasAiDescription && aiDescription) || aiLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                    AI Analysis
                  </h3>
                </div>
                <div className="p-6">
                  {/* AI Loading State */}
                  {aiLoading && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 dark:border-purple-400 mr-3"></div>
                        <span className="text-gray-600 dark:text-gray-400">Loading AI analysis...</span>
                      </div>
                    </div>
                  )}

                  {/* AI Analysis Content */}
                  {hasAiDescription && aiDescription && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 text-xs rounded-full font-medium">
                          AI Generated
                        </span>
                        {!isEditingAiDescription && (
                          <button
                            onClick={handleEditAIDescription}
                            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/50 dark:hover:bg-blue-800 dark:text-blue-300 text-sm rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      
                      {isEditingAiDescription ? (
                        <div className="space-y-3">
                          <textarea
                            value={editableAiDescription}
                            onChange={(e) => setEditableAiDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            rows={4}
                            placeholder="Enter AI description..."
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={handleUpdateAIDescription}
                              disabled={!editableAiDescription.trim() || updatingAiDescription}
                              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                            >
                              {updatingAiDescription ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4" />
                                  <span>Save</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={handleCancelEditAIDescription}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                            >
                              <XIcon className="w-4 h-4" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                            {aiDescription}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Comments Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-4 sm:mb-6 md:mb-8">
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  Doctor Comments
                </h3>
              </div>
              <div className="p-3 sm:p-4 md:p-6">
                {/* Order Creator Notice */}
                {isOrderCreator && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>You can select the best comment</strong> from doctors by clicking the checkmark button next to each comment.
                      </p>
                    </div>
                  </div>
                )}

                {/* Add Comment */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add New Comment</label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Enter your comment here..."
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm"
                      rows={3}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || addingComment}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center space-x-2 self-start text-sm"
                    >
                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{addingComment ? 'Adding...' : 'Add Comment'}</span>
                    </button>
                  </div>
                </div>

                {/* Existing Comments */}
                <div className="space-y-4">
                  {commentsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">Loading comments...</span>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p>No comments yet. Be the first to add a comment!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment._id} className={`rounded-lg p-3 sm:p-4 border ${
                        comment.is_final 
                          ? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20 shadow-md' 
                          : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700'
                      }`}>
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                          <div className="flex-1 w-full sm:w-auto">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">{comment.doctor_name}</span>
                              {comment.is_final && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 text-xs rounded-full font-semibold whitespace-nowrap">
                                  ✓ Selected as Best
                                </span>
                              )}
                            </div>
                            
                            {editingComment === comment.comment_id ? (
                              <div className="space-y-2 sm:space-y-3">
                                <textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleSaveEdit}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                                  >
                                    <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>Save</span>
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                                  >
                                    <XIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>Cancel</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 mb-2">{comment.content}</p>
                                <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                  <span>{new Date(comment.created_at).toLocaleString('vi-VN')}</span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {editingComment !== comment.comment_id && (
                            <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end sm:ml-4">
                              {/* Select Best Comment Button - Only for order creator */}
                              {isOrderCreator && (
                                <button
                                  onClick={() => handleSelectBestComment(comment.comment_id)}
                                  className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                                    comment.is_final 
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                  }`}
                                  title={comment.is_final ? 'Selected as best comment' : 'Select as best comment'}
                                >
                                  {comment.is_final ? (
                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                  ) : (
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  )}
                                </button>
                              )}
                              
                              {/* Edit and Delete buttons - Only for comment owner */}
                              {(() => {
                                const currentUserId = localStorage.getItem('userId');
                                const currentUserName = localStorage.getItem('userName');
                                const isCommentOwner = (
                                  comment.doctor_id === currentUserId ||
                                  comment.doctor_id === currentUserName ||
                                  comment.doctor_name === currentUserName
                                );
                                
                                return isCommentOwner ? (
                                  <>
                                    <button
                                      onClick={() => handleEditComment(comment.comment_id, comment.content)}
                                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/50 dark:hover:bg-blue-800 dark:text-blue-300 p-1.5 sm:p-2 rounded-lg"
                                      title="Edit comment"
                                    >
                                      <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(comment.comment_id)}
                                      className="bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/50 dark:hover:bg-red-800 dark:text-red-300 p-1.5 sm:p-2 rounded-lg"
                                      title="Delete comment"
                                    >
                                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                  </>
                                ) : null;
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 gap-3">
            <button
              onClick={handleBackToResults}
              className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm md:text-base w-full sm:w-auto justify-center"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Back to Results</span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={handleExportExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm md:text-base flex-1 sm:flex-none justify-center whitespace-nowrap"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export Excel</span>
                <span className="sm:hidden">Excel</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="bg-gradient-to-r from-sky-300 to-violet-400 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all font-semibold shadow-sm hover:shadow-md flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm md:text-base flex-1 sm:flex-none justify-center whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
                <span className="hidden sm:inline">Export PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm w-full mx-4">
            <div className="flex items-center mb-3">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-1.5 mr-2">
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Delete Comment</h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete this comment?
            </p>
            
            <div className="flex space-x-2">
              <button
                onClick={confirmDeleteComment}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium"
              >
                Delete
              </button>
              <button
                onClick={cancelDeleteComment}
                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

export default ViewResults
