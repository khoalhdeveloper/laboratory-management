import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function TestOrdersList() {
  // const [searchTerm, setSearchTerm] = useState('') // TODO: Implement search functionality
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, orderId: string | null, orderName: string}>({
    isOpen: false,
    orderId: null,
    orderName: ''
  })
  const currentPage = 2
  const navigate = useNavigate()

  const handleNewTestOrder = () => {
    navigate('/nurse/test-orders/new')
  }

  const handleEditTestOrder = (orderId: string) => {
    navigate(`/nurse/test-orders/edit/${orderId}`)
  }

  const handleDeleteClick = (orderId: string, patientName: string) => {
    setDeleteModal({
      isOpen: true,
      orderId: orderId,
      orderName: patientName
    })
  }

  const handleDeleteConfirm = () => {
    // TODO: Implement actual delete logic here
    console.log('Deleting order:', deleteModal.orderId)
    setDeleteModal({ isOpen: false, orderId: null, orderName: '' })
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, orderId: null, orderName: '' })
  }

  const handleViewDetails = (orderId: string) => {
    navigate(`/nurse/test-orders/detail/${orderId}`)
  }



  // Uses shared Nurse layout (sidebar + header provided by parent page)

  // Sample test orders data
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
    },
    {
      id: 'TO-000126',
      patientName: 'Michael Brown',
      testType: 'Culture Test',
      status: 'Pending',
      orderDate: '2023-02-14',
      priority: 'High',
      doctor: 'Dr. Smith',
      details: {
        patientInfo: {
          patientId: 'P-001237',
          age: 55,
          gender: 'Male',
          phone: '+1 (555) 456-7890',
          email: 'michael.brown@email.com',
          address: '321 Elm St, Houston, TX 77001',
          medicalHistory: 'Pneumonia (2022)',
          allergies: 'Sulfa drugs'
        },
        testDetails: {
          testCode: 'CUL-001',
          testName: 'Sputum Culture',
          specimenType: 'Sputum',
          collectionDate: '2023-02-14',
          collectionTime: '07:45 AM',
          fastingRequired: false,
          specialInstructions: 'Early morning specimen preferred',
          expectedResults: 'Within 48-72 hours'
        },
        orderInfo: {
          orderedBy: 'Dr. Smith',
          department: 'Pulmonology',
          diagnosis: 'Suspected respiratory infection',
          notes: 'Patient has persistent cough for 2 weeks'
        }
      }
    },
    {
      id: 'TO-000127',
      patientName: 'Emily Davis',
      testType: 'Blood Test',
      status: 'In Progress',
      orderDate: '2023-02-15',
      priority: 'Medium',
      doctor: 'Dr. Wilson',
      details: {
        patientInfo: {
          patientId: 'P-001238',
          age: 31,
          gender: 'Female',
          phone: '+1 (555) 567-8901',
          email: 'emily.davis@email.com',
          address: '654 Maple Ave, Phoenix, AZ 85001',
          medicalHistory: 'Anemia (2021)',
          allergies: 'Iodine contrast'
        },
        testDetails: {
          testCode: 'FER-001',
          testName: 'Ferritin Level',
          specimenType: 'Serum',
          collectionDate: '2023-02-15',
          collectionTime: '09:15 AM',
          fastingRequired: false,
          specialInstructions: 'No special preparation needed',
          expectedResults: 'Within 4 hours'
        },
        orderInfo: {
          orderedBy: 'Dr. Wilson',
          department: 'Hematology',
          diagnosis: 'Iron deficiency follow-up',
          notes: 'Monitoring iron levels after treatment'
        }
      }
    },
    {
      id: 'TO-000128',
      patientName: 'David Miller',
      testType: 'Urine Test',
      status: 'Completed',
      orderDate: '2023-02-16',
      priority: 'Low',
      doctor: 'Dr. Brown',
      details: {
        patientInfo: {
          patientId: 'P-001239',
          age: 47,
          gender: 'Male',
          phone: '+1 (555) 678-9012',
          email: 'david.miller@email.com',
          address: '987 Cedar St, Philadelphia, PA 19101',
          medicalHistory: 'Prostate issues (2020)',
          allergies: 'None known'
        },
        testDetails: {
          testCode: 'PSA-001',
          testName: 'PSA Test',
          specimenType: 'Serum',
          collectionDate: '2023-02-16',
          collectionTime: '08:30 AM',
          fastingRequired: false,
          specialInstructions: 'Avoid vigorous exercise 24 hours before',
          expectedResults: 'Within 6 hours'
        },
        orderInfo: {
          orderedBy: 'Dr. Brown',
          department: 'Urology',
          diagnosis: 'Prostate screening',
          notes: 'Annual PSA monitoring'
        }
      }
    },
    {
      id: 'TO-000129',
      patientName: 'Lisa Garcia',
      testType: 'Blood Test',
      status: 'Pending',
      orderDate: '2023-02-17',
      priority: 'High',
      doctor: 'Dr. Davis',
      details: {
        patientInfo: {
          patientId: 'P-001240',
          age: 39,
          gender: 'Female',
          phone: '+1 (555) 789-0123',
          email: 'lisa.garcia@email.com',
          address: '147 Birch St, San Antonio, TX 78201',
          medicalHistory: 'Gestational diabetes (2020)',
          allergies: 'Aspirin'
        },
        testDetails: {
          testCode: 'GTT-001',
          testName: 'Glucose Tolerance Test',
          specimenType: 'Plasma',
          collectionDate: '2023-02-17',
          collectionTime: '08:00 AM',
          fastingRequired: true,
          specialInstructions: '8-hour fasting, glucose drink provided',
          expectedResults: 'Within 24 hours'
        },
        orderInfo: {
          orderedBy: 'Dr. Davis',
          department: 'Endocrinology',
          diagnosis: 'Diabetes screening',
          notes: 'Family history of diabetes'
        }
      }
    },
    {
      id: 'TO-000130',
      patientName: 'Robert Johnson',
      testType: 'Culture Test',
      status: 'In Progress',
      orderDate: '2023-02-18',
      priority: 'Medium',
      doctor: 'Dr. Smith',
      details: {
        patientInfo: {
          patientId: 'P-001241',
          age: 63,
          gender: 'Male',
          phone: '+1 (555) 890-1234',
          email: 'robert.johnson@email.com',
          address: '258 Spruce St, San Diego, CA 92101',
          medicalHistory: 'UTI (2022), Heart disease',
          allergies: 'Cephalexin'
        },
        testDetails: {
          testCode: 'URC-001',
          testName: 'Urine Culture',
          specimenType: 'Midstream Urine',
          collectionDate: '2023-02-18',
          collectionTime: '07:00 AM',
          fastingRequired: false,
          specialInstructions: 'Clean catch midstream urine',
          expectedResults: 'Within 24-48 hours'
        },
        orderInfo: {
          orderedBy: 'Dr. Smith',
          department: 'Internal Medicine',
          diagnosis: 'Recurrent UTI symptoms',
          notes: 'Patient reports burning sensation during urination'
        }
      }
    }
  ]

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

  return (
    <>
      {/* Header (inside shared layout) */}
     

        {/* Main Content */}
        <main className="flex-1 p-6 py-3">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Page Header with Add Button */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-800">Test Orders</h3>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <button 
                  onClick={handleNewTestOrder}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Test Order</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-blue-800">Test Order Code</th>
                    <th className="text-left py-4 px-6 font-semibold text-blue-800">Patient Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-blue-800">Test Type</th>
                    <th className="text-left py-4 px-6 font-semibold text-blue-800">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-blue-800">Priority</th>
                    <th className="text-left py-4 px-6 font-semibold text-blue-800">Order Date</th>
                    <th className="text-left py-4 px-6 font-semibold text-blue-800">Doctor</th>
                    <th className="text-left py-4 px-6 font-semibold text-blue-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testOrders.map((order, index) => (
                    <tr key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-4 px-6 text-gray-800 font-medium">{order.id}</td>
                      <td className="py-4 px-6 text-gray-800">{order.patientName}</td>
                      <td className="py-4 px-6 text-gray-600">{order.testType}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                          {order.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{order.orderDate}</td>
                      <td className="py-4 px-6 text-gray-600">{order.doctor}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {/* View Button */}
                          <button 
                            onClick={() => handleViewDetails(order.id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" 
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          {/* Edit Button */}
                          <button 
                            onClick={() => handleEditTestOrder(order.id)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors" 
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          {/* Delete Button */}
                          <button 
                            onClick={() => handleDeleteClick(order.id, order.patientName)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" 
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentPage <= 1}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">1</button>
                  <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded">2</button>
                  <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">3</button>
                  <span className="px-2 text-gray-400">...</span>
                  <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">10</button>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentPage >= 34}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <div className="text-sm text-gray-600">
                  Page {currentPage} of 34
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Delete Confirmation Popup */}
        {deleteModal.isOpen && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-80">
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Delete Test Order?
                  </h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 ml-11">
                  Delete test order for <span className="font-medium">{deleteModal.orderName}</span>?
                </p>
                
                <div className="flex justify-end space-x-2 ml-11">
                  <button
                    onClick={handleDeleteCancel}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  )
}

export default TestOrdersList
