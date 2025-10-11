import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";
import { Search, Plus, Users, UserCheck, UserX, Clock, Edit, Shield, Lock, Unlock } from "lucide-react";

// Doctor interface - chỉ cho bác sĩ xét nghiệm máu
interface Doctor {
  _id: string;
  userid: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  identifyNumber?: string;
  age?: number;
  address?: string;
  dateOfBirth?: string;
  role: string;
  isActive: boolean;
  specialization: "Blood Test Specialist"; // Chỉ có chuyên khoa xét nghiệm máu
  experience?: number;
  licenseNumber?: string;
  department: "Blood Test Department"; // Chỉ có khoa xét nghiệm máu
  createdAt?: string;
  updatedAt?: string;
}

// Statistics interface
interface DoctorStats {
  total: number;
  active: number;
  inactive: number;
  averageExperience: number;
}

const Doctors = () => {
  // State management
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [doctorToToggle, setDoctorToToggle] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states for Add/Edit functionality
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorForm, setDoctorForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    experience: "",
    licenseNumber: "",
    address: "",
    dateOfBirth: "",
  });
  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    fetchDoctors();
  }, []);


  const showToast = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  // Hardcoded doctors data - chỉ bác sĩ xét nghiệm máu
  const hardcodedDoctors: Doctor[] = [
    {
      _id: "1",
      userid: "DOC001",
      username: "dr_nguyen",
      email: "dr.nguyen@lab.com",
      fullName: "Dr. Nguyen Van A",
      phoneNumber: "0987654321",
      role: "doctor",
      isActive: true,
      specialization: "Blood Test Specialist",
      experience: 15,
      licenseNumber: "DOC123456",
      department: "Blood Test Department",
      address: "123 Le Loi Street, Ho Chi Minh City",
      age: 45,
      dateOfBirth: "1979-05-15",
      identifyNumber: "123456789",
      createdAt: "2024-02-20",
    },
    {
      _id: "2", 
      userid: "DOC002",
      username: "dr_tran",
      email: "dr.tran@lab.com",
      fullName: "Dr. Tran Thi B",
      phoneNumber: "0123456789",
      role: "doctor",
      isActive: true,
      specialization: "Blood Test Specialist",
      experience: 12,
      licenseNumber: "DOC234567",
      department: "Blood Test Department",
      address: "456 Nguyen Hue Street, Ho Chi Minh City",
      age: 38,
      dateOfBirth: "1986-03-22",
      identifyNumber: "987654321",
      createdAt: "2024-01-15",
    },
    {
      _id: "3",
      userid: "DOC003", 
      username: "dr_le",
      email: "dr.le@lab.com",
      fullName: "Dr. Le Van C",
      phoneNumber: "0555666777",
      role: "doctor",
      isActive: false,
      specialization: "Blood Test Specialist",
      experience: 8,
      licenseNumber: "DOC345678",
      department: "Blood Test Department",
      address: "789 Pasteur Street, Ho Chi Minh City",
      age: 35,
      dateOfBirth: "1989-08-10",
      identifyNumber: "456789123",
      createdAt: "2024-03-10",
    },
    {
      _id: "4",
      userid: "DOC004",
      username: "dr_pham",
      email: "dr.pham@lab.com", 
      fullName: "Dr. Pham Thi D",
      phoneNumber: "0333444555",
      role: "doctor",
      isActive: true,
      specialization: "Blood Test Specialist",
      experience: 10,
      licenseNumber: "DOC456789",
      department: "Blood Test Department",
      address: "321 Dong Khoi Street, Ho Chi Minh City",
      age: 42,
      dateOfBirth: "1982-12-05",
      identifyNumber: "789123456",
      createdAt: "2024-02-28",
    },
    {
      _id: "5",
      userid: "DOC005",
      username: "dr_hoang",
      email: "dr.hoang@lab.com",
      fullName: "Dr. Hoang Van E", 
      phoneNumber: "0777888999",
      role: "doctor",
      isActive: true,
      specialization: "Blood Test Specialist",
      experience: 6,
      licenseNumber: "DOC567890",
      department: "Blood Test Department",
      address: "654 Le Van Viet Street, Ho Chi Minh City",
      age: 33,
      dateOfBirth: "1991-07-18",
      identifyNumber: "321654987",
      createdAt: "2024-04-05",
    }
  ];

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDoctors(hardcodedDoctors);
    } catch (err) {
      setError("Failed to fetch doctors");
      showToast("Failed to load doctors", "error");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats: DoctorStats = useMemo(() => {
    const total = doctors.length;
    const active = doctors.filter(d => d.isActive).length;
    const inactive = total - active;
    const averageExperience = doctors.length > 0 
      ? Math.round(doctors.reduce((sum, d) => sum + (d.experience || 0), 0) / doctors.length)
      : 0;
    
    return { total, active, inactive, averageExperience };
  }, [doctors]);


  const handleToggleStatus = (doctor: Doctor) => {
    setDoctors(doctors.map(d => 
      d._id === doctor._id 
        ? { ...d, isActive: !d.isActive }
        : d
    ));
    setShowDeleteConfirm(false);
    setDoctorToToggle(null);
    showToast(`Doctor ${!doctor.isActive ? 'activated' : 'deactivated'} successfully!`, "success");
  };

  // Form validation
  const validateForm = () => {
    const errors: any = {};
    
    if (!doctorForm.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    
    if (!doctorForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(doctorForm.email)) {
      errors.email = "Invalid email format";
    }
    
    if (!doctorForm.licenseNumber.trim()) {
      errors.licenseNumber = "License number is required";
    }
    
    if (!doctorForm.experience || parseInt(doctorForm.experience) < 0) {
      errors.experience = "Experience must be a positive number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add new doctor
  const handleAddDoctor = () => {
    setEditingDoctor(null);
    setDoctorForm({
      fullName: "",
      email: "",
      phoneNumber: "",
      experience: "",
      licenseNumber: "",
      address: "",
      dateOfBirth: "",
    });
    setFormErrors({});
    setShowDoctorModal(true);
  };

  // Edit existing doctor
  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setDoctorForm({
      fullName: doctor.fullName,
      email: doctor.email,
      phoneNumber: doctor.phoneNumber || "",
      experience: doctor.experience?.toString() || "",
      licenseNumber: doctor.licenseNumber || "",
      address: doctor.address || "",
      dateOfBirth: doctor.dateOfBirth || "",
    });
    setFormErrors({});
    setShowDoctorModal(true);
  };

  // Save doctor (Add or Update)
  const handleSaveDoctor = async () => {
    if (!validateForm()) {
      showToast("Please fill in all required fields correctly", "error");
      return;
    }

    try {
      setLoading(true);

      if (editingDoctor) {
        // Update existing doctor
        const updatedDoctors = doctors.map(doctor => 
          doctor._id === editingDoctor._id 
            ? {
                ...doctor,
                fullName: doctorForm.fullName,
                email: doctorForm.email,
                phoneNumber: doctorForm.phoneNumber || undefined,
                experience: parseInt(doctorForm.experience),
                licenseNumber: doctorForm.licenseNumber,
                address: doctorForm.address || undefined,
                dateOfBirth: doctorForm.dateOfBirth || undefined,
                updatedAt: new Date().toISOString()
              }
            : doctor
        );
        setDoctors(updatedDoctors);
        showToast("Doctor updated successfully!", "success");
      } else {
        // Create new doctor
        const newDoctor: Doctor = {
          _id: Date.now().toString(),
          userid: `DOC${String(doctors.length + 1).padStart(3, '0')}`,
          username: doctorForm.email.split('@')[0],
          fullName: doctorForm.fullName,
          email: doctorForm.email,
          phoneNumber: doctorForm.phoneNumber || undefined,
          role: "doctor",
          isActive: true,
          specialization: "Blood Test Specialist",
          experience: parseInt(doctorForm.experience),
          licenseNumber: doctorForm.licenseNumber,
          department: "Blood Test Department",
          address: doctorForm.address || undefined,
          dateOfBirth: doctorForm.dateOfBirth || undefined,
          createdAt: new Date().toISOString()
        };
        setDoctors([...doctors, newDoctor]);
        showToast("New doctor added successfully!", "success");
      }

      setShowDoctorModal(false);
    } catch (error: any) {
      console.error("Error saving doctor:", error);
      showToast("Unable to save doctor. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors based on search and filters
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && doctor.isActive) ||
                         (filterStatus === "inactive" && !doctor.isActive);
    
    return matchesSearch && matchesStatus;
  });

    return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blood Test Doctors</h1>
            <p className="text-muted-foreground">Manage blood test specialists and their schedules</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Doctors</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-green-500 text-xs font-medium mt-2">↑ 8% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
              <p className="text-green-500 text-xs font-medium mt-2">↑ 12% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-violet-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <UserX className="h-5 w-5 text-violet-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.inactive}</div>
              <p className="text-violet-500 text-xs font-medium mt-2">→ 2% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-amber-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Experience</CardTitle>
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.averageExperience}y</div>
              <p className="text-amber-500 text-xs font-medium mt-2">↑ 5% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Find blood test doctors by name, email, phone, or license</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search blood test doctors..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex gap-4">
                <select
                  value={filterStatus}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                {/* Add Button */}
                <Button onClick={handleAddDoctor} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4" />
                  Add Doctor
                </Button>
              </div>
            </div>

            {/* Active Filters Info */}
            {(filterStatus !== "all" || searchTerm) && (
              <div className="mt-4 flex items-center gap-2 text-sm flex-wrap">
                <span className="text-muted-foreground font-medium">Active filters:</span>
                {searchTerm && (
                  <Badge variant="secondary">Search: "{searchTerm}"</Badge>
                )}
                {filterStatus !== "all" && (
                  <Badge variant="secondary">Status: {filterStatus}</Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Doctors Table */}
        <Card>
          <CardHeader>
            <CardTitle>Blood Test Specialists</CardTitle>
            <CardDescription>Manage and monitor blood test doctors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                          <span className="text-muted-foreground">Loading blood test doctors...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                            <Shield className="w-8 h-8 text-destructive" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Error Loading Doctors</h3>
                          <p className="text-muted-foreground mb-4">{error}</p>
                          <Button onClick={fetchDoctors} variant="destructive">
                            Try Again
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredDoctors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">No Blood Test Doctors Found</h3>
                          <p className="text-muted-foreground">No doctors match your current search criteria.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDoctors.map((doctor) => (
                      <TableRow key={doctor._id}>
                        <TableCell>
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Shield className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{doctor.fullName}</div>
                              <div className="text-sm text-muted-foreground">{doctor.licenseNumber}</div>
                              <Badge variant="secondary" className="mt-1 bg-amber-100 text-amber-700 border-amber-200">
                                Blood Test Specialist
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{doctor.experience} years</span>
                            <div className={`w-2 h-2 rounded-full ${
                              doctor.experience && doctor.experience >= 10 
                                ? 'bg-green-500' 
                                : doctor.experience && doctor.experience >= 5 
                                ? 'bg-amber-500' 
                                : 'bg-blue-500'
                            }`}></div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{doctor.phoneNumber}</div>
                            <div className="text-sm text-muted-foreground">{doctor.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary"
                            className={`flex items-center gap-1 ${
                              doctor.isActive 
                                ? "bg-green-100 text-green-700 border-green-200" 
                                : "bg-violet-100 text-violet-700 border-violet-200"
                            }`}
                          >
                            {doctor.isActive ? (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditDoctor(doctor)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDoctorToToggle(doctor);
                                setShowDeleteConfirm(true);
                              }}
                              className={doctor.isActive ? "text-violet-600 hover:text-violet-700 hover:bg-violet-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                            >
                              {doctor.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Modal */}
        <Dialog open={showDoctorModal} onOpenChange={setShowDoctorModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
                  </DialogTitle>
                  <DialogDescription className="text-base mt-1">
                    {editingDoctor ? "Update doctor information and credentials" : "Create new blood test specialist account"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={doctorForm.fullName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDoctorForm({ ...doctorForm, fullName: e.target.value })}
                      placeholder="Dr. Nguyen Van A"
                      className={`h-11 ${formErrors.fullName ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                    />
                    {formErrors.fullName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={doctorForm.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                      placeholder="dr.nguyen@lab.com"
                      className={`h-11 ${formErrors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                    />
                    {formErrors.email && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Phone Number
                    </label>
                    <Input
                      type="text"
                      value={doctorForm.phoneNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDoctorForm({ ...doctorForm, phoneNumber: e.target.value })}
                      placeholder="0987654321"
                      className="h-11 focus:border-green-500"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Date of Birth
                    </label>
                    <Input
                      type="date"
                      value={doctorForm.dateOfBirth}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDoctorForm({ ...doctorForm, dateOfBirth: e.target.value })}
                      className="h-11 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Shield className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Experience */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      Experience (years) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={doctorForm.experience}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
                      placeholder="15"
                      className={`h-11 ${formErrors.experience ? 'border-red-500 focus:border-red-500' : 'focus:border-amber-500'}`}
                    />
                    {formErrors.experience && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {formErrors.experience}
                      </p>
                    )}
                  </div>

                  {/* License Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      License Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={doctorForm.licenseNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })}
                      placeholder="DOC123456"
                      className={`h-11 ${formErrors.licenseNumber ? 'border-red-500 focus:border-red-500' : 'focus:border-amber-500'}`}
                    />
                    {formErrors.licenseNumber && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {formErrors.licenseNumber}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                      Address
                    </label>
                    <Input
                      type="text"
                      value={doctorForm.address}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDoctorForm({ ...doctorForm, address: e.target.value })}
                      placeholder="123 Le Loi Street, Ho Chi Minh City"
                      className="h-11 focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Specialization Info */}
              <div className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Blood Test Specialist</h4>
                    <p className="text-sm text-gray-600">Department: Blood Test Department</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-gray-100">
              <Button 
                variant="outline" 
                onClick={() => setShowDoctorModal(false)} 
                disabled={loading}
                className="h-11 px-6"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveDoctor} 
                disabled={loading}
                className="h-11 px-6 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    {editingDoctor ? "Update Doctor" : "Create Doctor"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Action Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {doctorToToggle?.isActive ? "Deactivate Doctor?" : "Activate Doctor?"}
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to {doctorToToggle?.isActive ? 'deactivate' : 'activate'} Dr. {doctorToToggle?.fullName} from blood test department?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowDeleteConfirm(false);
                setDoctorToToggle(null);
              }}>
                Cancel
              </Button>
              <Button 
                variant={doctorToToggle?.isActive ? "destructive" : "default"}
                onClick={() => doctorToToggle && handleToggleStatus(doctorToToggle)}
                className={doctorToToggle?.isActive ? "bg-violet-600 hover:bg-violet-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
              >
                {doctorToToggle?.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Doctors;

