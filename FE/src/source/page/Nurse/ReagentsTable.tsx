import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function ReagentsTable() {
  const navigate = useNavigate()
  const { testType } = useParams<{ testType: string }>()
  const [reagents, setReagents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Complete reagents data for differential count - all reagents required
  const differentialCountReagents = [
    { 
      id: 'R001', 
      name: 'Diluent', 
      quantity: 500, 
      unit: 'ml', 
      expiryDate: '2024-12-15', 
      status: 'Available', 
      required: true,
      usage: '1-2 ml',
      description: 'Typically used in a 1:10 to 1:20 ratio with blood samples to maintain cell integrity. Used to dilute blood samples to ensure accurate counting of blood cells.'
    },
    { 
      id: 'R002', 
      name: 'Lysing', 
      quantity: 200, 
      unit: 'ml', 
      expiryDate: '2024-11-20', 
      status: 'Available', 
      required: true,
      usage: '50-200 µL',
      description: 'Often added in precise microliter amounts (e.g., 50–200 µL) to break down red blood cells for white blood cell analysis.'
    },
    { 
      id: 'R003', 
      name: 'Staining', 
      quantity: 150, 
      unit: 'ml', 
      expiryDate: '2024-11-10', 
      status: 'Available', 
      required: true,
      usage: '50-100 µL',
      description: 'Used to stain specific blood components, such as reticulocytes for differential analysis.'
    },
    { 
      id: 'R004', 
      name: 'Clotting', 
      quantity: 100, 
      unit: 'ml', 
      expiryDate: '2024-10-30', 
      status: 'Low Stock', 
      required: true,
      usage: '50-100 µL',
      description: 'Prevents the sample from clotting to allow smooth flow through the analyser.'
    },
    { 
      id: 'R005', 
      name: 'Cleaner', 
      quantity: 300, 
      unit: 'ml', 
      expiryDate: '2024-09-15', 
      status: 'Available', 
      required: true,
      usage: '1-2 ml',
      description: 'Clean the sample tubing, preventing contamination and clotting.'
    }
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setReagents(differentialCountReagents)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800'
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800'
      case 'Out of Stock':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTestTypeName = () => {
    return 'Differential Count'
  }

  const handleBack = () => {
    navigate('/nurse/test-orders/device-check')
  }

  const handleContinue = () => {
    // Check if all required reagents are available
    const requiredReagents = reagents.filter(r => r.required)
    const unavailableReagents = requiredReagents.filter(r => r.status === 'Out of Stock')
    
    if (unavailableReagents.length > 0) {
      alert('Cannot proceed: Some required reagents are out of stock.')
      return
    }
    
    // Navigate to blood test execution
    navigate('/nurse/test-orders/blood-test-execution')
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'test-orders', label: 'Test Orders' },
    { id: 'auto-review', label: 'Auto Review' },
    { id: 'comments', label: 'Comments', submenu: [
      { id: 'add-comment', label: 'Add Comment' },
      { id: 'edit-comment', label: 'Edit Comment' },
      { id: 'delete-comment', label: 'Delete Comment' }
    ]},
    { id: 'reagents', label: 'Reagents', submenu: [
      { id: 'crud-reagents', label: 'CRUD Reagents' }
    ]},
    { id: 'blood-testing', label: 'Blood Testing', submenu: [
      { id: 'execute-blood-testing', label: 'Execute Blood Testing' }
    ]},
    { id: 'instrument', label: 'Instrument', submenu: [
      { id: 'change-instrument-mode', label: 'Change Instrument Mode' }
    ]},
    { id: 'results', label: 'Results', submenu: [
      { id: 'view-result', label: 'View Result' },
      { id: 'export-pdf', label: 'Export PDF' },
      { id: 'export-excel', label: 'Export Excel' }
    ]}
  ]

  const handleMenuClick = (menuId: string) => {
    if (menuId === 'dashboard') {
      navigate('/nurse')
    } else if (menuId === 'test-orders') {
      navigate('/nurse/test-orders')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reagents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
     
      
       

      
      

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-800">Required Reagents</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              

              

              
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Reagents for {getTestTypeName()}
              </h3>
              <p className="text-gray-600">All reagents are required for comprehensive differential count analysis</p>
            </div>

            {/* Reagents Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-blue-800">Reagent ID</th>
                      <th className="text-left py-4 px-6 font-semibold text-blue-800">Name</th>
                      <th className="text-left py-4 px-6 font-semibold text-blue-800">Usage per Run</th>
                      <th className="text-left py-4 px-6 font-semibold text-blue-800">Quantity</th>
                      <th className="text-left py-4 px-6 font-semibold text-blue-800">Unit</th>
                      <th className="text-left py-4 px-6 font-semibold text-blue-800">Expiry Date</th>
                      <th className="text-left py-4 px-6 font-semibold text-blue-800">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reagents.map((reagent, index) => (
                      <tr key={reagent.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="py-4 px-6 text-gray-800 font-medium">{reagent.id}</td>
                        <td className="py-4 px-6 text-gray-800">{reagent.name}</td>
                        <td className="py-4 px-6 text-gray-800 font-medium">{reagent.usage}</td>
                        <td className="py-4 px-6 text-gray-600">{reagent.quantity}</td>
                        <td className="py-4 px-6 text-gray-600">{reagent.unit}</td>
                        <td className="py-4 px-6 text-gray-600">{reagent.expiryDate}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reagent.status)}`}>
                            {reagent.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-sm text-gray-600">Total Reagents</div>
                <div className="text-2xl font-bold text-gray-800">{reagents.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-sm text-gray-600">All Required</div>
                <div className="text-2xl font-bold text-red-600">{reagents.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-sm text-gray-600">Available</div>
                <div className="text-2xl font-bold text-green-600">{reagents.filter(r => r.status === 'Available').length}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Test Selection
              </button>
              
              <button
                onClick={handleContinue}
                className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Proceed with Test
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ReagentsTable
