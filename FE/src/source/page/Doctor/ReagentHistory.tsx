import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  Calendar, 
  User, 
  Search, 
  Filter,
  Download,
  Eye,
  Clock,
  Building2,
  Beaker,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react';
import { exportReagentData } from '../../../utils/exportUtils';
import { toast } from '../../../utils/toast';
import { useGlobalTheme } from '../../../contexts/GlobalThemeContext';
import { api } from '../Axios/Axios';

// Types
interface ReagentSupply {
  _id: string;
  reagent_name: string;
  catalog_number: string;
  vendor_name: string;
  vendor_id: string;
  po_number: string;
  order_date: string;
  receipt_date: string;
  quantity_received: number;
  unit_of_measure: string;
  lot_number: string;
  expiration_date: string;
  received_by_doctor: string;
  storage_location: string;
  status: string;
  receipt_date_time?: string;
  created_at: string;
  updated_at: string;
}

interface Batch {
  lot_number: string;
  quantity: number;
  expiration_date: string;
  supply_id: string;
  storage_location?: string;
  received_date: string;
}

interface Reagent {
  _id: string;
  reagent_name: string;
  catalog_number?: string;
  manufacturer?: string;
  cas_number?: string;
  description?: string;
  quantity_available: number;
  unit: string;
  nearest_expiration_date?: string;
  batch_count?: number;
  expiring_soon_count?: number;
  expired_count?: number;
  expiring_soon_quantity?: number;
  expired_quantity?: number;
  created_at: string;
  createdAt?: string;
  updatedAt?: string;
  batches?: Batch[];
}

interface ReagentUsage {
  _id: string;
  reagent_name: string;
  quantity_used: number;
  used_by: string;
  role: string;
  used_at: string;
  notes?: string;
  instrument_id?: string;
  instrument_name?: string;
  procedure?: string;
  used_for?: string;
  created_at: string;
  updated_at: string;
}

interface ReagentVendor {
  _id: string;
  vendor_id: string;
  vendor_name: string;
  contact_info: {
    email: string;
    phone: string;
    address: string;
  };
  created_at: string;
  updated_at?: string;
}

// interface ApiResponse<T> {
//   success: boolean;
//   message: string;
//   data: T;
// }

