import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function TestOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<any>(null)

  // Sample test orders data (same as in TestOrdersList)
  const testOrders = [
    {
      id: 'TO-000123',
      patientName: 'Maria Johnson',
      testType: 'Blood Test',
      status: 'Pending',
      orderDate: '2023-01-15',
      priority: 'High',
      doctor: 'Dr. Smith',
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
        }
      }
    },
    {
      id: 'TO-000124',
      patientName: 'John Smith',
      testType: 'Urine Test',
      status: 'In Progress',
      orderDate: '2023-02-10',
      priority: 'Medium',
      doctor: 'Dr. Brown',
      details: {
        patientInfo: {
          patientId: 'P-001235',
          age: 42,
          gender: 'Male',
          phone: '+1 (555) 234-5678',
          email: 'john.smith@email.com',
          address: '456 Oak Ave, Los Angeles, CA 90210',
          medicalHistory: 'Kidney stones (2019)',
          allergies: 'None known'
        },
        testDetails: {
          testCode: 'UA-001',
          testName: 'Urinalysis',
          specimenType: 'Urine',
          collectionDate: '2023-02-10',
          collectionTime: '08:15 AM',
          fastingRequired: false,
          specialInstructions: 'First morning urine preferred',
          expectedResults: 'Within 4 hours'
        },
        orderInfo: {
          orderedBy: 'Dr. Brown',
          department: 'Urology',
          diagnosis: 'Follow-up for kidney function',
          notes: 'Patient reports frequent urination'
        }
      }
    },
    {
      id: 'TO-000125',
      patientName: 'Sarah Wilson',
      testType: 'Blood Test',
      status: 'Completed',
      orderDate: '2023-02-12',
      priority: 'Low',
      doctor: 'Dr. Davis',
      details: {
        patientInfo: {
          patientId: 'P-001236',
          age: 28,
          gender: 'Female',
          phone: '+1 (555) 345-6789',
          email: 'sarah.wilson@email.com',
          address: '789 Pine St, Chicago, IL 60601',
          medicalHistory: 'None',
          allergies: 'Latex'
        },
        testDetails: {
          testCode: 'LIP-001',
          testName: 'Lipid Panel',
          specimenType: 'Serum',
          collectionDate: '2023-02-12',
          collectionTime: '10:00 AM',
          fastingRequired: true,
          specialInstructions: '12-hour fasting required',
          expectedResults: 'Within 6 hours'
        },
        orderInfo: {
          orderedBy: 'Dr. Davis',
          department: 'Cardiology',
          diagnosis: 'Routine screening',
          notes: 'Annual health checkup'
        }
      }
    }
  ]

  useEffect(() => {
    if (orderId) {
      const foundOrder = testOrders.find(o => o.id === orderId)
      setOrder(foundOrder || null)
    }
  }, [orderId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Order Not Found</h2>
          <p className="text-gray-600 mb-6">The requested test order could not be found.</p>
          <button
            onClick={() => navigate('/nurse/test-orders')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Test Orders
          </button>
        </div>
      </div>
    )
  }

  const { details } = order

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/nurse/test-orders')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Test Order Details</h1>
              <p className="text-xs text-gray-500">Order ID: {order.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
              {order.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6 max-w-6xl mx-auto">
        {/* Patient Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Patient Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Patient ID</label>
              <p className="text-sm text-gray-900 font-mono">{details.patientInfo.patientId}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
              <p className="text-sm text-gray-900 font-semibold">{order.patientName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Age</label>
              <p className="text-sm text-gray-900">{details.patientInfo.age} years</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</label>
              <p className="text-sm text-gray-900">{details.patientInfo.gender}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
              <p className="text-sm text-gray-900">{details.patientInfo.phone}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
              <p className="text-sm text-gray-900">{details.patientInfo.email}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</label>
              <p className="text-sm text-gray-900">{details.patientInfo.address}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Medical History</label>
              <p className="text-sm text-gray-900">{details.patientInfo.medicalHistory}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Allergies</label>
              <p className="text-sm text-gray-900">{details.patientInfo.allergies}</p>
            </div>
          </div>
        </div>

        {/* Test Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Test Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Test Code</label>
              <p className="text-sm text-gray-900 font-mono bg-blue-50 px-2 py-1 rounded">{details.testDetails.testCode}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Test Name</label>
              <p className="text-sm text-gray-900 font-semibold">{details.testDetails.testName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Specimen Type</label>
              <p className="text-sm text-gray-900">{details.testDetails.specimenType}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Collection Date</label>
              <p className="text-sm text-gray-900">{details.testDetails.collectionDate}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Collection Time</label>
              <p className="text-sm text-gray-900">{details.testDetails.collectionTime}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fasting Required</label>
              <p className="text-sm">
                {details.testDetails.fastingRequired ? (
                  <span className="text-red-600 font-semibold bg-red-50 px-2 py-1 rounded-full text-xs">Yes</span>
                ) : (
                  <span className="text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full text-xs">No</span>
                )}
              </p>
            </div>
            <div className="md:col-span-2 lg:col-span-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Special Instructions</label>
              <p className="text-sm text-gray-900 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                {details.testDetails.specialInstructions}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expected Results</label>
              <p className="text-sm text-gray-900">{details.testDetails.expectedResults}</p>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Order Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ordered By</label>
              <p className="text-sm text-gray-900 font-semibold">{details.orderInfo.orderedBy}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Department</label>
              <p className="text-sm text-gray-900">{details.orderInfo.department}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Order Date</label>
              <p className="text-sm text-gray-900">{order.orderDate}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Diagnosis</label>
              <p className="text-sm text-gray-900">{details.orderInfo.diagnosis}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</label>
              <p className="text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg p-2">
                {details.orderInfo.notes}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={() => navigate('/nurse/test-orders')}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Back to List
          </button>
          <button
            onClick={() => navigate(`/nurse/test-orders/edit/${order.id}`)}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
          >
            Edit Order
          </button>
        </div>
      </div>
    </div>
  )
}

export default TestOrderDetail
