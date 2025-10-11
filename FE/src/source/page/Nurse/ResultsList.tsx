import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ResultsList() {
  const navigate = useNavigate()
  const currentPage = 1
  const [priorityFlags, setPriorityFlags] = useState<{[key: string]: boolean}>({})
  const [filterStatus, setFilterStatus] = useState('')
  const [searchName, setSearchName] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  const handleViewResults = (resultId: string) => {
    navigate(`/nurse/results/view/${resultId}`)
  }

  const handleTogglePriority = (resultId: string) => {
    setPriorityFlags(prev => ({
      ...prev,
      [resultId]: !prev[resultId]
    }))
  }

  const handleAIAutoReview = () => {
    // TODO: Implement AI Auto Review functionality
    console.log('AI Auto Review triggered')
  }

  const handleExportExcel = () => {
    // TODO: Implement Excel export functionality
    console.log('Export to Excel')
  }

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    console.log('Export to PDF')
  }

  // Sample test results data (only completed tests)
  const testResults = [
    {
      id: 'TR-000123',
      patientName: 'Maria Johnson',
      testType: 'Blood Test',
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
        results: {
          wbc: { value: '6.7', unit: 'x10³/µL', normal: '4.0-10.0', status: 'Normal' },
          rbc: { value: '4.8', unit: 'x10⁶/µL', normal: '4.2-5.4', status: 'Normal' },
          hemoglobin: { value: '13.8', unit: 'g/dL', normal: '12-16', status: 'Normal' },
          hematocrit: { value: '41.2', unit: '%', normal: '37-47', status: 'Normal' },
          platelet: { value: '285', unit: 'x10³/µL', normal: '150-350', status: 'Normal' },
          mcv: { value: '86', unit: 'fL', normal: '80-100', status: 'Normal' },
          mch: { value: '29', unit: 'pg', normal: '27-33', status: 'Normal' },
          mchc: { value: '33.5', unit: 'g/dL', normal: '32-36', status: 'Normal' }
        }
      }
    },
    {
      id: 'TR-000125',
      patientName: 'Sarah Wilson',
      testType: 'Blood Test',
      status: 'Completed',
      resultDate: '2023-02-12',
      priority: 'Low',
      doctor: 'Dr. Davis',
      completionTime: '16:45',
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
        },
        results: {
          totalCholesterol: { value: '185', unit: 'mg/dL', normal: '<200', status: 'Normal' },
          ldlCholesterol: { value: '110', unit: 'mg/dL', normal: '<100', status: 'Borderline' },
          hdlCholesterol: { value: '55', unit: 'mg/dL', normal: '>50', status: 'Normal' },
          triglycerides: { value: '120', unit: 'mg/dL', normal: '<150', status: 'Normal' }
        }
      }
    },
    {
      id: 'TR-000128',
      patientName: 'David Miller',
      testType: 'Urine Test',
      status: 'Completed',
      resultDate: '2023-02-16',
      priority: 'Low',
      doctor: 'Dr. Brown',
      completionTime: '11:20',
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
        },
        results: {
          psa: { value: '2.1', unit: 'ng/mL', normal: '<4.0', status: 'Normal' },
          freePsa: { value: '0.8', unit: 'ng/mL', normal: '>0.25', status: 'Normal' },
          freePsaRatio: { value: '38', unit: '%', normal: '>25', status: 'Normal' }
        }
      }
    },
    {
      id: 'TR-000131',
      patientName: 'Emily Davis',
      testType: 'Blood Test',
      status: 'Completed',
      resultDate: '2023-02-15',
      priority: 'Medium',
      doctor: 'Dr. Wilson',
      completionTime: '13:15',
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
        },
        results: {
          ferritin: { value: '45', unit: 'ng/mL', normal: '15-150', status: 'Normal' },
          iron: { value: '85', unit: 'µg/dL', normal: '60-170', status: 'Normal' },
          tibc: { value: '320', unit: 'µg/dL', normal: '240-450', status: 'Normal' },
          transferrinSaturation: { value: '27', unit: '%', normal: '20-50', status: 'Normal' }
        }
      }
    },
    {
      id: 'TR-000132',
      patientName: 'Michael Brown',
      testType: 'Culture Test',
      status: 'Completed',
      resultDate: '2023-02-17',
      priority: 'High',
      doctor: 'Dr. Smith',
      completionTime: '10:30',
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
        },
        results: {
          cultureResult: { value: 'Positive', unit: '', normal: 'Negative', status: 'Abnormal' },
          organism: { value: 'Streptococcus pneumoniae', unit: '', normal: 'None', status: 'Abnormal' },
          sensitivity: { value: 'Sensitive to Penicillin', unit: '', normal: 'N/A', status: 'Normal' }
        }
      }
    },
    {
      id: 'TR-000133',
      patientName: 'Lisa Garcia',
      testType: 'Blood Test',
      status: 'Completed',
      resultDate: '2023-02-18',
      priority: 'High',
      doctor: 'Dr. Davis',
      completionTime: '15:45',
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
        },
        results: {
          fastingGlucose: { value: '95', unit: 'mg/dL', normal: '<100', status: 'Normal' },
          oneHourGlucose: { value: '180', unit: 'mg/dL', normal: '<180', status: 'Normal' },
          twoHourGlucose: { value: '155', unit: 'mg/dL', normal: '<140', status: 'Abnormal' },
          hba1c: { value: '5.8', unit: '%', normal: '<5.7', status: 'Borderline' }
        }
      }
    },
    {
      id: 'TR-000134',
      patientName: 'Robert Johnson',
      testType: 'Culture Test',
      status: 'Completed',
      resultDate: '2023-02-19',
      priority: 'Medium',
      doctor: 'Dr. Smith',
      completionTime: '12:00',
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
        },
        results: {
          cultureResult: { value: 'Positive', unit: '', normal: 'Negative', status: 'Abnormal' },
          organism: { value: 'Escherichia coli', unit: '', normal: 'None', status: 'Abnormal' },
          colonyCount: { value: '>100,000', unit: 'CFU/mL', normal: '<10,000', status: 'Abnormal' },
          sensitivity: { value: 'Sensitive to Ciprofloxacin', unit: '', normal: 'N/A', status: 'Normal' }
        }
      }
    },
    {
      id: 'TR-000135',
      patientName: 'Jennifer Lee',
      testType: 'Blood Test',
      status: 'Completed',
      resultDate: '2023-02-20',
      priority: 'Medium',
      doctor: 'Dr. Wilson',
      completionTime: '14:20',
      details: {
        patientInfo: {
          patientId: 'P-001242',
          age: 29,
          gender: 'Female',
          phone: '+1 (555) 901-2345',
          email: 'jennifer.lee@email.com',
          address: '369 Oak St, Seattle, WA 98101',
          medicalHistory: 'Thyroid disorder (2021)',
          allergies: 'None known'
        },
        testDetails: {
          testCode: 'THY-001',
          testName: 'Thyroid Function Test',
          specimenType: 'Serum',
          collectionDate: '2023-02-20',
          collectionTime: '09:00 AM',
          fastingRequired: false,
          specialInstructions: 'No special preparation needed',
          expectedResults: 'Within 4 hours'
        },
        orderInfo: {
          orderedBy: 'Dr. Wilson',
          department: 'Endocrinology',
          diagnosis: 'Thyroid monitoring',
          notes: 'Regular follow-up for thyroid condition'
        },
        results: {
          tsh: { value: '2.1', unit: 'mIU/L', normal: '0.4-4.0', status: 'Normal' },
          t4: { value: '8.2', unit: 'µg/dL', normal: '4.5-12.0', status: 'Normal' },
          t3: { value: '120', unit: 'ng/dL', normal: '80-200', status: 'Normal' },
          freeT4: { value: '1.2', unit: 'ng/dL', normal: '0.8-1.8', status: 'Normal' }
        }
      }
    }
  ]

  // Calculate statistics
  const totalTests = testResults.length
  const abnormalFlags = testResults.filter(result => 
    result.details.results && Object.values(result.details.results).some((r: any) => r.status === 'Abnormal')
  ).length
  const reviewedTests = testResults.filter(result => result.status === 'Completed').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
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
      {/* Main Content */}
      <main className="flex-1 p-6 py-3">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Page Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-800">Test Results</h3>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <button 
                onClick={handleAIAutoReview}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>AI Auto Review</span>
              </button>
            </div>

            {/* Filtering Options */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Search by Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Name</label>
                <input
                  type="text"
                  placeholder="Enter patient name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
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
                {testResults.map((result, index) => (
                  <tr key={result.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-4 px-6 text-gray-800 font-medium">{result.id}</td>
                    <td className="py-4 px-6 text-gray-800">{result.patientName}</td>
                    <td className="py-4 px-6 text-gray-600">{result.testType}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(result.priority)}`}>
                        {result.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{result.resultDate}</td>
                    <td className="py-4 px-6 text-gray-600">{result.doctor}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {/* View Result Button */}
                        <button 
                          onClick={() => handleViewResults(result.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md" 
                          title="View Results"
                        >
                          View Result
                        </button>
                        
                        {/* Priority Flag Button */}
                        <button 
                          onClick={() => handleTogglePriority(result.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            priorityFlags[result.id] 
                              ? 'text-red-600 bg-red-100' 
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-100'
                          }`}
                          title="Toggle Priority Flag"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                          </svg>
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Statistics Cards */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{totalTests}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-red-600">{abnormalFlags}</div>
                <div className="text-sm text-gray-600">Abnormal Flags</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">{reviewedTests}</div>
                <div className="text-sm text-gray-600">Reviewed</div>
              </div>
            </div>
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
                
                <button className="px-3 py-1 text-sm bg-green-500 text-white rounded">1</button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">2</button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">3</button>
                <span className="px-2 text-gray-400">...</span>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">5</button>
                
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentPage >= 5}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="text-sm text-gray-600">
                Page {currentPage} of 5
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default ResultsList