const ReagentHistory: React.FC = () => {
  const { isDarkMode } = useGlobalTheme();
  const [activeTab, setActiveTab] = useState<'supply' | 'usage' | 'vendors' | 'reagents'>('supply');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [instrumentFilter, setInstrumentFilter] = useState('');
  const [reagentNameFilter, setReagentNameFilter] = useState('');

  // Helper component for displaying field errors
  const FieldError: React.FC<{ error?: string }> = ({ error }) => {
    if (!error) return null;
    return (
      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
        <AlertCircle className="h-4 w-4" />
        {error}
      </p>
    );
  };

  // Helper function to update form data and clear error
  const updateFormField = (field: string, value: any) => {
    setEditFormData({ ...editFormData, [field]: value });
    if (formErrors[field]) {
      const newErrors = { ...formErrors };
      delete newErrors[field];
      setFormErrors(newErrors);
    }
  };

  // Add CSS animations for modal (matching EventLog styles)
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // CRUD States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'delete'>('add');
  const [selectedItem, setSelectedItem] = useState<ReagentSupply | ReagentUsage | ReagentVendor | Reagent | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // API Data States
  const [supplyHistory, setSupplyHistory] = useState<ReagentSupply[]>([]);
  const [usageHistory, setUsageHistory] = useState<ReagentUsage[]>([]);
  const [vendorList, setVendorList] = useState<ReagentVendor[]>([]);
  const [reagentList, setReagentList] = useState<Reagent[]>([]);
  const [instrumentList, setInstrumentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReagentBatches, setSelectedReagentBatches] = useState<Batch[]>([]);
  
  // Stats for dashboard view
  const [showStats, setShowStats] = useState(true);

  // Load data functions
  const loadSupplyHistory = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/reagent-supply/getAllSupplyRecords');
      
      if (response.data?.success) {
        // API trả về data trong structure: { records: [], pagination: {} }
        const rawRecords = response.data.data?.records || response.data.data;
        
        // Process records to handle MongoDB Decimal128 and other complex objects
        const processedRecords = Array.isArray(rawRecords) ? rawRecords.map(record => ({
          ...record,
          quantity_received: typeof record.quantity_received === 'object' && record.quantity_received?.$numberDecimal 
            ? parseFloat(record.quantity_received.$numberDecimal) 
            : record.quantity_received,
          // Keep original dates for editing, add display versions
          order_date_raw: record.order_date,
          receipt_date_raw: record.receipt_date,
          expiration_date_raw: record.expiration_date,
          // Display formatted dates
          order_date: new Date(record.order_date).toLocaleDateString(),
          receipt_date: new Date(record.receipt_date).toLocaleDateString(),
          expiration_date: new Date(record.expiration_date).toLocaleDateString()
        })) : [];
        
        setSupplyHistory(processedRecords);
        toast.success(`Loaded ${processedRecords?.length || 0} supply records`);
      } else {
        toast.error(response.data?.message || 'Failed to load supply history');
        setSupplyHistory([]);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        toast.error('Supply history endpoint not found. Please check API configuration.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load supply history');
      }
      
      setSupplyHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsageHistory = async () => {
    try {
      setLoading(true);
      
      // Load all usage history
      const response = await api.get('/reagent-usage/history');
      
      // API trả về { message, total, data }
      if (response.data && response.data.data) {
        setUsageHistory(Array.isArray(response.data.data) ? response.data.data : []);
        toast.success(`Loaded ${response.data.total || response.data.data?.length || 0} usage records`);
      } else {
        toast.error('Failed to load usage history');
        setUsageHistory([]);
      }
    } catch (error: any) {
      toast.error('Failed to load usage history');
      setUsageHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vendors/getAllVendors');
      if (response.data.success) {
        setVendorList(Array.isArray(response.data.data) ? response.data.data : []);
        toast.success(`Loaded ${response.data.data?.length || 0} vendor records`);
      } else {
        toast.error('Failed to load vendors');
        setVendorList([]);
      }
    } catch (error) {
      toast.error('Failed to load vendors');
      setVendorList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReagents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reagents/getAllReagents');
      if (response.data.success) {
        const reagents = Array.isArray(response.data.data) ? response.data.data : [];
        setReagentList(reagents);
        toast.success(`Loaded ${reagents.length || 0} reagent records`);
      } else {
        setReagentList([]);
        toast.error('Failed to load reagents');
      }
    } catch (error) {
      setReagentList([]);
      toast.error('Failed to load reagents');
    } finally {
      setLoading(false);
    }
  };

  const loadInstruments = async () => {
    try {
      const response = await api.get('/instruments/getAllinstrument');
      
      // Backend returns { message, count, instruments }
      if (response.data && response.data.instruments) {
        const instruments = Array.isArray(response.data.instruments) ? response.data.instruments : [];
        setInstrumentList(instruments);
      } else {
        setInstrumentList([]);
      }
    } catch (error: any) {
      setInstrumentList([]);
    }
  };



  // Load data on component mount and when activeTab changes
  useEffect(() => {
    switch (activeTab) {
      case 'supply':
        loadSupplyHistory();
        break;
      case 'usage':
        loadUsageHistory();
        break;
      case 'vendors':
        loadVendors();
        break;
      case 'reagents':
        loadReagents();
        break;
    }
  }, [activeTab]);

  // Load reagents, vendors, and instruments for dropdowns on component mount
  useEffect(() => {
    const loadAllDropdownData = async () => {
      await Promise.all([
        loadReagents(),
        loadVendors(),
        loadInstruments()
      ]);
    };
    loadAllDropdownData();
  }, []);

  // CRUD Functions
  const handleAdd = () => {
    setModalType('add');
    setSelectedItem(null);
    setFormErrors({}); // Clear previous errors
    
    // Initialize form data with proper structure
    if (activeTab === 'supply') {
      setEditFormData({
        reagent_name: '',
        catalog_number: '',
        vendor_name: '',
        vendor_id: '',
        po_number: '',
        order_date: new Date().toISOString().split('T')[0],
        receipt_date: new Date().toISOString().split('T')[0],
        quantity_received: '',
        unit_of_measure: '',
        lot_number: '',
        expiration_date: '',
        received_by_doctor: '',
        storage_location: '',
        status: 'received'
      });
    } else if (activeTab === 'reagents') {
      setEditFormData({
        reagent_name: '',
        catalog_number: '',
        manufacturer: '',
        cas_number: '',
        description: '',
        quantity_available: 0,
        unit: 'mL'
      });
    } else if (activeTab === 'usage') {
      setEditFormData({
        reagent_name: '',
        instrument_id: '',
        instrument_name: '',
        quantity_used: '',
        unit: '',
        notes: '',
        used_at: new Date().toISOString().split('T')[0]
      });
    } else if (activeTab === 'vendors') {
      setEditFormData({
        vendor_id: '',
        vendor_name: '',
        contact_info: {
          email: '',
          phone: '',
          address: ''
        }
      });
    } else {
      setEditFormData({});
    }
    
    setShowModal(true);
  };

  const handleEdit = async (item: ReagentSupply | ReagentUsage | ReagentVendor | Reagent) => {
    setModalType('edit');
    setSelectedItem(item);
    setFormErrors({}); // Clear previous errors
    
    // Format data for editing, especially dates
    const formData: any = {...item};
    
    if (activeTab === 'supply') {
      const supplyItem: any = item;
      
      // Use raw dates if available (from loadSupplyHistory), otherwise try to parse display dates
      try {
        if (supplyItem.order_date_raw) {
          const orderDate = new Date(supplyItem.order_date_raw);
          formData.order_date = !isNaN(orderDate.getTime()) ? orderDate.toISOString().split('T')[0] : '';
        } else if (supplyItem.order_date) {
          const orderDate = new Date(supplyItem.order_date);
          formData.order_date = !isNaN(orderDate.getTime()) ? orderDate.toISOString().split('T')[0] : '';
        }
        
        if (supplyItem.receipt_date_raw) {
          const receiptDate = new Date(supplyItem.receipt_date_raw);
          formData.receipt_date = !isNaN(receiptDate.getTime()) ? receiptDate.toISOString().split('T')[0] : '';
        } else if (supplyItem.receipt_date) {
          const receiptDate = new Date(supplyItem.receipt_date);
          formData.receipt_date = !isNaN(receiptDate.getTime()) ? receiptDate.toISOString().split('T')[0] : '';
        }
        
        if (supplyItem.expiration_date_raw) {
          const expirationDate = new Date(supplyItem.expiration_date_raw);
          formData.expiration_date = !isNaN(expirationDate.getTime()) ? expirationDate.toISOString().split('T')[0] : '';
        } else if (supplyItem.expiration_date) {
          const expirationDate = new Date(supplyItem.expiration_date);
          formData.expiration_date = !isNaN(expirationDate.getTime()) ? expirationDate.toISOString().split('T')[0] : '';
        }
      } catch (error) {
        // Keep original values if parsing fails
        formData.order_date = formData.order_date || '';
        formData.receipt_date = formData.receipt_date || '';
        formData.expiration_date = formData.expiration_date || '';
      }
    } else if (activeTab === 'reagents') {
      // Load batches if editing a reagent
      try {
        const reagent = item as Reagent;
        const response = await api.get(`/reagents/getBatches/${encodeURIComponent(reagent.reagent_name)}`);
        if (response.data.success && response.data.data.batches) {
          setSelectedReagentBatches(response.data.data.batches);
        } else {
          setSelectedReagentBatches([]);
        }
      } catch (error) {
        setSelectedReagentBatches([]);
      }
    }
    
    setEditFormData(formData);
    setShowModal(true);
  };

  const handleView = async (item: ReagentSupply | ReagentUsage | ReagentVendor | Reagent) => {
    setModalType('view');
    setSelectedItem(item);
    
    // Load batches if viewing a reagent
    if (activeTab === 'reagents') {
      try {
        const reagent = item as Reagent;
        const response = await api.get(`/reagents/getBatches/${encodeURIComponent(reagent.reagent_name)}`);
        if (response.data.success && response.data.data.batches) {
          setSelectedReagentBatches(response.data.data.batches);
        } else {
          setSelectedReagentBatches([]);
        }
      } catch (error) {
        setSelectedReagentBatches([]);
      }
    } else {
      setSelectedReagentBatches([]);
    }
    
    setShowModal(true);
  };

  const handleDelete = (item: ReagentSupply | ReagentUsage | ReagentVendor | Reagent) => {
    setModalType('delete');
    setSelectedItem(item);
    setShowModal(true);
  };

  // Validation Functions
  const validateSupplyForm = (): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    // Check required fields
    if (!editFormData.reagent_name?.trim()) {
      errors.reagent_name = 'Reagent name is required';
    }
    if (!editFormData.catalog_number?.trim()) {
      errors.catalog_number = 'Catalog number is required';
    }
    if (!editFormData.vendor_name?.trim()) {
      errors.vendor_name = 'Vendor name is required';
    }
    if (!editFormData.vendor_id?.trim()) {
      errors.vendor_id = 'Vendor ID is required';
    }
    if (!editFormData.po_number?.trim()) {
      errors.po_number = 'PO number is required';
    }
    if (!editFormData.order_date) {
      errors.order_date = 'Order date is required';
    }
    if (!editFormData.receipt_date) {
      errors.receipt_date = 'Receipt date is required';
    }
    if (!editFormData.expiration_date) {
      errors.expiration_date = 'Expiration date is required';
    }
    if (!editFormData.lot_number?.trim()) {
      errors.lot_number = 'Lot number is required';
    }
    if (!editFormData.storage_location?.trim()) {
      errors.storage_location = 'Storage location is required';
    }
    
    // Validate quantity
    const quantity = parseFloat(editFormData.quantity_received);
    if (isNaN(quantity) || quantity <= 0) {
      errors.quantity_received = 'Quantity must be greater than 0';
    }
    
    if (!editFormData.unit_of_measure?.trim()) {
      errors.unit_of_measure = 'Unit of measure is required';
    }
    
    // Validate dates logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (editFormData.order_date) {
      const orderDate = new Date(editFormData.order_date);
      orderDate.setHours(0, 0, 0, 0);
      
      // Order date cannot be in the future
      if (orderDate > today) {
        errors.order_date = 'Order date cannot be in the future';
      }
      
      // Order date cannot be more than 10 years in the past
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
      tenYearsAgo.setHours(0, 0, 0, 0);
      if (orderDate < tenYearsAgo) {
        errors.order_date = 'Order date cannot be more than 10 years in the past';
      }
    }
    
    if (editFormData.receipt_date) {
      const receiptDate = new Date(editFormData.receipt_date);
      receiptDate.setHours(0, 0, 0, 0);
      
      // Receipt date cannot be in the past when adding new records
      if (modalType === 'add' && receiptDate < today) {
        errors.receipt_date = 'Receipt date cannot be in the past';
      }
      
      // Receipt date can be in the future but not more than 1 year
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      oneYearFromNow.setHours(0, 0, 0, 0);
      if (receiptDate > oneYearFromNow) {
        errors.receipt_date = 'Receipt date cannot be more than 1 year in the future';
      }
    }
    
    if (editFormData.order_date && editFormData.receipt_date) {
      const orderDate = new Date(editFormData.order_date);
      const receiptDate = new Date(editFormData.receipt_date);
      orderDate.setHours(0, 0, 0, 0);
      receiptDate.setHours(0, 0, 0, 0);
      
      if (receiptDate < orderDate) {
        errors.receipt_date = 'Receipt date must be equal to or after order date';
      }
    }
    
    if (editFormData.receipt_date && editFormData.expiration_date) {
      const receiptDate = new Date(editFormData.receipt_date);
      const expirationDate = new Date(editFormData.expiration_date);
      receiptDate.setHours(0, 0, 0, 0);
      expirationDate.setHours(0, 0, 0, 0);
      
      if (expirationDate <= receiptDate) {
        errors.expiration_date = 'Expiration date must be after receipt date';
      }
      
      // Expiration date should be at least 1 day after receipt date
      const oneDayAfterReceipt = new Date(receiptDate);
      oneDayAfterReceipt.setDate(oneDayAfterReceipt.getDate() + 1);
      if (expirationDate < oneDayAfterReceipt) {
        errors.expiration_date = 'Expiration date must be at least 1 day after receipt date';
      }
      
      // Expiration date cannot be more than 20 years in the future
      const twentyYearsFromNow = new Date();
      twentyYearsFromNow.setFullYear(twentyYearsFromNow.getFullYear() + 20);
      twentyYearsFromNow.setHours(0, 0, 0, 0);
      if (expirationDate > twentyYearsFromNow) {
        errors.expiration_date = 'Expiration date cannot be more than 20 years in the future';
      }
    }
    
    // Additional validation: expiration date should not be in the past for new supplies
    if (modalType === 'add' && editFormData.expiration_date) {
      const expirationDate = new Date(editFormData.expiration_date);
      expirationDate.setHours(0, 0, 0, 0);
      
      if (expirationDate < today) {
        errors.expiration_date = 'Cannot add supplies with expired expiration dates';
      }
    }
    
    return { valid: Object.keys(errors).length === 0, errors };
  };

  const validateReagentForm = (): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    // Validate Reagent Name (Required)
    if (!editFormData.reagent_name?.trim()) {
      errors.reagent_name = 'Reagent name is required';
    } else if (modalType === 'add') {
      // Check for duplicate reagent name when adding
      const isDuplicate = reagentList.some(
        r => r.reagent_name.toLowerCase() === editFormData.reagent_name.toLowerCase()
      );
      if (isDuplicate) {
        errors.reagent_name = 'A reagent with this name already exists';
      }
    }
    
    // Validate Catalog Number (Required)
    if (!editFormData.catalog_number?.trim()) {
      errors.catalog_number = 'Catalog number is required';
    }
    
    // Validate Manufacturer (Required)
    if (!editFormData.manufacturer?.trim()) {
      errors.manufacturer = 'Manufacturer is required';
    }
    
    // Validate CAS Number (Required and format)
    if (!editFormData.cas_number?.trim()) {
      errors.cas_number = 'CAS number is required';
    } else {
      const casRegex = /^\d{2,7}-\d{2}-\d{1}$/;
      if (!casRegex.test(editFormData.cas_number.trim())) {
        errors.cas_number = 'Invalid CAS number format (e.g., 7732-18-5)';
      }
    }
    
    // Validate Quantity Available (Required)
    const quantity = parseFloat(editFormData.quantity_available);
    if (editFormData.quantity_available === '' || editFormData.quantity_available === null || editFormData.quantity_available === undefined) {
      errors.quantity_available = 'Quantity is required';
    } else if (isNaN(quantity) || quantity < 0) {
      errors.quantity_available = 'Quantity must be 0 or greater';
    }
    
    // Validate Unit (Required)
    if (!editFormData.unit?.trim()) {
      errors.unit = 'Unit is required';
    }
    
    return { valid: Object.keys(errors).length === 0, errors };
  };

  const validateVendorForm = (): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    // Validate Vendor ID (Required)
    if (!editFormData.vendor_id?.trim()) {
      errors.vendor_id = 'Vendor ID is required';
    } else if (modalType === 'add') {
      // Check for duplicate vendor ID when adding
      const isDuplicate = vendorList.some(
        v => v.vendor_id.toLowerCase() === editFormData.vendor_id.toLowerCase()
      );
      if (isDuplicate) {
        errors.vendor_id = 'A vendor with this ID already exists';
      }
    }
    
    // Validate Vendor Name (Required)
    if (!editFormData.vendor_name?.trim()) {
      errors.vendor_name = 'Vendor name is required';
    }
    
    // Validate Email (Required and format)
    if (!editFormData.contact_info?.email?.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editFormData.contact_info.email)) {
        errors.email = 'Invalid email address format';
      }
    }
    
    // Validate Phone (Required and format)
    if (!editFormData.contact_info?.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(editFormData.contact_info.phone) || editFormData.contact_info.phone.length < 10) {
        errors.phone = 'Invalid phone number (minimum 10 digits)';
      }
    }
    
    // Validate Address (Required)
    if (!editFormData.contact_info?.address?.trim()) {
      errors.address = 'Address is required';
    }
    
    return { valid: Object.keys(errors).length === 0, errors };
  };

  const validateUsageForm = (): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    // Validate Reagent Name (Required)
    if (!editFormData.reagent_name?.trim()) {
      errors.reagent_name = 'Reagent name is required';
    } else {
      // Check if reagent is available
      const selectedReagent = reagentList.find(r => r.reagent_name === editFormData.reagent_name);
      if (selectedReagent) {
        if (selectedReagent.quantity_available <= 0) {
          errors.reagent_name = 'This reagent is out of stock';
          toast.error(`${selectedReagent.reagent_name} is out of stock. Available quantity: ${selectedReagent.quantity_available} ${selectedReagent.unit}`);
        } else {
          // Check if requested quantity exceeds available quantity
          const requestedQty = parseFloat(editFormData.quantity_used);
          if (!isNaN(requestedQty) && requestedQty > selectedReagent.quantity_available) {
            errors.quantity_used = `Insufficient quantity. Available: ${selectedReagent.quantity_available} ${selectedReagent.unit}`;
            toast.error(`Insufficient quantity for ${selectedReagent.reagent_name}. Available: ${selectedReagent.quantity_available} ${selectedReagent.unit}, Requested: ${requestedQty} ${selectedReagent.unit}`);
          }
        }
      }
    }
    
    // Validate Instrument (Required)
    if (!editFormData.instrument_id?.trim()) {
      errors.instrument_id = 'Instrument is required';
    } else {
      // Check instrument status
      const selectedInstrument = instrumentList.find(i => i.instrument_id === editFormData.instrument_id);
      if (selectedInstrument) {
        if (selectedInstrument.status === 'Maintenance') {
          errors.instrument_id = 'This instrument is under maintenance';
          toast.error(`${selectedInstrument.name} (${selectedInstrument.instrument_id}) is currently under maintenance and cannot be used`);
        } else if (selectedInstrument.status === 'Out of Service') {
          errors.instrument_id = 'This instrument is out of service';
          toast.error(`${selectedInstrument.name} (${selectedInstrument.instrument_id}) is out of service and cannot be used`);
        } else if (selectedInstrument.status === 'In Use' && modalType === 'add') {
          // Warning only for new records - show toast but don't block submission
          toast.warning(`⚠️ Warning: ${selectedInstrument.name} (${selectedInstrument.instrument_id}) is currently in use!`, 5000);
        }
      }
    }
    
    // Validate Quantity Used (Required)
    const quantity = parseFloat(editFormData.quantity_used);
    if (!editFormData.quantity_used || editFormData.quantity_used === '') {
      errors.quantity_used = 'Quantity used is required';
    } else if (isNaN(quantity) || quantity <= 0) {
      errors.quantity_used = 'Quantity must be greater than 0';
    }
    
    // Validate Unit (Required)
    if (!editFormData.unit?.trim()) {
      errors.unit = 'Unit is required';
    }
    
    // Validate Used At Date (Required)
    if (!editFormData.used_at) {
      errors.used_at = 'Usage date is required';
    } else {
      const usedAtDate = new Date(editFormData.used_at);
      usedAtDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Usage date cannot be in the future
      if (usedAtDate > today) {
        errors.used_at = 'Usage date cannot be in the future';
      }
      
      // Usage date cannot be more than 5 years in the past
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
      fiveYearsAgo.setHours(0, 0, 0, 0);
      if (usedAtDate < fiveYearsAgo) {
        errors.used_at = 'Usage date cannot be more than 5 years in the past';
      }
    }
    
    return { valid: Object.keys(errors).length === 0, errors };
  };

  // API CRUD Functions
  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'supply') {
        // Validate supply form
        const validation = validateSupplyForm();
        if (!validation.valid) {
          setFormErrors(validation.errors);
          toast.error('Please fix the validation errors');
          setLoading(false);
          return;
        }
        setFormErrors({}); // Clear errors if validation passes
        
        // Prepare data - remove received_by_doctor as backend fills it from token
        const { received_by_doctor, ...supplyData } = editFormData;
        
        if (modalType === 'add') {
          await api.post('/reagent-supply/createSupplyRecord', supplyData);
          toast.success('Supply record created successfully!');
          loadSupplyHistory();
        } else if (modalType === 'edit') {
          const supplyId = (selectedItem as any).supply_id;
          if (!supplyId) {
            toast.error('Supply ID not found');
            setLoading(false);
            return;
          }
          await api.put(`/reagent-supply/updateSupplyRecord/${supplyId}`, supplyData);
          toast.success('Supply record updated successfully!');
          loadSupplyHistory();
        }
      } else if (activeTab === 'reagents') {
        // Validate reagent form
        const validation = validateReagentForm();
        if (!validation.valid) {
          setFormErrors(validation.errors);
          toast.error('Please fix the validation errors');
          setLoading(false);
          return;
        }
        setFormErrors({}); // Clear errors if validation passes
        
        if (modalType === 'add') {
          await api.post('/reagents/createReagent', editFormData);
          toast.success('Reagent created successfully!');
          loadReagents();
        } else if (modalType === 'edit') {
          const reagentName = (selectedItem as Reagent).reagent_name;
          if (!reagentName) {
            toast.error('Reagent name not found');
            setLoading(false);
            return;
          }
          await api.put(`/reagents/updateReagentByName/${encodeURIComponent(reagentName)}`, editFormData);
          toast.success('Reagent updated successfully!');
          loadReagents();
        }
      } else if (activeTab === 'usage') {
        // Validate usage form
        const validation = validateUsageForm();
        if (!validation.valid) {
          setFormErrors(validation.errors);
          toast.error('Please fix the validation errors');
          setLoading(false);
          return;
        }
        setFormErrors({}); // Clear errors if validation passes
        
        if (modalType === 'add') {
          // Transform data to match backend API structure
          const usagePayload = {
            reagents: [
              {
                reagent_name: editFormData.reagent_name,
                quantity_used: parseFloat(editFormData.quantity_used)
              }
            ],
            instrument_id: editFormData.instrument_id,
            notes: editFormData.notes || '',
            used_for: editFormData.instrument_name || editFormData.instrument_id
          };
          
          await api.post('/reagent-usage/use', usagePayload);
          toast.success('Usage record created successfully!');
          loadUsageHistory();
        } else if (modalType === 'edit') {
          toast.warning('Usage records cannot be edited. Please delete and create a new record if needed.');
          setLoading(false);
          return;
        }
      } else if (activeTab === 'vendors') {
        // Validate vendor form
        const validation = validateVendorForm();
        if (!validation.valid) {
          setFormErrors(validation.errors);
          toast.error('Please fix the validation errors');
          setLoading(false);
          return;
        }
        setFormErrors({}); // Clear errors if validation passes
        
        if (modalType === 'add') {
          await api.post('/vendors/createVendor', editFormData);
          toast.success('Vendor created successfully!');
          loadVendors();
        } else if (modalType === 'edit') {
          await api.put(`/vendors/updateVendor/${(selectedItem as ReagentVendor).vendor_id}`, editFormData);
          toast.success('Vendor updated successfully!');
          loadVendors();
        }
      }
      
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'supply' && selectedItem) {
        const supplyId = (selectedItem as any).supply_id;
        if (!supplyId) {
          toast.error('Supply ID not found');
          setLoading(false);
          return;
        }
        await api.delete(`/reagent-supply/deleteSupplyRecord/${supplyId}`);
        toast.success('Supply record deleted successfully');
        loadSupplyHistory();
      } else if (activeTab === 'usage' && selectedItem) {
        const usageId = (selectedItem as any)._id;
        if (!usageId) {
          toast.error('Usage ID not found');
          setLoading(false);
          return;
        }
        await api.delete(`/reagent-usage/delete/${usageId}`);
        toast.success('Usage record deleted successfully');
        loadUsageHistory();
      } else if (activeTab === 'reagents' && selectedItem) {
        const reagentName = (selectedItem as Reagent).reagent_name;
        if (!reagentName) {
          toast.error('Reagent name not found');
          setLoading(false);
          return;
        }
        await api.delete(`/reagents/deleteReagentByName/${encodeURIComponent(reagentName)}`);
        toast.success('Reagent deleted successfully');
        loadReagents();
      } else if (activeTab === 'vendors' && selectedItem) {
        await api.delete(`/vendors/deleteVendor/${(selectedItem as ReagentVendor).vendor_id}`);
        toast.success('Vendor deleted successfully');
        loadVendors();
      }
      
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  // Export functions
  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      let dataToExport: any[] = [];
      let exportData: any[] = [];
      
      if (activeTab === 'supply') {
        dataToExport = filteredSupplyHistory;
        exportData = dataToExport.map(item => ({
          id: item._id,
          reagentName: item.reagent_name,
          catalogNumber: item.catalog_number,
          lotNumber: item.lot_number,
          supplier: item.vendor_name,
          date: item.receipt_date,
          quantity: item.quantity_received,
          type: activeTab,
          status: item.status
        }));
      } else if (activeTab === 'usage') {
        dataToExport = filteredUsageHistory;
        exportData = dataToExport.map(item => ({
          id: item._id,
          reagentName: item.reagent_name,
          date: new Date(item.used_at).toLocaleDateString(),
          quantity: item.quantity_used,
          usedBy: item.used_by,
          notes: item.notes,
          type: activeTab,
          status: 'Used'
        }));
      } else if (activeTab === 'reagents') {
        dataToExport = filteredReagentList;
        exportData = dataToExport.map(item => ({
          id: item._id,
          reagentName: item.reagent_name,
          catalogNumber: item.catalog_number || 'N/A',
          manufacturer: item.manufacturer || 'N/A',
          casNumber: item.cas_number || 'N/A',
          description: item.description || 'N/A',
          quantityAvailable: item.quantity_available,
          unit: item.unit,
          type: activeTab,
          created: item.created_at
        }));
      } else if (activeTab === 'vendors') {
        dataToExport = filteredVendorList;
        exportData = dataToExport.map(item => ({
          id: item.vendor_id,
          name: item.vendor_name,
          email: item.contact_info.email,
          phone: item.contact_info.phone,
          address: item.contact_info.address,
          type: activeTab,
          created: item.created_at
        }));
      }
      
      const result = exportReagentData(exportData, format);
      if (result.success) {
        toast.success(`${activeTab === 'vendors' ? 'Vendor' : activeTab === 'reagents' ? 'Reagent' : 'Supply/Usage'} data exported to ${format.toUpperCase()} successfully!`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Failed to export ${activeTab === 'vendors' ? 'vendor' : activeTab === 'reagents' ? 'reagent' : 'supply/usage'} data to ${format.toUpperCase()}`);
    }
  };

  // Filter functions with safe checks
  const filteredSupplyHistory = Array.isArray(supplyHistory) ? supplyHistory.filter(supply => {
    const matchSearch = searchTerm === '' || 
      supply.reagent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.catalog_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.lot_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchDate = dateFilter === '' || supply.receipt_date === dateFilter;
    
    const matchVendor = vendorFilter === '' || supply.vendor_name === vendorFilter;
    
    return matchSearch && matchDate && matchVendor;
  }) : [];

  const filteredUsageHistory = Array.isArray(usageHistory) ? usageHistory.filter(usage => {
    const matchSearch = searchTerm === '' || 
      usage.reagent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usage.used_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usage.notes && usage.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchDate = dateFilter === '' || usage.used_at?.split('T')[0] === dateFilter;
    
    const matchReagentName = reagentNameFilter === '' || usage.reagent_name === reagentNameFilter;
    
    const matchInstrumentName = instrumentFilter === '' || usage.instrument_name === instrumentFilter || usage.instrument_id === instrumentFilter;
    
    return matchSearch && matchDate && matchReagentName && matchInstrumentName;
  }) : [];

  const filteredVendorList = Array.isArray(vendorList) ? vendorList.filter(vendor => {
    const matchSearch = searchTerm === '' || 
      vendor.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.vendor_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contact_info?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contact_info?.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contact_info?.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchSearch;
  }) : [];

  const filteredReagentList = Array.isArray(reagentList) ? reagentList.filter(reagent => {
    const matchSearch = searchTerm === '' || 
      reagent.reagent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reagent.catalog_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reagent.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reagent.cas_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reagent.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchSearch;
  }) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
      case 'Used':
        return isDarkMode ? 'bg-green-900/50 text-green-300 border-green-700' : 'bg-green-100 text-green-800 border-green-200';
      case 'partial_shipment':
        return isDarkMode ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'returned':
      case 'Expired':
        return isDarkMode ? 'bg-red-900/50 text-red-300 border-red-700' : 'bg-red-100 text-red-800 border-red-200';
      case 'Consumed':
        return isDarkMode ? 'bg-blue-900/50 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
      case 'Used':
        return <CheckCircle className="h-4 w-4" />;
      case 'partial_shipment':
        return <AlertCircle className="h-4 w-4" />;
      case 'returned':
      case 'Expired':
        return <XCircle className="h-4 w-4" />;
      case 'Consumed':
        return <Activity className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'received':
        return 'Received';
      case 'partial_shipment':
        return 'Partial Shipment';
      case 'returned':
        return 'Returned';
      default:
        return status;
    }
  };

  // Calculate statistics with safe checks
  const supplyStats = {
    total: Array.isArray(supplyHistory) ? supplyHistory.length : 0,
    received: Array.isArray(supplyHistory) ? supplyHistory.filter(s => s.status === 'received').length : 0,
    partial: Array.isArray(supplyHistory) ? supplyHistory.filter(s => s.status === 'partial_shipment').length : 0,
    returned: Array.isArray(supplyHistory) ? supplyHistory.filter(s => s.status === 'returned').length : 0,
  };

  const usageStats = {
    total: Array.isArray(usageHistory) ? usageHistory.length : 0,
    used: Array.isArray(usageHistory) ? usageHistory.length : 0, // All records in usage history are "used"
    consumed: 0, // ReagentUsage doesn't have status field in current API
    expired: 0,
  };

  const vendorStats = {
    total: Array.isArray(vendorList) ? vendorList.length : 0,
    active: Array.isArray(vendorList) ? vendorList.length : 0, // All vendors are considered active for now
    newThisMonth: Array.isArray(vendorList) ? vendorList.filter(v => new Date(v.created_at).getMonth() === new Date().getMonth()).length : 0,
    countries: Array.isArray(vendorList) ? [...new Set(vendorList.map(v => v.contact_info?.address?.split(', ')?.pop()).filter(Boolean))].length : 0,
  };

  const reagentStats = {
    total: Array.isArray(reagentList) ? reagentList.length : 0,
    available: Array.isArray(reagentList) ? reagentList.filter(r => r.quantity_available > 0).length : 0,
    lowStock: Array.isArray(reagentList) ? reagentList.filter(r => r.quantity_available <= 10 && r.quantity_available > 0).length : 0,
    outOfStock: Array.isArray(reagentList) ? reagentList.filter(r => r.quantity_available === 0).length : 0,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className={`rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-3 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <div className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-300 flex-shrink-0 ${
                isDarkMode ? 'bg-blue-700' : 'bg-blue-600'
              }`}>
                <Beaker className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <span className="truncate">Reagent Management System</span>
            </h1>
            <p className={`mt-1.5 sm:mt-2 text-sm sm:text-base lg:text-lg transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Track reagent supply, usage history, and vendor management for compliance and audit purposes
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
            <button 
              onClick={() => setShowStats(!showStats)}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm lg:text-base transition-all duration-300 border ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
              }`}
            >
              <BarChart3 className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">{showStats ? 'Hide' : 'Show'}</span>
            </button>
            <button 
              onClick={handleAdd}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-white rounded-lg text-xs sm:text-sm lg:text-base transition-all duration-300 shadow-md whitespace-nowrap ${
              isDarkMode 
                ? 'bg-green-700 hover:bg-green-800'
                : 'bg-green-600 hover:bg-green-700'
            }`}>
              <Plus className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Add</span>
            </button>
            <div className="relative group">
              <button className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-white rounded-lg text-xs sm:text-sm lg:text-base transition-all duration-300 shadow-md whitespace-nowrap ${
                isDarkMode 
                  ? 'bg-blue-700 hover:bg-blue-800'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}>
                <Download className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <div className={`absolute top-full right-0 mt-1 border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 min-w-[120px] ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <button 
                  onClick={() => handleExport('excel')}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-t-lg transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Export Excel
                </button>
                <button 
                  onClick={() => handleExport('pdf')}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-b-lg transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {activeTab === 'supply' ? (
            <>
              <div className={`rounded-xl shadow-sm p-6 border-l-4 border-blue-500 transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'  
                    }`}>Total Supplies</p>
                    <p className={`text-xl sm:text-2xl font-bold transition-colors duration-300 truncate ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{supplyStats.total}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-full transition-colors duration-300 flex-shrink-0 ${
                    isDarkMode ? 'bg-blue-800' : 'bg-blue-100'
                  }`}>
                    <Truck className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-600'
                    }`} />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs sm:text-sm">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1 flex-shrink-0" />
                  <span className="text-green-600 truncate">+12% from last month</span>
                </div>
              </div>

              <div className={`rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border-l-4 border-green-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Received</p>
                    <p className={`text-xl sm:text-2xl font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{supplyStats.received}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xs sm:text-sm text-gray-500 truncate">Success rate: 85%</span>
                </div>
              </div>

              <div className={`rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border-l-4 border-yellow-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Partial Shipments</p>
                    <p className={`text-xl sm:text-2xl font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{supplyStats.partial}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
                    <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xs sm:text-sm text-gray-500 truncate">Pending completion</span>
                </div>
              </div>

              <div className={`rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border-l-4 border-red-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Returned</p>
                    <p className={`text-xl sm:text-2xl font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{supplyStats.returned}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                    <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xs sm:text-sm text-gray-500 truncate">Quality issues</span>
                </div>
              </div>
            </>
          ) : activeTab === 'usage' ? (
            <>
              <div className={`rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border-l-4 border-purple-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Usage</p>
                    <p className={`text-xl sm:text-2xl font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{usageStats.total}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs sm:text-sm">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1 flex-shrink-0" />
                  <span className="text-green-600 truncate">+8% from last week</span>
                </div>
              </div>

              <div className={`rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border-l-4 border-green-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Usage</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{usageStats.used}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Currently in use</span>
                </div>
              </div>

              <div className={`rounded-xl shadow-sm p-6 border-l-4 border-blue-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Consumed</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{usageStats.consumed}</p>
                  </div>
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Fully utilized</span>
                </div>
              </div>

              <div className={`rounded-xl shadow-sm p-6 border-l-4 border-red-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Expired</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{usageStats.expired}</p>
                  </div>
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Needs disposal</span>
                </div>
              </div>
            </>
          ) : activeTab === 'reagents' ? (
            // Reagent Statistics
            <>
              <div className={`rounded-xl shadow-sm p-6 border-l-4 border-blue-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Reagents</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reagentStats.total}</p>
                  </div>
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <Beaker className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">Inventory overview</span>
                </div>
              </div>

              <div className={`rounded-xl shadow-sm p-6 border-l-4 border-green-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Available</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reagentStats.available}</p>
                  </div>
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">In stock</span>
                </div>
              </div>

              <div className={`rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Low Stock</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reagentStats.lowStock}</p>
                  </div>
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Needs restocking</span>
                </div>
              </div>

              <div className={`rounded-xl shadow-sm p-6 border-l-4 border-red-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Out of Stock</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reagentStats.outOfStock}</p>
                  </div>
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Immediate attention</span>
                </div>
              </div>
            </>
          ) : (
            // Vendor Statistics
            <>
              <div className={`rounded-xl shadow-sm p-6 border-l-4 border-green-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Vendors</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{vendorStats.total}</p>
                  </div>
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">Active partnerships</span>
                </div>
              </div>

              <div className={`rounded-xl shadow-sm p-6 border-l-4 border-blue-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Vendors</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{vendorStats.active}</p>
                  </div>
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Currently supplying</span>
                </div>
              </div>

              <div className={`rounded-xl shadow-sm p-6 border-l-4 border-purple-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>New This Month</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{vendorStats.newThisMonth}</p>
                  </div>
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                    <Plus className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Recently added</span>
                </div>
              </div>

              <div className={`rounded-xl shadow-sm p-6 border-l-4 border-orange-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Countries</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{vendorStats.countries}</p>
                  </div>
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Global reach</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className={`rounded-lg sm:rounded-xl shadow-sm border transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className={`border-b transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <nav className="flex flex-wrap sm:space-x-4 lg:space-x-8 px-3 sm:px-6">
            <button
              onClick={() => setActiveTab('supply')}
              className={`py-3 sm:py-4 px-2 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 ${
                activeTab === 'supply'
                  ? isDarkMode
                    ? 'border-blue-400 text-blue-400 bg-blue-900/30 rounded-t-lg'
                    : 'border-blue-500 text-blue-600 bg-blue-50 rounded-t-lg'
                  : isDarkMode
                    ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600 hover:bg-gray-800 rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-lg'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-3 py-1">
                <div className={`p-0.5 sm:p-1 rounded-full flex-shrink-0 ${activeTab === 'supply' ? 'bg-blue-200' : 'bg-gray-200'}`}>
                  <Truck className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <span className="font-semibold hidden xs:inline">Supply History</span>
                <span className="font-semibold xs:hidden">Supply</span>
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full ${activeTab === 'supply' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
                  {supplyStats.total}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`py-3 sm:py-4 px-2 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 ${
                activeTab === 'usage'
                  ? isDarkMode
                    ? 'border-purple-400 text-purple-400 bg-purple-900/30 rounded-t-lg'
                    : 'border-purple-500 text-purple-600 bg-purple-50 rounded-t-lg'
                  : isDarkMode
                    ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600 hover:bg-gray-800 rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-lg'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-3 py-1">
                <div className={`p-0.5 sm:p-1 rounded-full flex-shrink-0 ${activeTab === 'usage' ? 'bg-purple-200' : 'bg-gray-200'}`}>
                  <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <span className="font-semibold hidden xs:inline">Usage History</span>
                <span className="font-semibold xs:hidden">Usage</span>
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full ${activeTab === 'usage' ? 'bg-purple-200 text-purple-800' : 'bg-gray-200 text-gray-600'}`}>
                  {usageStats.total}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`py-3 sm:py-4 px-2 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 ${
                activeTab === 'vendors'
                  ? isDarkMode
                    ? 'border-green-400 text-green-400 bg-green-900/30 rounded-t-lg'
                    : 'border-green-500 text-green-600 bg-green-50 rounded-t-lg'
                  : isDarkMode
                    ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600 hover:bg-gray-800 rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-lg'
              }`}
            >
              <div className="flex items-center gap-3 px-3 py-1">
                <div className={`p-1 rounded-full ${activeTab === 'vendors' ? 'bg-green-200' : 'bg-gray-200'}`}>
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="font-semibold">Vendors</span>
                <span className={`px-2 py-1 text-xs rounded-full ${activeTab === 'vendors' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                  {vendorStats.total}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reagents')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'reagents'
                  ? isDarkMode
                    ? 'border-indigo-400 text-indigo-400 bg-indigo-900/30 rounded-t-lg'
                    : 'border-indigo-500 text-indigo-600 bg-indigo-50 rounded-t-lg'
                  : isDarkMode
                    ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600 hover:bg-gray-800 rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-lg'
              }`}
            >
              <div className="flex items-center gap-3 px-3 py-1">
                <div className={`p-1 rounded-full ${activeTab === 'reagents' ? 'bg-indigo-200' : 'bg-gray-200'}`}>
                  <Beaker className="h-4 w-4" />
                </div>
                <span className="font-semibold">Reagents</span>
                <span className={`px-2 py-1 text-xs rounded-full ${activeTab === 'reagents' ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-600'}`}>
                  {reagentStats.total}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Filters & Actions */}
        <div className={`p-6 border-b transition-colors duration-300 ${
          isDarkMode 
            ? 'border-gray-700 bg-gray-800' 
            : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex flex-col gap-4">
            {/* First Row: Search and Date Filter */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder={activeTab === 'vendors' ? "Search vendors..." : activeTab === 'reagents' ? "Search reagents..." : "Search reagents..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2.5 sm:py-3 w-full border rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                {activeTab !== 'vendors' && activeTab !== 'reagents' && (
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className={`pl-10 pr-4 py-2.5 sm:py-3 w-full border rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm transition-colors border shadow-sm whitespace-nowrap ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}>
                  <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Advanced Filters</span>
                  <span className="sm:hidden">Filters</span>
                </button>
                {(searchTerm || dateFilter || vendorFilter || instrumentFilter || reagentNameFilter) && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setDateFilter('');
                      setVendorFilter('');
                      setInstrumentFilter('');
                      setReagentNameFilter('');
                      if (activeTab === 'usage') {
                        loadUsageHistory();
                      }
                    }}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm transition-colors border shadow-sm whitespace-nowrap ${
                      isDarkMode 
                        ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50 border-red-800' 
                        : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                    }`}
                  >
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Clear Filters</span>
                    <span className="sm:hidden">Clear</span>
                  </button>
                )}
                <button 
                  onClick={handleAdd}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md font-medium text-xs sm:text-sm whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Add New {activeTab === 'supply' ? 'Supply' : activeTab === 'usage' ? 'Usage' : activeTab === 'reagents' ? 'Reagent' : 'Vendor'}</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>
            
            {/* Second Row: Specific Filters (Supply Vendor or Usage Reagent/Instrument) */}
            {activeTab === 'supply' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="relative">
                  <Building2 className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <select
                    value={vendorFilter}
                    onChange={(e) => setVendorFilter(e.target.value)}
                    className={`pl-10 pr-4 py-3 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none shadow-sm transition-colors duration-300 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  >
                    <option value="">All Vendors</option>
                    {vendorList.map((vendor) => (
                      <option key={vendor._id} value={vendor.vendor_name}>
                        {vendor.vendor_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            {activeTab === 'usage' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Beaker className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <select
                    value={reagentNameFilter}
                    onChange={(e) => setReagentNameFilter(e.target.value)}
                    className={`pl-10 pr-4 py-3 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none shadow-sm transition-colors duration-300 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  >
                    <option value="">All Reagents</option>
                    {Array.from(new Set(usageHistory.map(usage => usage.reagent_name))).sort().map((reagentName) => (
                      <option key={reagentName} value={reagentName}>
                        {reagentName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Activity className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <select
                    value={instrumentFilter}
                    onChange={(e) => setInstrumentFilter(e.target.value)}
                    className={`pl-10 pr-4 py-3 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none shadow-sm transition-colors duration-300 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  >
                    <option value="">All Instruments</option>
                    {Array.from(new Set(usageHistory.map(usage => usage.instrument_name).filter(Boolean))).sort().map((instrumentName) => (
                      <option key={instrumentName} value={instrumentName}>
                        {instrumentName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Summary */}
        {(searchTerm || dateFilter || vendorFilter || instrumentFilter || reagentNameFilter) && (
          <div className={`px-6 py-3 border-b transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-blue-900/30 border-blue-800' 
              : 'bg-blue-50 border-blue-100'
          }`}>
            <p className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-blue-300' : 'text-blue-700'
            }`}>
              Showing <span className="font-semibold">
                {activeTab === 'supply' ? filteredSupplyHistory.length : 
                 activeTab === 'usage' ? filteredUsageHistory.length : 
                 activeTab === 'reagents' ? filteredReagentList.length :
                 filteredVendorList.length}
              </span> of <span className="font-semibold">
                {activeTab === 'supply' ? supplyHistory.length : 
                 activeTab === 'usage' ? usageHistory.length : 
                 activeTab === 'reagents' ? reagentList.length :
                 vendorList.length}
              </span> {activeTab === 'supply' ? 'supply' : activeTab === 'usage' ? 'usage' : activeTab === 'reagents' ? 'reagent' : 'vendor'} records
              {searchTerm && <span> matching "{searchTerm}"</span>}
              {dateFilter && <span> for date {dateFilter}</span>}
              {vendorFilter && <span> from vendor "{vendorFilter}"</span>}
              {reagentNameFilter && <span> for reagent "{reagentNameFilter}"</span>}
              {instrumentFilter && <span> for instrument "{instrumentFilter}"</span>}
            </p>
          </div>
        )}

        {/* Content */}
        <div className={`p-6 transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {activeTab === 'supply' ? (
            /* Supply History Table */
            <div className={`overflow-hidden shadow-sm border rounded-xl transition-colors duration-300 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y transition-colors duration-300 ${
                  isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  <thead className={`transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-gray-800 to-gray-700' 
                      : 'bg-gradient-to-r from-gray-50 to-gray-100'
                  }`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Beaker className="h-4 w-4" />
                          Reagent Information
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Vendor Details
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Order Information
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Batch Information
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Status
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
                  }`}>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-sm">Loading supply records...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredSupplyHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Package className={`h-12 w-12 mx-auto mb-4 transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-600' : 'text-gray-300'
                            }`} />
                            <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>No supply records found</h3>
                            <p className="text-sm">Try adjusting your search or filter criteria</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredSupplyHistory.map((supply) => (
                      <tr key={supply._id} className={`transition-colors duration-300 ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'
                      }`}>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className={`text-sm font-semibold transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>{supply.reagent_name}</div>
                            <div className={`text-xs px-2 py-1 rounded inline-block transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-100'
                            }`}>Cat: {supply.catalog_number}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className={`text-sm font-medium flex items-center gap-2 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              {supply.vendor_name}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-400 bg-blue-900/30' : 'text-gray-500 bg-blue-50'
                            }`}>ID: {supply.vendor_id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className={`text-sm font-medium transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>PO: {supply.po_number}</div>
                            <div className={`text-xs transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>Ordered: {supply.order_date}</div>
                            <div className="text-xs text-green-600 font-medium">Received: {supply.receipt_date}</div>
                            <div className={`text-xs px-2 py-1 rounded font-medium transition-colors duration-300 ${
                              isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
                            }`}>
                              {supply.quantity_received} {supply.unit_of_measure}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className={`text-sm font-medium transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>Lot: {supply.lot_number}</div>
                            <div className="text-xs text-orange-600">Exp: {supply.expiration_date}</div>
                            <div className={`text-xs flex items-center gap-1 transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              <User className="h-3 w-3" />
                              {supply.received_by_doctor}
                            </div>
                            <div className={`text-xs text-blue-600 px-2 py-1 rounded transition-colors duration-300 ${
                              isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                            }`}>{supply.storage_location}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(supply.status)}
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(supply.status)}`}>
                              {getStatusLabel(supply.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleView(supply)}
                              className={`p-2 text-blue-600 hover:text-blue-800 rounded-lg transition-all duration-200 hover:scale-110 ${
                                isDarkMode ? 'hover:bg-blue-900/30' : 'hover:bg-blue-100'
                              }`}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(supply)}
                              className={`p-2 text-green-600 hover:text-green-800 rounded-lg transition-all duration-200 hover:scale-110 ${
                                isDarkMode ? 'hover:bg-green-900/30' : 'hover:bg-green-100'
                              }`}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(supply)}
                              className={`p-2 text-red-600 hover:text-red-800 rounded-lg transition-all duration-200 hover:scale-110 ${
                                isDarkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-100'
                              }`}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'usage' ? (
            /* Usage History Table */
            <>
              {/* Usage Stats Card - Show when filtering */}
              {(instrumentFilter || reagentNameFilter) && (() => {
                const stats = {
                  totalRecords: filteredUsageHistory.length,
                  totalQuantityUsed: filteredUsageHistory.reduce((sum, usage) => sum + (usage.quantity_used || 0), 0),
                  uniqueReagents: Array.from(new Set(filteredUsageHistory.map(u => u.reagent_name))),
                  uniqueUsers: Array.from(new Set(filteredUsageHistory.map(u => u.used_by))),
                  uniqueInstruments: Array.from(new Set(filteredUsageHistory.map(u => u.instrument_name).filter((name): name is string => Boolean(name))))
                };
                
                return (
                  <div className={`mb-6 rounded-xl shadow-lg border overflow-hidden transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-purple-700' 
                      : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
                  }`}>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl ${
                            isDarkMode ? 'bg-purple-800/50' : 'bg-purple-100'
                          }`}>
                            <BarChart3 className={`h-6 w-6 ${
                              isDarkMode ? 'text-purple-300' : 'text-purple-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className={`text-lg font-bold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              Filtered Usage Statistics
                            </h3>
                            <p className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {reagentNameFilter && `Reagent: ${reagentNameFilter}`}
                              {reagentNameFilter && instrumentFilter && ' • '}
                              {instrumentFilter && `Instrument: ${instrumentFilter}`}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className={`p-4 rounded-lg ${
                          isDarkMode ? 'bg-gray-800/50' : 'bg-white'
                        }`}>
                          <p className={`text-xs font-medium mb-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Total Records
                          </p>
                          <p className={`text-2xl font-bold ${
                            isDarkMode ? 'text-purple-300' : 'text-purple-600'
                          }`}>
                            {stats.totalRecords}
                          </p>
                        </div>
                        
                        <div className={`p-4 rounded-lg ${
                          isDarkMode ? 'bg-gray-800/50' : 'bg-white'
                        }`}>
                          <p className={`text-xs font-medium mb-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Total Quantity Used
                          </p>
                          <p className={`text-2xl font-bold ${
                            isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
                          }`}>
                            {stats.totalQuantityUsed.toFixed(2)}
                          </p>
                        </div>
                        
                        <div className={`p-4 rounded-lg ${
                          isDarkMode ? 'bg-gray-800/50' : 'bg-white'
                        }`}>
                          <p className={`text-xs font-medium mb-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Unique Reagents
                          </p>
                          <p className={`text-2xl font-bold ${
                            isDarkMode ? 'text-blue-300' : 'text-blue-600'
                          }`}>
                            {stats.uniqueReagents.length}
                          </p>
                        </div>
                        
                        <div className={`p-4 rounded-lg ${
                          isDarkMode ? 'bg-gray-800/50' : 'bg-white'
                        }`}>
                          <p className={`text-xs font-medium mb-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Unique Users
                          </p>
                          <p className={`text-2xl font-bold ${
                            isDarkMode ? 'text-green-300' : 'text-green-600'
                          }`}>
                            {stats.uniqueUsers.length}
                          </p>
                        </div>
                      </div>
                      
                      {stats.uniqueReagents.length > 0 && !reagentNameFilter && (
                        <div className="mt-4">
                          <p className={`text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Reagents Used:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {stats.uniqueReagents.map((reagent: string, idx: number) => (
                              <span 
                                key={idx}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  isDarkMode 
                                    ? 'bg-purple-800/50 text-purple-200' 
                                    : 'bg-purple-100 text-purple-700'
                                }`}
                              >
                                {reagent}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {stats.uniqueInstruments.length > 0 && !instrumentFilter && (
                        <div className="mt-4">
                          <p className={`text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Instruments Used:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {stats.uniqueInstruments.map((instrument: string, idx: number) => (
                              <span 
                                key={idx}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  isDarkMode 
                                    ? 'bg-indigo-800/50 text-indigo-200' 
                                    : 'bg-indigo-100 text-indigo-700'
                                }`}
                              >
                                {instrument}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              
              <div className={`overflow-hidden shadow-sm border rounded-xl transition-colors duration-300 ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y transition-colors duration-300 ${
                  isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  <thead className={`transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-purple-900/30 to-purple-800/30' 
                      : 'bg-gradient-to-r from-purple-50 to-purple-100'
                  }`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Beaker className="h-4 w-4" />
                          Reagent Information
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Usage Details
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          User Information
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Purpose & Test ID
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Status
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
                  }`}>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-sm">Loading usage records...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsageHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Activity className={`h-12 w-12 mx-auto mb-4 transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-600' : 'text-gray-300'
                            }`} />
                            <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>No usage records found</h3>
                            <p className="text-sm">Try adjusting your search or filter criteria</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsageHistory.map((usage) => (
                      <tr key={usage._id} className={`transition-colors duration-300 ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-purple-50'
                      }`}>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className={`text-sm font-semibold transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>{usage.reagent_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className={`text-sm font-medium text-red-600 px-2 py-1 rounded transition-colors duration-300 ${
                                isDarkMode ? 'bg-red-900/30' : 'bg-red-50'
                              }`}>
                                Used: {usage.quantity_used}
                              </div>
                            </div>
                            <div className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-50'
                            }`}>
                              <Clock className="h-3 w-3" />
                              {new Date(usage.used_at).toLocaleDateString()} at {new Date(usage.used_at).toLocaleTimeString()}
                            </div>
                            {usage.instrument_id && (
                              <div className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors duration-300 ${
                                isDarkMode ? 'text-purple-400 bg-purple-900/30' : 'text-purple-700 bg-purple-50'
                              }`}>
                                <Activity className="h-3 w-3" />
                                {usage.instrument_name || usage.instrument_id}
                              </div>
                            )}
                            {usage.procedure && (
                              <div className={`text-xs px-2 py-1 rounded transition-colors duration-300 ${
                                isDarkMode ? 'text-blue-400 bg-blue-900/30' : 'text-blue-700 bg-blue-50'
                              }`}>
                                Procedure: {usage.procedure}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                                isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
                              }`}>
                                <User className="h-4 w-4 text-purple-600" />
                              </div>
                            </div>
                            <div>
                              <div className={`text-sm font-medium transition-colors duration-300 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{usage.used_by}</div>
                              <div className={`text-xs transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>{usage.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-2">
                            <div className={`text-sm p-2 rounded border-l-4 border-blue-400 transition-colors duration-300 ${
                              isDarkMode ? 'text-white bg-blue-900/30' : 'text-gray-900 bg-blue-50'
                            }`}>
                              {usage.notes || 'No notes'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            {getStatusIcon('Used')}
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor('Used')}`}>
                              Used
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleView(usage)}
                              className={`p-2 text-blue-600 hover:text-blue-800 rounded-lg transition-all duration-200 hover:scale-110 ${
                                isDarkMode ? 'hover:bg-blue-900/30' : 'hover:bg-blue-100'
                              }`}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(usage)}
                              className={`p-2 text-green-600 hover:text-green-800 rounded-lg transition-all duration-200 hover:scale-110 ${
                                isDarkMode ? 'hover:bg-green-900/30' : 'hover:bg-green-100'
                              }`}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(usage)}
                              className={`p-2 text-red-600 hover:text-red-800 rounded-lg transition-all duration-200 hover:scale-110 ${
                                isDarkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-100'
                              }`}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            </>
          ) : activeTab === 'reagents' ? (
            /* Reagent Table */
            <div className={`overflow-hidden shadow-sm border rounded-xl transition-colors duration-300 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y transition-colors duration-300 ${
                  isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  <thead className={`transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-indigo-900/30 to-indigo-800/30' 
                      : 'bg-gradient-to-r from-indigo-50 to-indigo-100'
                  }`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Beaker className="h-4 w-4" />
                          Reagent Information
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Inventory Details
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Manufacturer
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Expiration Info
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Status
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
                  }`}>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-sm">Loading reagent data...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredReagentList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Beaker className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium mb-2">No reagent data found</p>
                            <p className="text-sm">
                              {searchTerm ? `No reagents match "${searchTerm}"` : 'No reagents have been added yet.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredReagentList.map((reagent) => (
                        <tr key={reagent._id} className={`transition-colors duration-300 ${
                          isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-indigo-50'
                        }`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className={`text-sm font-medium transition-colors duration-300 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {reagent.reagent_name}
                              </div>
                              {reagent.catalog_number && (
                                <div className={`text-sm transition-colors duration-300 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Cat#: {reagent.catalog_number}
                                </div>
                              )}
                              {reagent.cas_number && (
                                <div className={`text-xs transition-colors duration-300 ${
                                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                  CAS: {reagent.cas_number}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className={`text-sm font-medium transition-colors duration-300 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {reagent.quantity_available} {reagent.unit}
                              </div>
                              <div className={`text-xs transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Available
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-900'
                            }`}>
                              {reagent.manufacturer || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              {reagent.nearest_expiration_date ? (
                                <div className={`text-sm transition-colors duration-300 ${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                }`}>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(reagent.nearest_expiration_date).toLocaleDateString()}
                                  </div>
                                </div>
                              ) : (
                                <div className={`text-xs transition-colors duration-300 ${
                                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                }`}>No batches</div>
                              )}
                              {(reagent.batch_count ?? 0) > 0 && (
                                <div className={`text-xs px-2 py-1 rounded inline-block transition-colors duration-300 ${
                                  isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-600'
                                }`}>
                                  {reagent.batch_count} batch{reagent.batch_count !== 1 ? 'es' : ''}
                                </div>
                              )}
                              {(reagent.expiring_soon_count ?? 0) > 0 && (
                                <div className={`text-xs px-2 py-1 rounded inline-flex items-center gap-1 transition-colors duration-300 ${
                                  isDarkMode ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-50 text-orange-600'
                                }`}>
                                  <AlertTriangle className="h-3 w-3" />
                                  {reagent.expiring_soon_count} expiring ({reagent.expiring_soon_quantity} {reagent.unit})
                                </div>
                              )}
                              {(reagent.expired_count ?? 0) > 0 && (
                                <div className={`text-xs px-2 py-1 rounded inline-flex items-center gap-1 transition-colors duration-300 ${
                                  isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-600'
                                }`}>
                                  <XCircle className="h-3 w-3" />
                                  {reagent.expired_count} expired ({reagent.expired_quantity} {reagent.unit})
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors duration-300 ${
                              reagent.quantity_available > 10
                                ? isDarkMode 
                                  ? 'bg-green-900/50 text-green-300 border-green-700' 
                                  : 'bg-green-100 text-green-800 border-green-200'
                                : reagent.quantity_available > 0
                                  ? isDarkMode 
                                    ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700' 
                                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  : isDarkMode 
                                    ? 'bg-red-900/50 text-red-300 border-red-700' 
                                    : 'bg-red-100 text-red-800 border-red-200'
                            }`}>
                              {reagent.quantity_available > 10 ? 'In Stock' : reagent.quantity_available > 0 ? 'Low Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleView(reagent)}
                                className={`p-2 text-blue-600 hover:text-blue-800 rounded-lg transition-all duration-200 hover:scale-110 ${
                                  isDarkMode ? 'hover:bg-blue-900/30' : 'hover:bg-blue-100'
                                }`}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleEdit(reagent)}
                                className={`p-2 text-green-600 hover:text-green-800 rounded-lg transition-all duration-200 hover:scale-110 ${
                                  isDarkMode ? 'hover:bg-green-900/30' : 'hover:bg-green-100'
                                }`}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(reagent)}
                                className={`p-2 text-red-600 hover:text-red-800 rounded-lg transition-all duration-200 hover:scale-110 ${
                                  isDarkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-100'
                                }`}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Vendor Table */
            <div className={`overflow-hidden shadow-sm border rounded-xl transition-colors duration-300 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y transition-colors duration-300 ${
                  isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  <thead className={`transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-green-900/30 to-green-800/30' 
                      : 'bg-gradient-to-r from-green-50 to-green-100'
                  }`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Vendor Information
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Contact Details
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Registration Info
                        </div>
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
                  }`}>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <div className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-sm">Loading vendors...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredVendorList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <div className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Building2 className={`h-12 w-12 mx-auto mb-4 transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-600' : 'text-gray-300'
                            }`} />
                            <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>No vendors found</h3>
                            <p className="text-sm">Try adjusting your search criteria</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredVendorList.map((vendor) => (
                      <tr key={vendor._id} className={`transition-colors duration-300 ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-green-50'
                      }`}>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className={`text-sm font-semibold flex items-center gap-2 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              {vendor.vendor_name}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded inline-block font-mono transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-400 bg-green-900/30' : 'text-gray-500 bg-green-50'
                            }`}>
                              ID: {vendor.vendor_id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-2">
                            <div className={`text-sm flex items-center gap-2 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              <User className={`h-4 w-4 transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-400'
                              }`} />
                              {vendor.contact_info.email}
                            </div>
                            <div className={`text-xs text-blue-600 px-2 py-1 rounded transition-colors duration-300 ${
                              isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                            }`}>
                              📞 {vendor.contact_info.phone}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded flex items-start gap-1 transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-50'
                            }`}>
                              <span>📍</span>
                              <span>{vendor.contact_info.address}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className={`text-sm font-medium transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              Created: {new Date(vendor.created_at).toLocaleDateString()}
                            </div>
                            <div className={`text-xs text-green-600 px-2 py-1 rounded font-medium transition-colors duration-300 ${
                              isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                            }`}>
                              Active Vendor
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleView(vendor)}
                              className={`p-2 text-blue-600 hover:text-blue-800 rounded-lg transition-all duration-200 hover:scale-110 ${
                                isDarkMode ? 'hover:bg-blue-900/30' : 'hover:bg-blue-100'
                              }`}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(vendor)}
                              className={`p-2 text-green-600 hover:text-green-800 rounded-lg transition-all duration-200 hover:scale-110 ${
                                isDarkMode ? 'hover:bg-green-900/30' : 'hover:bg-green-100'
                              }`}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(vendor)}
                              className={`p-2 text-red-600 hover:text-red-800 rounded-lg transition-all duration-200 hover:scale-110 ${
                                isDarkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-100'
                              }`}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal for CRUD Operations */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
               style={{
                 backdropFilter: 'blur(10px)',
                 WebkitBackdropFilter: 'blur(10px)',
                 backgroundColor: 'rgba(255, 255, 255, 0.1)',
                 transition: 'all 300ms ease-out'
               }}
               onClick={(e) => {
                 if (e.target === e.currentTarget) {
                   setShowModal(false);
                   setFormErrors({}); // Clear errors when closing
                 }
               }}>
            <div className={`rounded-xl p-8 w-full max-w-4xl transform max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
                 style={{
                   animation: 'modalSlideIn 0.3s ease-out',
                   transformOrigin: 'center',
                   boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                   border: '1px solid rgba(255, 255, 255, 0.1)'
                 }}
                 onClick={(e) => e.stopPropagation()}>
              
              {/* Modal Header */}
              <div className={`flex items-center justify-between mb-6 pb-4 border-b transition-colors duration-300 ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-indigo-700 to-indigo-800' 
                      : 'bg-gradient-to-br from-indigo-100 to-indigo-200'
                  }`}>
                    {modalType === 'view' ? (
                      <Eye className="w-6 h-6 text-indigo-600" />
                    ) : modalType === 'edit' ? (
                      <Edit className="w-6 h-6 text-indigo-600" />
                    ) : modalType === 'add' ? (
                      <Plus className="w-6 h-6 text-indigo-600" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold capitalize transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {modalType} {activeTab === 'supply' ? 'Supply' : activeTab === 'usage' ? 'Usage' : activeTab === 'reagents' ? 'Reagent' : 'Vendor'} Record
                    </h3>
                    <p className={`text-sm mt-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {modalType === 'view' ? 'Detailed information about the record' :
                       modalType === 'edit' ? 'Modify the existing record' :
                       modalType === 'add' ? 'Create a new record' :
                       'Confirm deletion of this record'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormErrors({}); // Clear errors when closing modal
                  }}
                  className={`p-2 rounded-full transition-colors duration-200 hover:shadow-md ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className={`rounded-xl p-6 space-y-6 transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700' 
                  : ''
              }`}
                   style={{
                     background: isDarkMode 
                       ? 'linear-gradient(135deg, #374151 0%, #4b5563 100%)'
                       : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                   }}>
                {modalType === 'delete' ? (
                  <div className="text-center">
                    <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 transition-colors duration-300 ${
                      isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
                    }`}>
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Delete Record</h3>
                    <p className={`mb-8 text-lg transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Are you sure you want to delete this record? This action cannot be undone.
                    </p>
                  </div>
                ) : modalType === 'view' ? (
                  <div className="space-y-6">
                    {/* Batches section for reagents */}
                    {activeTab === 'reagents' && selectedReagentBatches.length > 0 && (
                      <div className={`rounded-lg p-4 shadow-sm border hover:shadow-md transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500' 
                          : 'bg-white border-gray-100'
                      }`}
                           style={{
                             backdropFilter: 'blur(10px)',
                             WebkitBackdropFilter: 'blur(10px)',
                             background: isDarkMode 
                               ? 'rgba(75, 85, 99, 0.95)' 
                               : 'rgba(255, 255, 255, 0.95)'
                           }}>
                        <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          <Package className="h-5 w-5" />
                          Batches & Expiration Dates ({selectedReagentBatches.length})
                        </h4>
                        <div className="space-y-3">
                          {selectedReagentBatches.map((batch, index) => {
                            const expirationDate = new Date(batch.expiration_date);
                            const today = new Date();
                            const daysUntilExpiry = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            const isExpired = daysUntilExpiry < 0;
                            const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
                            
                            return (
                              <div key={index} className={`p-4 rounded-lg border transition-all duration-300 ${
                                isExpired
                                  ? isDarkMode 
                                    ? 'bg-red-900/20 border-red-700' 
                                    : 'bg-red-50 border-red-200'
                                  : isExpiringSoon
                                    ? isDarkMode 
                                      ? 'bg-orange-900/20 border-orange-700' 
                                      : 'bg-orange-50 border-orange-200'
                                    : isDarkMode 
                                      ? 'bg-gray-700 border-gray-600' 
                                      : 'bg-gray-50 border-gray-200'
                              }`}>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 grid grid-cols-2 gap-3">
                                    <div>
                                      <label className={`text-xs font-medium transition-colors duration-300 ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                      }`}>Lot Number</label>
                                      <p className={`text-sm font-semibold transition-colors duration-300 ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                      }`}>{batch.lot_number}</p>
                                    </div>
                                    <div>
                                      <label className={`text-xs font-medium transition-colors duration-300 ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                      }`}>Quantity</label>
                                      <p className={`text-sm font-semibold transition-colors duration-300 ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                      }`}>{batch.quantity} {(selectedItem as Reagent)?.unit}</p>
                                    </div>
                                    <div>
                                      <label className={`text-xs font-medium transition-colors duration-300 ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                      }`}>Expiration Date</label>
                                      <p className={`text-sm font-semibold flex items-center gap-2 transition-colors duration-300 ${
                                        isExpired
                                          ? 'text-red-600'
                                          : isExpiringSoon
                                            ? 'text-orange-600'
                                            : isDarkMode ? 'text-white' : 'text-gray-900'
                                      }`}>
                                        <Calendar className="h-4 w-4" />
                                        {expirationDate.toLocaleDateString('en-GB', {
                                          year: 'numeric',
                                          month: '2-digit',
                                          day: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                    <div>
                                      <label className={`text-xs font-medium transition-colors duration-300 ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                      }`}>Received Date</label>
                                      <p className={`text-sm transition-colors duration-300 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                      }`}>
                                        {new Date(batch.received_date).toLocaleDateString('en-GB', {
                                          year: 'numeric',
                                          month: '2-digit',
                                          day: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                    {batch.storage_location && (
                                      <div className="col-span-2">
                                        <label className={`text-xs font-medium transition-colors duration-300 ${
                                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                        }`}>Storage Location</label>
                                        <p className={`text-sm transition-colors duration-300 ${
                                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>{batch.storage_location}</p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-3">
                                    {isExpired ? (
                                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                                        isDarkMode 
                                          ? 'bg-red-900/50 text-red-300' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        <XCircle className="h-3 w-3" />
                                        Expired
                                      </span>
                                    ) : isExpiringSoon ? (
                                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                                        isDarkMode 
                                          ? 'bg-orange-900/50 text-orange-300' 
                                          : 'bg-orange-100 text-orange-800'
                                      }`}>
                                        <AlertTriangle className="h-3 w-3" />
                                        {daysUntilExpiry}d left
                                      </span>
                                    ) : (
                                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                                        isDarkMode 
                                          ? 'bg-green-900/50 text-green-300' 
                                          : 'bg-green-100 text-green-800'
                                      }`}>
                                        <CheckCircle className="h-3 w-3" />
                                        Good
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className={`rounded-lg p-4 shadow-sm border hover:shadow-md transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500' 
                        : 'bg-white border-gray-100'
                    }`}
                         style={{
                           backdropFilter: 'blur(10px)',
                           WebkitBackdropFilter: 'blur(10px)',
                           background: isDarkMode 
                             ? 'rgba(75, 85, 99, 0.95)' 
                             : 'rgba(255, 255, 255, 0.95)'
                         }}>
                      <h4 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Record Details</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {selectedItem && Object.entries(selectedItem)
                          .filter(([key, value]) => {
                            // Hide _id and _raw fields
                            if (key.includes('_id') || key.includes('_raw')) return false;
                            
                            // Hide fields with 0 value (for count/quantity fields)
                            const countFields = ['_count', '_quantity', 'batch_count', 'expiring_soon_count', 'expired_count', 'expiring_soon_quantity', 'expired_quantity'];
                            if (countFields.some(field => key.includes(field)) && (value === 0 || value === '0')) {
                              return false;
                            }
                            
                            return true;
                          })
                          .map(([key, value]) => {
                            // Format date fields
                            let displayValue = value?.toString() || 'N/A';
                            const dateFields = ['date', 'Date', 'createdAt', 'updatedAt', 'created_at', 'updated_at'];
                            const isDateField = dateFields.some(field => key.includes(field));
                            
                            if (isDateField && value) {
                              try {
                                const date = new Date(value as string);
                                if (!isNaN(date.getTime())) {
                                  displayValue = date.toLocaleDateString('en-GB', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit'
                                  });
                                }
                              } catch (e) {
                                // Keep original value if parsing fails
                              }
                            }
                            
                            return (
                              <div key={key} className={`p-4 rounded-lg border transition-colors duration-300 ${
                                isDarkMode 
                                  ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-500' 
                                  : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
                              }`}>
                                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>{key.replace(/([A-Z_])/g, ' $1').trim()}</label>
                                <div className={`text-sm font-medium transition-colors duration-300 ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{displayValue}</div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className={`rounded-lg p-6 shadow-sm border hover:shadow-md transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500' 
                        : 'bg-white border-gray-100'
                    }`}
                         style={{
                           backdropFilter: 'blur(10px)',
                           WebkitBackdropFilter: 'blur(10px)',
                           background: isDarkMode 
                             ? 'rgba(75, 85, 99, 0.95)' 
                             : 'rgba(255, 255, 255, 0.95)'
                         }}>
                      <h4 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-green-900'
                      }`}>
                        {modalType === 'add' ? 'Add New Record' : 'Edit Record'}
                      </h4>
                      <p className={`mb-6 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-green-700'
                      }`}>
                        {modalType === 'add' ? 'Create a new' : 'Modify the existing'} {activeTab} record.
                      </p>
                      
                      {/* Error Summary Box */}
                      {Object.keys(formErrors).length > 0 && (
                        <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                          isDarkMode 
                            ? 'bg-red-900/20 border-red-500 text-red-300'
                            : 'bg-red-50 border-red-500 text-red-700'
                        }`}>
                          <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                              <h5 className="font-semibold mb-2">Please fix the following errors:</h5>
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                {Object.entries(formErrors).map(([field, error]) => (
                                  <li key={field}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Form Fields */}
                      <form className="space-y-4">
                        {activeTab === 'supply' ? (
                          // Supply Form Fields
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 transition-colors duration-300">
                                Reagent Name <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={editFormData.reagent_name || ''}
                                onChange={(e) => {
                                  const selectedReagent = reagentList.find(r => r.reagent_name === e.target.value);
                                  setEditFormData({
                                    ...editFormData, 
                                    reagent_name: e.target.value,
                                    catalog_number: selectedReagent?.catalog_number || '',
                                    unit_of_measure: selectedReagent?.unit || ''
                                  });
                                  // Clear error when user types
                                  if (formErrors.reagent_name) {
                                    setFormErrors({...formErrors, reagent_name: ''});
                                  }
                                }}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.reagent_name 
                                    ? 'border-red-500' 
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white' 
                                      : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                required
                              >
                                <option value="">Select reagent</option>
                                {reagentList.map((reagent) => (
                                  <option key={reagent._id} value={reagent.reagent_name}>
                                    {reagent.reagent_name} ({reagent.catalog_number})
                                  </option>
                                ))}
                              </select>
                              <FieldError error={formErrors.reagent_name} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 transition-colors duration-300">
                                Catalog Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={editFormData.catalog_number || ''}
                                onChange={(e) => setEditFormData({...editFormData, catalog_number: e.target.value})}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  isDarkMode 
                                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter catalog number"
                                readOnly
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 transition-colors duration-300">
                                PO Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={editFormData.po_number || ''}
                                onChange={(e) => updateFormField('po_number', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.po_number
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter PO number"
                                required
                              />
                              <FieldError error={formErrors.po_number} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 transition-colors duration-300">
                                Order Date <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                value={editFormData.order_date || ''}
                                onChange={(e) => updateFormField('order_date', e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                min={(() => {
                                  const tenYearsAgo = new Date();
                                  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
                                  return tenYearsAgo.toISOString().split('T')[0];
                                })()}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.order_date
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white' 
                                      : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                required
                              />
                              <FieldError error={formErrors.order_date} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 transition-colors duration-300">
                                Receipt Date <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                value={editFormData.receipt_date || ''}
                                onChange={(e) => updateFormField('receipt_date', e.target.value)}
                                min={modalType === 'add' ? new Date().toISOString().split('T')[0] : editFormData.order_date || new Date().toISOString().split('T')[0]}
                                max={(() => {
                                  const oneYearFromNow = new Date();
                                  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                                  return oneYearFromNow.toISOString().split('T')[0];
                                })()}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.receipt_date
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white' 
                                      : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                required
                              />
                              <FieldError error={formErrors.receipt_date} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 transition-colors duration-300">
                                Vendor Name <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={editFormData.vendor_name || ''}
                                onChange={(e) => {
                                  const selectedVendor = vendorList.find(v => v.vendor_name === e.target.value);
                                  setEditFormData({
                                    ...editFormData, 
                                    vendor_name: e.target.value,
                                    vendor_id: selectedVendor?.vendor_id || ''
                                  });
                                  // Clear errors when selecting
                                  if (formErrors.vendor_name) {
                                    const newErrors = { ...formErrors };
                                    delete newErrors.vendor_name;
                                    delete newErrors.vendor_id;
                                    setFormErrors(newErrors);
                                  }
                                }}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.vendor_name
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white' 
                                      : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                required
                              >
                                <option value="">Select vendor</option>
                                {vendorList && vendorList.length > 0 ? (
                                  vendorList.map((vendor) => (
                                    <option key={vendor._id} value={vendor.vendor_name}>
                                      {vendor.vendor_name}
                                    </option>
                                  ))
                                ) : (
                                  <option value="" disabled>Loading vendors...</option>
                                )}
                              </select>
                              <FieldError error={formErrors.vendor_name} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 transition-colors duration-300">
                                Lot Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={editFormData.lot_number || ''}
                                onChange={(e) => updateFormField('lot_number', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.lot_number
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter lot number"
                                required
                              />
                              <FieldError error={formErrors.lot_number} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 transition-colors duration-300">
                                Quantity Received <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editFormData.quantity_received ?? ''}
                                onChange={(e) => {
                                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                  updateFormField('quantity_received', isNaN(value) ? 0 : value);
                                }}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.quantity_received
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter quantity"
                                required
                              />
                              <FieldError error={formErrors.quantity_received} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 transition-colors duration-300">
                                Unit of Measure <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={editFormData.unit_of_measure || ''}
                                onChange={(e) => setEditFormData({...editFormData, unit_of_measure: e.target.value})}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  isDarkMode 
                                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter unit"
                                readOnly
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 transition-colors duration-300">
                                Expiration Date <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                value={editFormData.expiration_date || ''}
                                onChange={(e) => updateFormField('expiration_date', e.target.value)}
                                min={modalType === 'add' 
                                  ? (() => {
                                      const tomorrow = new Date();
                                      tomorrow.setDate(tomorrow.getDate() + 1);
                                      return tomorrow.toISOString().split('T')[0];
                                    })()
                                  : editFormData.receipt_date 
                                    ? (() => {
                                        const receiptDate = new Date(editFormData.receipt_date);
                                        receiptDate.setDate(receiptDate.getDate() + 1);
                                        return receiptDate.toISOString().split('T')[0];
                                      })()
                                    : new Date().toISOString().split('T')[0]
                                }
                                max={(() => {
                                  const twentyYearsFromNow = new Date();
                                  twentyYearsFromNow.setFullYear(twentyYearsFromNow.getFullYear() + 20);
                                  return twentyYearsFromNow.toISOString().split('T')[0];
                                })()}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.expiration_date
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white'
                                      : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                required
                              />
                              <FieldError error={formErrors.expiration_date} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 transition-colors duration-300">
                                Storage Location <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={editFormData.storage_location || ''}
                                onChange={(e) => updateFormField('storage_location', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.storage_location
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter storage location"
                                required
                              />
                              <FieldError error={formErrors.storage_location} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 transition-colors duration-300">
                                Status
                              </label>
                              <select
                                value={editFormData.status || 'received'}
                                onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  isDarkMode 
                                    ? 'border-gray-600 bg-gray-700 text-white' 
                                    : 'border-gray-300 bg-white text-gray-900'
                                }`}
                              >
                                <option value="received">Received</option>
                                <option value="partial_shipment">Partial Shipment</option>
                                <option value="returned">Returned</option>
                              </select>
                              <p className={`mt-1.5 text-xs transition-colors duration-300 flex items-start gap-1.5 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {editFormData.status === 'received' && (
                                  <>
                                    <span className="text-green-500 font-bold">+</span>
                                    <span>This will ADD quantity to reagent inventory by creating a new batch</span>
                                  </>
                                )}
                                {editFormData.status === 'partial_shipment' && (
                                  <>
                                    <span className="text-yellow-500 font-bold">•</span>
                                    <span>Partial shipment will NOT affect inventory until status changes to "Received"</span>
                                  </>
                                )}
                                {editFormData.status === 'returned' && (
                                  <>
                                    <span className="text-red-500 font-bold">-</span>
                                    <span>Returned items will DEDUCT quantity from inventory by reducing the matching batch</span>
                                  </>
                                )}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 transition-colors duration-300">
                                Received By
                              </label>
                              <input
                                type="text"
                                value={editFormData.received_by_doctor || ''}
                                onChange={(e) => setEditFormData({...editFormData, received_by_doctor: e.target.value})}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  isDarkMode 
                                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter receiver name"
                              />
                            </div>
                          </div>
                        ) : activeTab === 'usage' ? (
                          // Usage Form Fields
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Reagent Name <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={editFormData.reagent_name || ''}
                                onChange={(e) => {
                                  const selectedReagent = reagentList.find(r => r.reagent_name === e.target.value);
                                  updateFormField('reagent_name', e.target.value);
                                  if (selectedReagent) {
                                    // Check if reagent is out of stock
                                    if (selectedReagent.quantity_available <= 0) {
                                      toast.error(`${selectedReagent.reagent_name} is out of stock!`);
                                    } else if (selectedReagent.quantity_available <= 10) {
                                      toast.warning(`${selectedReagent.reagent_name} is running low. Only ${selectedReagent.quantity_available} ${selectedReagent.unit} available.`);
                                    }
                                    
                                    setEditFormData({
                                      ...editFormData,
                                      reagent_name: selectedReagent.reagent_name,
                                      unit: selectedReagent.unit
                                    });
                                  }
                                }}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.reagent_name
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white' 
                                      : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                required
                              >
                                <option value="">Select reagent</option>
                                {reagentList.map((reagent) => (
                                  <option key={reagent._id} value={reagent.reagent_name}>
                                    {reagent.reagent_name} - Available: {reagent.quantity_available} {reagent.unit}
                                  </option>
                                ))}
                              </select>
                              <FieldError error={formErrors.reagent_name} />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Instrument <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={editFormData.instrument_id || ''}
                                onChange={(e) => {
                                  const selectedInstrument = instrumentList.find(i => i.instrument_id === e.target.value);
                                  updateFormField('instrument_id', e.target.value);
                                  if (selectedInstrument) {
                                    // Check instrument status
                                    if (selectedInstrument.status === 'Maintenance') {
                                      toast.error(`❌ ${selectedInstrument.name} (${selectedInstrument.instrument_id}) is under maintenance!`, 5000);
                                    } else if (selectedInstrument.status === 'Out of Service') {
                                      toast.error(`❌ ${selectedInstrument.name} (${selectedInstrument.instrument_id}) is out of service!`, 5000);
                                    } else if (selectedInstrument.status === 'In Use') {
                                      toast.warning(`⚠️ ${selectedInstrument.name} (${selectedInstrument.instrument_id}) is currently in use!`, 5000);
                                    }
                                    
                                    setEditFormData({
                                      ...editFormData,
                                      instrument_id: selectedInstrument.instrument_id,
                                      instrument_name: selectedInstrument.name
                                    });
                                  }
                                }}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.instrument_id
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white' 
                                      : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                required
                              >
                                <option value="">
                                  {instrumentList.length === 0 ? 'No instruments available' : 'Select instrument'}
                                </option>
                                {instrumentList.map((instrument) => (
                                  <option key={instrument._id || instrument.instrument_id} value={instrument.instrument_id}>
                                    {instrument.name} ({instrument.instrument_id}) - {instrument.status}
                                  </option>
                                ))}
                              </select>
                              <FieldError error={formErrors.instrument_id} />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Quantity Used <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={editFormData.quantity_used ?? ''}
                                onChange={(e) => updateFormField('quantity_used', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.quantity_used
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter quantity used"
                                required
                              />
                              <FieldError error={formErrors.quantity_used} />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Unit <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={editFormData.unit || ''}
                                onChange={(e) => updateFormField('unit', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.unit
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter unit (e.g., mL, μL, g)"
                                required
                                readOnly={editFormData.reagent_name}
                              />
                              <FieldError error={formErrors.unit} />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Usage Date <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                value={editFormData.used_at || ''}
                                onChange={(e) => updateFormField('used_at', e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                min={(() => {
                                  const fiveYearsAgo = new Date();
                                  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
                                  return fiveYearsAgo.toISOString().split('T')[0];
                                })()}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.used_at
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white'
                                      : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                required
                              />
                              <FieldError error={formErrors.used_at} />
                            </div>
                            <div className="md:col-span-2">
                              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Notes
                              </label>
                              <textarea
                                value={editFormData.notes || ''}
                                onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                                rows={3}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  isDarkMode 
                                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter notes about this usage (optional)"
                              />
                            </div>
                          </div>
                        ) : activeTab === 'reagents' ? (
                          // Reagent Form Fields
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Reagent Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={editFormData.reagent_name || ''}
                                onChange={(e) => updateFormField('reagent_name', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.reagent_name
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter reagent name"
                                required
                              />
                              <FieldError error={formErrors.reagent_name} />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Catalog Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={editFormData.catalog_number || ''}
                                onChange={(e) => updateFormField('catalog_number', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.catalog_number
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter catalog number"
                                required
                              />
                              <FieldError error={formErrors.catalog_number} />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Manufacturer <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={editFormData.manufacturer || ''}
                                onChange={(e) => updateFormField('manufacturer', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.manufacturer
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white' 
                                      : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                required
                              >
                                <option value="">Select manufacturer</option>
                                <option value="Thermo Fisher Scientific">Thermo Fisher Scientific</option>
                                <option value="Sigma-Aldrich">Sigma-Aldrich</option>
                                <option value="Bio-Rad">Bio-Rad</option>
                                <option value="Merck">Merck</option>
                                <option value="Invitrogen">Invitrogen</option>
                                <option value="Qiagen">Qiagen</option>
                                <option value="Roche">Roche</option>
                                <option value="Abbott">Abbott</option>
                                <option value="Beckman Coulter">Beckman Coulter</option>
                                {editFormData.manufacturer && !['Thermo Fisher Scientific', 'Sigma-Aldrich', 'Bio-Rad', 'Merck', 'Invitrogen', 'Qiagen', 'Roche', 'Abbott', 'Beckman Coulter'].includes(editFormData.manufacturer) && (
                                  <option value={editFormData.manufacturer}>{editFormData.manufacturer}</option>
                                )}
                                <option value="Other">Other</option>
                              </select>
                              <FieldError error={formErrors.manufacturer} />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                CAS Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={editFormData.cas_number || ''}
                                onChange={(e) => updateFormField('cas_number', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.cas_number
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter CAS number"
                                required
                              />
                              <FieldError error={formErrors.cas_number} />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Quantity Available <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editFormData.quantity_available ?? ''}
                                onChange={(e) => {
                                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                  updateFormField('quantity_available', isNaN(value) ? 0 : value);
                                }}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.quantity_available
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter quantity"
                                required
                              />
                              <FieldError error={formErrors.quantity_available} />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Unit <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={editFormData.unit || 'mL'}
                                onChange={(e) => updateFormField('unit', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.unit
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white' 
                                      : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                required
                              >
                                <option value="">Select unit</option>
                                <option value="mL">mL</option>
                                <option value="L">L</option>
                                <option value="g">g</option>
                                <option value="kg">kg</option>
                                <option value="mg">mg</option>
                                <option value="μg">μg</option>
                                <option value="units">units</option>
                                <option value="pieces">pieces</option>
                              </select>
                              <FieldError error={formErrors.unit} />
                            </div>
                            {modalType === 'edit' && editFormData.nearest_expiration_date && (
                              <div>
                                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  Nearest Expiration Date
                                </label>
                                <input
                                  type="text"
                                  value={editFormData.nearest_expiration_date ? new Date(editFormData.nearest_expiration_date).toLocaleDateString('en-GB', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit'
                                  }) : 'N/A'}
                                  className={`w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed transition-colors duration-300 ${
                                    isDarkMode 
                                      ? 'border-gray-600 bg-gray-600 text-gray-400' 
                                      : 'border-gray-300 bg-gray-100 text-gray-500'
                                  }`}
                                  readOnly
                                  disabled
                                />
                                <p className={`mt-1 text-xs transition-colors duration-300 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  This is calculated automatically from batches
                                </p>
                              </div>
                            )}
                            {modalType === 'edit' && (editFormData.batch_count ?? 0) > 0 && (
                              <div>
                                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  Total Batches
                                </label>
                                <input
                                  type="text"
                                  value={`${editFormData.batch_count || 0} batch${editFormData.batch_count !== 1 ? 'es' : ''}`}
                                  className={`w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed transition-colors duration-300 ${
                                    isDarkMode 
                                      ? 'border-gray-600 bg-gray-600 text-gray-400' 
                                      : 'border-gray-300 bg-gray-100 text-gray-500'
                                  }`}
                                  readOnly
                                  disabled
                                />
                                <p className={`mt-1 text-xs transition-colors duration-300 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Batches are managed through supply records
                                </p>
                              </div>
                            )}
                            <div className="md:col-span-2">
                              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Description
                              </label>
                              <textarea
                                value={editFormData.description || ''}
                                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                                rows={3}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  isDarkMode 
                                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter description or notes about the reagent"
                              />
                            </div>
                            
                            {/* Batches list in edit mode */}
                            {modalType === 'edit' && selectedReagentBatches.length > 0 && (
                              <div className="md:col-span-2">
                                <label className={`block text-sm font-medium mb-3 transition-colors duration-300 ${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Batches ({selectedReagentBatches.length})
                                  </div>
                                </label>
                                <div className={`border rounded-lg p-4 max-h-96 overflow-y-auto transition-colors duration-300 ${
                                  isDarkMode 
                                    ? 'border-gray-600 bg-gray-700/50' 
                                    : 'border-gray-300 bg-gray-50'
                                }`}>
                                  <p className={`text-xs mb-3 transition-colors duration-300 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    Note: Batches are managed through Supply Records. To edit batch details, please update the corresponding supply record.
                                  </p>
                                  <div className="space-y-2">
                                    {selectedReagentBatches.map((batch, index) => {
                                      const expirationDate = new Date(batch.expiration_date);
                                      const today = new Date();
                                      const daysUntilExpiry = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                      const isExpired = daysUntilExpiry < 0;
                                      const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
                                      
                                      return (
                                        <div key={index} className={`p-3 rounded-lg border transition-all duration-300 ${
                                          isExpired
                                            ? isDarkMode 
                                              ? 'bg-red-900/10 border-red-700/50' 
                                              : 'bg-red-50 border-red-200'
                                            : isExpiringSoon
                                              ? isDarkMode 
                                                ? 'bg-orange-900/10 border-orange-700/50' 
                                                : 'bg-orange-50 border-orange-200'
                                              : isDarkMode 
                                                ? 'bg-gray-800 border-gray-600' 
                                                : 'bg-white border-gray-200'
                                        }`}>
                                          <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                                              <div>
                                                <span className={`text-xs font-medium transition-colors duration-300 ${
                                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                }`}>Lot: </span>
                                                <span className={`font-semibold transition-colors duration-300 ${
                                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                                }`}>{batch.lot_number}</span>
                                              </div>
                                              <div>
                                                <span className={`text-xs font-medium transition-colors duration-300 ${
                                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                }`}>Qty: </span>
                                                <span className={`font-semibold transition-colors duration-300 ${
                                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                                }`}>{batch.quantity} {editFormData.unit}</span>
                                              </div>
                                              <div className="col-span-2">
                                                <span className={`text-xs font-medium transition-colors duration-300 ${
                                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                }`}>Expires: </span>
                                                <span className={`font-semibold transition-colors duration-300 ${
                                                  isExpired
                                                    ? 'text-red-600'
                                                    : isExpiringSoon
                                                      ? 'text-orange-600'
                                                      : isDarkMode ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                  {expirationDate.toLocaleDateString('en-GB', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                  })}
                                                </span>
                                              </div>
                                            </div>
                                            <div>
                                              {isExpired ? (
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors duration-300 ${
                                                  isDarkMode 
                                                    ? 'bg-red-900/30 text-red-300' 
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                  <XCircle className="h-3 w-3" />
                                                  Expired
                                                </span>
                                              ) : isExpiringSoon ? (
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors duration-300 ${
                                                  isDarkMode 
                                                    ? 'bg-orange-900/30 text-orange-300' 
                                                    : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                  <AlertTriangle className="h-3 w-3" />
                                                  {daysUntilExpiry}d
                                                </span>
                                              ) : (
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors duration-300 ${
                                                  isDarkMode 
                                                    ? 'bg-green-900/30 text-green-300' 
                                                    : 'bg-green-100 text-green-800'
                                                }`}>
                                                  <CheckCircle className="h-3 w-3" />
                                                  Good
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          // Vendor Form Fields
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 transition-colors duration-300">
                                Vendor ID <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={editFormData.vendor_id || ''}
                                onChange={(e) => updateFormField('vendor_id', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.vendor_id
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter vendor ID"
                                required
                              />
                              <FieldError error={formErrors.vendor_id} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 transition-colors duration-300">
                                Vendor Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={editFormData.vendor_name || ''}
                                onChange={(e) => updateFormField('vendor_name', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.vendor_name
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter vendor name"
                                required
                              />
                              <FieldError error={formErrors.vendor_name} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 transition-colors duration-300">
                                Email <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="email"
                                value={editFormData.contact_info?.email || ''}
                                onChange={(e) => {
                                  setEditFormData({
                                    ...editFormData, 
                                    contact_info: {
                                      ...editFormData.contact_info,
                                      email: e.target.value
                                    }
                                  });
                                  if (formErrors.email) {
                                    const newErrors = { ...formErrors };
                                    delete newErrors.email;
                                    setFormErrors(newErrors);
                                  }
                                }}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.email
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter email address"
                                required
                              />
                              <FieldError error={formErrors.email} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 transition-colors duration-300">
                                Phone <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={editFormData.contact_info?.phone || ''}
                                onChange={(e) => {
                                  setEditFormData({
                                    ...editFormData, 
                                    contact_info: {
                                      ...editFormData.contact_info,
                                      phone: e.target.value
                                    }
                                  });
                                  if (formErrors.phone) {
                                    const newErrors = { ...formErrors };
                                    delete newErrors.phone;
                                    setFormErrors(newErrors);
                                  }
                                }}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.phone
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter phone number"
                                required
                              />
                              <FieldError error={formErrors.phone} />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium mb-2 transition-colors duration-300">
                                Address <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                value={editFormData.contact_info?.address || ''}
                                onChange={(e) => {
                                  setEditFormData({
                                    ...editFormData, 
                                    contact_info: {
                                      ...editFormData.contact_info,
                                      address: e.target.value
                                    }
                                  });
                                  if (formErrors.address) {
                                    const newErrors = { ...formErrors };
                                    delete newErrors.address;
                                    setFormErrors(newErrors);
                                  }
                                }}
                                rows={3}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                                  formErrors.address
                                    ? 'border-red-500'
                                    : isDarkMode 
                                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                }`}
                                placeholder="Enter vendor address"
                                required
                              />
                              <FieldError error={formErrors.address} />
                            </div>
                          </div>
                        )}
                      </form>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className={`flex space-x-4 pt-6 mt-6 border-t transition-colors duration-300 ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
                   style={{
                     background: isDarkMode 
                       ? 'rgba(55, 65, 81, 0.8)' 
                       : 'rgba(249, 250, 251, 0.8)',
                     backdropFilter: 'blur(8px)',
                     WebkitBackdropFilter: 'blur(8px)'
                   }}>
                {modalType === 'delete' ? (
                  <>
                    <button
                      onClick={() => setShowModal(false)}
                      className={`flex-1 border-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md ${
                        isDarkMode 
                          ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white hover:bg-gray-700' 
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      {loading ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                ) : modalType === 'view' ? (
                  <button
                    onClick={() => setShowModal(false)}
                    className={`flex-1 border-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md ${
                      isDarkMode 
                        ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white hover:bg-gray-700' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Close
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setFormErrors({}); // Clear errors when closing
                      }}
                      className={`flex-1 border-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md ${
                        isDarkMode 
                          ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white hover:bg-gray-700' 
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {loading ? 'Saving...' : modalType === 'add' ? 'Save' : 'Update'}
                    </button>
                  </>
                )}
              </div>
              
              {/* Helper text for required fields */}
              {(modalType === 'add' || modalType === 'edit') && (
                <div className={`mt-4 flex items-center gap-2 text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <AlertCircle className="h-4 w-4" />
                  <span>Fields marked with <span className="text-red-500">*</span> are required</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReagentHistory;
